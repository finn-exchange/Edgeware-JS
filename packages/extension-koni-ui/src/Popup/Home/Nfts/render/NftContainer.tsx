// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from '@subwallet/extension-koni-ui/components/Link';
import useFetchNftExtra from '@subwallet/extension-koni-ui/hooks/screen/home/useFetchNftTransferExtra';
import EmptyList from '@subwallet/extension-koni-ui/Popup/Home/Nfts/render/EmptyList';
import { _NftCollection, _NftItem } from '@subwallet/extension-koni-ui/Popup/Home/Nfts/types';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { NFT_PER_ROW } from '@subwallet/extension-koni-ui/util';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { isEthereumAddress } from '@polkadot/util-crypto';

const NftCollection = React.lazy(() => import('@subwallet/extension-koni-ui/Popup/Home/Nfts/render/NftCollection'));
const NftCollectionPreview = React.lazy(() => import('./NftCollectionPreview'));
const Spinner = React.lazy(() => import('@subwallet/extension-koni-ui/components/Spinner'));

interface Props extends ThemeProps {
  className?: string;
  nftList: _NftCollection[];
  totalItems: number;
  totalCollection: number;
  loading: boolean;
  page: number;
  setPage: (newPage: number) => void;
  currentNetwork: string;
  nftGridSize: number;

  showTransferredCollection: boolean;
  setShowTransferredCollection: (val: boolean) => void;

  chosenCollection: _NftCollection;
  setChosenCollection: (val: _NftCollection) => void;

  showCollectionDetail: boolean;
  setShowCollectionDetail: (val: boolean) => void;

  chosenItem: _NftItem;
  setChosenItem: (val: _NftItem) => void;

  showItemDetail: boolean;
  setShowItemDetail: (val: boolean) => void;
}

function NftContainer (
  { chosenCollection,
    chosenItem,
    className,
    currentNetwork,
    loading,
    nftGridSize,
    nftList,
    page,
    setChosenCollection,
    setChosenItem,
    setPage,
    setShowCollectionDetail,
    setShowItemDetail,
    setShowTransferredCollection,
    showCollectionDetail,
    showItemDetail,
    showTransferredCollection,
    totalCollection,
    totalItems }: Props
): React.ReactElement<Props> {
  const selectedNftCollection = useFetchNftExtra(showTransferredCollection, setShowTransferredCollection);
  const [networkKey, setNetworkKey] = useState(currentNetwork);

  const handleShowCollectionDetail = useCallback((data: _NftCollection) => {
    setShowCollectionDetail(true);
    setChosenCollection(data);
  }, [setChosenCollection, setShowCollectionDetail]);

  const { currentAccount: { account: currentAccount } } = useSelector((state: RootState) => state);

  const isEthAccount = isEthereumAddress(currentAccount?.address);

  useEffect(() => {
    if (!showTransferredCollection && selectedNftCollection) { // show collection after transfer
      setChosenCollection(selectedNftCollection);
      setShowCollectionDetail(true);
      setShowTransferredCollection(true);
    }
  }, [selectedNftCollection, setChosenCollection, setShowCollectionDetail, setShowTransferredCollection, showTransferredCollection]);

  useEffect(() => {
    if (loading) {
      setPage(1);
      setShowItemDetail(false);
      setShowCollectionDetail(false);
    }
  }, [loading, setPage, setShowCollectionDetail, setShowItemDetail]);

  useEffect(() => {
    if (networkKey !== currentNetwork) {
      setShowCollectionDetail(false);
      setPage(1);
      setNetworkKey(currentNetwork);
    }
  }, [currentNetwork, networkKey, setPage, setShowCollectionDetail]);

  const handleHideCollectionDetail = useCallback(() => {
    setShowCollectionDetail(false);
  }, [setShowCollectionDetail]);

  const onPreviousClick = useCallback(() => {
    if (page === 1) {
      return;
    }

    setPage(page - 1);
  }, [page, setPage]);

  const onNextClick = useCallback(() => {
    const nextPage = page + 1;

    if (page >= Math.ceil(totalCollection / nftGridSize)) {
      return;
    }

    setPage(nextPage);
  }, [nftGridSize, page, setPage, totalCollection]);

  return (
    <div className={`${className as string} scroll-container`}>
      {loading && <div className={'loading-container'}>
        <Spinner size={'large'} />
      </div>}

      {/* @ts-ignore */}
      {totalItems === 0 && !loading && !showCollectionDetail &&
        <EmptyList />
      }

      {/* @ts-ignore */}
      {!loading && !showCollectionDetail && totalItems > 0 &&
        <div className={'total-title'}>
          {/* @ts-ignore */}
          {totalItems} NFT{totalItems > 1 && 's'} from {totalCollection} collection{totalCollection > 1 && 's'}
        </div>
      }

      {
        !showCollectionDetail &&
        <div className={'grid-container'}>
          {
            !loading && nftList.length > 0 &&
            // @ts-ignore
            nftList.map((item: _NftCollection, index: React.Key | null | undefined) => {
              // @ts-ignore
              return <div key={index}>
                <NftCollectionPreview
                  data={item}
                  onClick={handleShowCollectionDetail}
                />
              </div>;
            })
          }
        </div>
      }

      {
        showCollectionDetail &&
          <NftCollection
            chosenItem={chosenItem}
            currentNetwork={currentNetwork}
            data={chosenCollection}
            onClickBack={handleHideCollectionDetail}
            setChosenItem={setChosenItem}
            setShowItemDetail={setShowItemDetail}
            showItemDetail={showItemDetail}
          />
      }

      {
        // @ts-ignore
        !loading && !showCollectionDetail && totalCollection > nftGridSize &&
        <div className={'pagination'}>
          <div
            className={'nav-item'}
            onClick={onPreviousClick}
          >
            <FontAwesomeIcon
              className='arrowLeftIcon'
              // @ts-ignore
              icon={faArrowLeft}
            />
          </div>
          <div>
            {page}/{Math.ceil(totalCollection / nftGridSize)}
          </div>
          <div
            className={'nav-item'}
            onClick={onNextClick}
          >
            <FontAwesomeIcon
              className='arrowLeftIcon'
              // @ts-ignore
              icon={faArrowRight}
            />
          </div>
        </div>
      }

      {!loading && !showCollectionDetail && !showItemDetail && isEthAccount &&
        <div className={'footer'}>
          <div>Don&apos;t see your NFTs?</div>
          <div>
            <Link
              className={'link'}
              to='/account/import-evm-nft'
            >
              Import NFTs
            </Link>
          </div>
        </div>
      }
    </div>
  );
}

export default React.memo(styled(NftContainer)(({ theme }: Props) => `
  width: 100%;
  padding: 0 25px;
  padding-bottom: 20px;

  .loading-container {
    height: 100%;
    width:100%;
  }

  .nav-item {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 16px;
    border-radius: 5px;
    background-color: ${theme.popupBackground};
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.13);
  }

  .nav-item:hover {
    cursor: pointer;
  }

  .pagination {
    margin-top: 25px;
    margin-bottom: 25px;
    display: flex;
    width: 100%;
    gap: 20px;
    justify-content: center;
  }

  .total-title {
    margin-bottom: 20px;
  }

  .grid-container {
    width: 100%;
    display: grid;
    column-gap: 20px;
    row-gap: 20px;
    justify-items: center;
    grid-template-columns: repeat(${NFT_PER_ROW}, 1fr);
  }

  .footer {
    margin-top: 10px;
    margin-bottom: 10px;
    width: 100%;
    color: #9196AB;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 14px;
  }

  .link {
    color:#ff3b80;
  }

  .link:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`));
