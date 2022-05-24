// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChainRegistry, TokenInfo } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { BalanceFormatType, SenderInputAddressType } from '@subwallet/extension-koni-ui/components/types';
import { isAccountAll } from '@subwallet/extension-koni-ui/util';

import { BN, BN_HUNDRED } from '@polkadot/util';

function getDefaultAddress (address: string, accounts: AccountJson[]): string {
  return isAccountAll(address) ? accounts[1].address : address;
}

function getDefaultToken (networkKey: string, chainRegistryMap: Record<string, ChainRegistry>): [string, string] | null {
  const firstNetworkKey = Object.keys(chainRegistryMap)[0];

  if (networkKey === 'all'
    ? (!firstNetworkKey || !chainRegistryMap[firstNetworkKey])
    : !chainRegistryMap[networkKey]) {
    return null;
  }

  const token = networkKey === 'all'
    ? getMainTokenInfo(firstNetworkKey, chainRegistryMap).symbol
    : getMainTokenInfo(networkKey, chainRegistryMap).symbol;

  return networkKey === 'all' ? [firstNetworkKey, token] : [networkKey, token];
}

function getPartialFee (fee: string | null, feeSymbol: string | null | undefined, selectedToken: string, mainTokenSymbol: string): BN {
  if (!fee) {
    return new BN('0');
  }

  if (feeSymbol) {
    if (feeSymbol !== selectedToken) {
      return new BN('0');
    }
  } else {
    // feeSymbol is null or undefined => use mainTokenSymbol
    if (selectedToken !== mainTokenSymbol) {
      return new BN('0');
    }
  }

  return new BN(fee);
}

export function getBalanceFormat (networkKey: string, token: string, chainRegistryMap: Record<string, ChainRegistry>): BalanceFormatType {
  const tokenInfo = chainRegistryMap[networkKey].tokenMap[token];

  return [tokenInfo.decimals, tokenInfo.symbol, tokenInfo.symbolAlt];
}

export function getMaxTransferAndNoFees (
  fee: string | null,
  feeSymbol: string | null | undefined,
  selectedToken: string,
  mainTokenSymbol: string,
  senderFreeBalance: string,
  existentialDeposit: string): [BN | null, boolean] {
  const partialFee = getPartialFee(fee, feeSymbol, selectedToken, mainTokenSymbol);
  const adjFee = partialFee.muln(110).div(BN_HUNDRED);
  const maxTransfer = (new BN(senderFreeBalance)).sub(adjFee);

  return maxTransfer.gt(new BN(existentialDeposit))
    ? [maxTransfer, false]
    : [null, true];
}

export function getMainTokenInfo (networkKey: string, chainRegistryMap: Record<string, ChainRegistry>): TokenInfo {
  // chainRegistryMap always has main token
  return Object.values(chainRegistryMap[networkKey].tokenMap).find((t) => t.isMainToken) as TokenInfo;
}

export function getDefaultValue (
  networkKey: string,
  isCurrentNetworkInfoReady: boolean,
  address: string | undefined,
  chainRegistryMap: Record<string, ChainRegistry>,
  accounts: AccountJson[]): SenderInputAddressType | null {
  if (!address || !isCurrentNetworkInfoReady) {
    return null;
  }

  const defaultToken = getDefaultToken(networkKey, chainRegistryMap);

  if (!defaultToken) {
    return null;
  }

  return {
    address: getDefaultAddress(address, accounts),
    networkKey: defaultToken[0],
    token: defaultToken[1]
  };
}

export function isContainGasRequiredExceedsError (message: string): boolean {
  return message.toLowerCase().includes('gas required exceeds');
}

export function getAuthTransactionFeeInfo (
  fee: string | null,
  feeDecimal: number | null,
  feeSymbol: string | null | undefined,
  mainTokenInfo: TokenInfo,
  tokenMap: Record<string, TokenInfo>): [string | null, number, string] {
  const decimal = feeDecimal || mainTokenInfo.decimals;
  let symbol;

  if (feeSymbol) {
    symbol = tokenMap[feeSymbol].symbolAlt || feeSymbol;
  } else {
    symbol = mainTokenInfo.symbol;
  }

  return [
    fee,
    decimal,
    symbol
  ];
}
