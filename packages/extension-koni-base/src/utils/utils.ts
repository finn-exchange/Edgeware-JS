// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CrowdloanParaState } from '@subwallet/extension-base/background/KoniTypes';
import { ethereumChains } from '@subwallet/extension-koni-base/api/dotsama/api-helper';
import { PINATA_IPFS_GATEWAY } from '@subwallet/extension-koni-base/api/nft/config';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';

import { BN, hexToU8a, isHex } from '@polkadot/util';
import { decodeAddress, encodeAddress, ethereumEncode, isEthereumAddress } from '@polkadot/util-crypto';

export const notDef = (x: any) => x === null || typeof x === 'undefined';
export const isDef = (x: any) => !notDef(x);
export const nonEmptyArr = (x: any) => Array.isArray(x) && x.length > 0;
export const isEmptyArray = (x: any) => !Array.isArray(x) || (Array.isArray(x) && x.length === 0);

export function isAccountAll (address: string): boolean {
  return address === ALL_ACCOUNT_KEY;
}

export function reformatAddress (address: string, networkPrefix: number, isEthereum = false): string {
  if (isEthereumAddress(address)) {
    return address;
  }

  if (isAccountAll(address)) {
    return address;
  }

  const publicKey = decodeAddress(address);

  if (isEthereum) {
    return ethereumEncode(publicKey);
  }

  if (networkPrefix < 0) {
    return address;
  }

  return encodeAddress(publicKey, networkPrefix);
}

export function filterAddressByNetworkKey (addresses: string[], networkKey: string) {
  if (ethereumChains.indexOf(networkKey) > -1) {
    return addresses.filter((address) => {
      return isEthereumAddress(address);
    });
  } else {
    return addresses.filter((address) => {
      return !isEthereumAddress(address);
    });
  }
}

export function categoryAddresses (addresses: string[]) {
  const substrateAddresses: string[] = [];
  const evmAddresses: string[] = [];

  addresses.forEach((address) => {
    if (isEthereumAddress(address)) {
      evmAddresses.push(address);
    } else {
      substrateAddresses.push(address);
    }
  });

  return [substrateAddresses, evmAddresses];
}

export function convertToEvmAddress (substrateAddress: string): string {
  const addressBytes = decodeAddress(substrateAddress);

  return ethereumEncode('0x' + Buffer.from(addressBytes.subarray(0, 20)).toString('hex'));
}

export function isUrl (targetString: string) {
  let url;

  try {
    url = new URL(targetString);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
}

export function inJestTest () {
  return process.env.JEST_WORKER_ID !== undefined;
}

export const parseIpfsLink = (ipfsLink: string) => {
  if (!ipfsLink.includes('ipfs://ipfs/')) {
    return ipfsLink;
  }

  return PINATA_IPFS_GATEWAY + ipfsLink.split('ipfs://ipfs/')[1];
};

export function hexToStr (buf: string): string {
  let str = '';
  let hexStart = buf.indexOf('0x');

  if (hexStart < 0) {
    hexStart = 0;
  } else {
    hexStart = 2;
  }

  for (let i = hexStart, strLen = buf.length; i < strLen; i += 2) {
    const ch = buf[i] + buf[i + 1];
    const num = parseInt(ch, 16);

    // eslint-disable-next-line eqeqeq
    if (num != 0) {
      str += String.fromCharCode(num);
    } else {
      break;
    }
  }

  return str;
}

// eslint-disable-next-line camelcase
export function utf16ToString (uInt16Array: Array<number>): string {
  let str = '';

  // eslint-disable-next-line camelcase
  for (let i = 0; i < uInt16Array.length; i++) {
    str += String.fromCharCode(uInt16Array[i]);
  }

  return str;
}

export function hexToUTF16 (hex: string): Uint8Array {
  const buf = [];
  let hexStart = hex.indexOf('0x');

  if (hexStart < 0) {
    hexStart = 0;
  } else {
    hexStart = 2;
  }

  for (let i = hexStart, strLen = hex.length; i < strLen; i += 2) {
    const ch = hex[i] + hex[i + 1];
    const num = parseInt(ch, 16);

    buf.push(num);
  }

  return new Uint8Array(buf);
}

export const isValidAddress = (address: string) => {
  try {
    encodeAddress(
      isHex(address)
        ? hexToU8a(address)
        : decodeAddress(address)
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const toUnit = (balance: number, decimals: number) => {
  if (balance === 0) {
    return 0;
  }

  return balance / (10 ** decimals);
};

export function sumBN (inputArr: BN[]) {
  let rs = new BN(0);

  inputArr.forEach((input) => {
    rs = rs.add(input);
  });

  return rs;
}

export const convertFundStatus = (status: string) => {
  if (status === 'Won' || status === 'Retiring') {
    return CrowdloanParaState.COMPLETED;
  } else if (status === 'Started') {
    return CrowdloanParaState.ONGOING;
  } else if (status === 'Dissolved') {
    return CrowdloanParaState.FAILED;
  } else {
    return undefined;
  }
};

export const isAddressesEqual = (addresses: string[], prevAddresses: string[]) => {
  if (addresses.length !== prevAddresses.length) {
    return false;
  }

  for (const address of addresses) {
    if (!prevAddresses.includes(address)) {
      return false;
    }
  }

  return true;
};
