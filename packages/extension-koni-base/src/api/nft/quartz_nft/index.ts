// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiProps, NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { SUPPORTED_NFT_NETWORKS } from '@subwallet/extension-koni-base/api/nft/config';
import { BaseNftApi } from '@subwallet/extension-koni-base/api/nft/nft';
import { hexToStr, hexToUTF16, parseIpfsLink, utf16ToString } from '@subwallet/extension-koni-base/utils/utils';

import { deserializeNft } from './protobuf';

interface CollectionProperties {
  schemaVersion: string,
  offchainSchema: string,
  constOnChainSchema: string,
  variableOnChainSchema: {
    collectionCover: string
  },
  tokenPrefix: string,
  description: number[],
  name: number[]
  owner: string
}

export default class QuartzNftApi extends BaseNftApi {
  // eslint-disable-next-line no-useless-constructor
  constructor (api: ApiProps | null, addresses: string[], chain: string) {
    super(api, addresses, chain);
  }

  /**
   * Retrieve total number of ever created collections
   *
   * @returns number of created collection
   */
  public async getCreatedCollectionCount (): Promise<number> {
    if (!this.dotSamaApi) {
      return 0;
    }

    // @ts-ignore
    // noinspection TypeScriptValidateJSTypes
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    return (await this.dotSamaApi.api.rpc.unique.collectionStats()).toJSON().created as number;
  }

  /**
    * Retrieve all NFT token IDs owned by the address (within a collection)
    *
    * @param collectionId: Id of the collection
    * @param address: address of account
    * @returns the array of NFT token IDs
    */
  public async getAddressTokens (collectionId: number, address: string): Promise<any> {
    if (!this.dotSamaApi) {
      return;
    }

    // noinspection TypeScriptValidateJSTypes
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
    return (await this.dotSamaApi.api.rpc.unique.accountTokens(collectionId, { Substrate: address })).toJSON();
  }

  /**
   * Retrieve collection properties for a given Collection ID
   *
   * @param collectionId: Id of the collection
   * @returns collection properties
   */
  public async getCollectionProperties (collectionId: number) {
    if (!this.dotSamaApi) {
      return;
    }

    // @ts-ignore
    // noinspection TypeScriptValidateJSTypes
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    return (await this.dotSamaApi.api.rpc.unique.collectionById(collectionId)).toJSON() as CollectionProperties;
  }

  /**
    * Retrieve and deserialize nft details
    *
    *
    * @param collectionProperties: Id of the collection
    * @param collectionId: Collection ID
    * @param tokenId: Token ID
    * @param locale: Output locale (default is "en")
    * @returns tokenData: Token data object
    */
  public async getNftData (collectionProperties: CollectionProperties, collectionId: number, tokenId: number, locale = 'en') {
    if (!this.dotSamaApi) {
      return;
    }

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const constMetadata = (await this.dotSamaApi.api.rpc.unique.constMetadata(collectionId, tokenId)).toHuman() as string;
    const schemaRead = hexToStr(collectionProperties.constOnChainSchema);
    const nftProps = hexToUTF16(constMetadata);
    const properties = deserializeNft(schemaRead, nftProps, locale);

    let tokenImage = '';
    const schemaVersion = collectionProperties.schemaVersion;

    if (schemaVersion === 'ImageURL') {
      // Replace {id} with token ID
      tokenImage = hexToStr(collectionProperties.offchainSchema);
      tokenImage = tokenImage.replace('{id}', `${tokenId}`);
    } else {
      // TBD: Query from the RESTful service
    }

    let collectionImage = '';

    if (collectionProperties.variableOnChainSchema && collectionProperties.variableOnChainSchema.collectionCover) {
      collectionImage = `https://ipfs.unique.network/ipfs/${collectionProperties.variableOnChainSchema.collectionCover}`;
    } else {
      // TBD: Query from the RESTful service
    }

    return {
      prefix: hexToStr(collectionProperties.tokenPrefix),
      collectionName: utf16ToString(collectionProperties.name),
      collectionDescription: utf16ToString(collectionProperties.description),
      collectionImage: collectionImage,
      properties: properties,
      image: tokenImage
    };
  }

  public async handleNfts (updateItem: (data: NftItem) => void, updateCollection: (data: NftCollection) => void, updateReady: (ready: boolean) => void) {
    const collectionCount = await this.getCreatedCollectionCount();
    const collectionPropertiesMap: Record<number, any> = {};
    const collectionIds: number[] = [];

    const addressTokenDict: any[] = [];
    let allNftId: string[] = [];
    const nftMap: Record<string, string> = {};

    try {
      for (let i = 0; i < collectionCount; i++) {
        collectionIds.push(i);
      }

      for (let i = 0; i < collectionCount; i++) {
        for (const address of this.addresses) {
          if (collectionPropertiesMap[i] !== null) {
            addressTokenDict.push({ i, account: address });
          }
        }
      }

      const _handleCollectionPropertiesMap = Promise.all(collectionIds.map(async (id) => {
        collectionPropertiesMap[id] = await this.getCollectionProperties(id);
      }));

      const _handleAddressTokenDict = Promise.all(addressTokenDict.map(async (item: Record<string | number, string | number>) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const nftIds = await this.getAddressTokens(item.i as number, item.account as string);

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (nftIds && nftIds.length > 0) {
            allNftId = allNftId.concat(nftIds as string[]);

            for (const nftId of nftIds) {
              nftMap[nftId as string] = item.i as string;
            }
          }
        } catch (e) {}
      }));

      await Promise.all([
        _handleCollectionPropertiesMap,
        _handleAddressTokenDict
      ]);

      if (allNftId.length <= 0) {
        updateReady(true);
      }

      await Promise.all(allNftId.map(async (tokenId) => {
        const collectionId = nftMap[tokenId];
        const collectionProperties = collectionPropertiesMap[parseInt(collectionId)] as CollectionProperties;

        const nftData = await this.getNftData(collectionProperties, parseInt(collectionId), parseInt(tokenId));

        if (nftData) {
          const parsedItem = {
            id: tokenId.toString(),
            name: nftData.prefix + '#' + tokenId.toString(),
            image: this.parseUrl(nftData.image),
            external_url: `https://scan-quartz.unique.network/QUARTZ/tokens/${collectionId}/${tokenId}`,
            collectionId: collectionId.toString(),
            properties: nftData.properties,
            rarity: '',
            chain: SUPPORTED_NFT_NETWORKS.quartz
          } as NftItem;

          updateItem(parsedItem);

          const parsedCollection = {
            collectionId: collectionId.toString(),
            collectionName: nftData.collectionName,
            image: parseIpfsLink(nftData.image),
            chain: SUPPORTED_NFT_NETWORKS.quartz
          } as NftCollection;

          updateCollection(parsedCollection);
          updateReady(true);
        }
      }));
    } catch (e) {
      console.error('Failed to fetch quartz nft', e);
    }
  }

  public async fetchNfts (updateItem: (data: NftItem) => void, updateCollection: (data: NftCollection) => void, updateReady: (ready: boolean) => void): Promise<number> {
    try {
      await this.connect();
      await this.handleNfts(updateItem, updateCollection, updateReady);
    } catch (e) {
      return 0;
    }

    return 1;
  }
}
