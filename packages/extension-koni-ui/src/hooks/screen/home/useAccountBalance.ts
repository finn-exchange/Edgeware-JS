// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { APIItemState, ChainRegistry, NetWorkGroup, TokenInfo } from '@subwallet/extension-base/background/KoniTypes';
import { AccountBalanceType, CrowdloanContributeValueType } from '@subwallet/extension-koni-ui/hooks/screen/home/types';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { BN_ZERO, getBalances, parseBalancesInfo } from '@subwallet/extension-koni-ui/util';
import { BalanceInfo } from '@subwallet/extension-koni-ui/util/types';
import BigN from 'bignumber.js';
import { useSelector } from 'react-redux';

function getCrowdloadChainRegistry (groups: NetWorkGroup[], chainRegistryMap: Record<string, ChainRegistry>): ChainRegistry | null {
  if (groups.includes('POLKADOT_PARACHAIN') && chainRegistryMap.polkadot) {
    return chainRegistryMap.polkadot;
  }

  if (groups.includes('KUSAMA_PARACHAIN') && chainRegistryMap.kusama) {
    return chainRegistryMap.kusama;
  }

  return null;
}

function getGroupNetworkKey (groups: NetWorkGroup[]): string {
  if (groups.includes('POLKADOT_PARACHAIN')) {
    return 'polkadot';
  }

  if (groups.includes('KUSAMA_PARACHAIN')) {
    return 'kusama';
  }

  return '';
}

function getMainTokenInfo (chainRegistry: ChainRegistry): TokenInfo {
  // chainRegistryMap always has main token
  return Object.values(chainRegistry.tokenMap).find((t) => t.isMainToken) as TokenInfo;
}

function getTokenSymbols (chainRegistry: ChainRegistry): string [] {
  const { tokenMap } = chainRegistry;
  const result: string[] = [];

  chainRegistry.chainTokens.forEach((t) => {
    if (!tokenMap[t]) {
      return;
    }

    result.push(tokenMap[t].symbolAlt || tokenMap[t].symbol);
  });

  return result;
}

export default function useAccountBalance (currentNetworkKey: string,
  showedNetworks: string[],
  crowdloanNetworks: string[]
): AccountBalanceType {
  const { balance: balanceReducer,
    chainRegistry: chainRegistryMap,
    crowdloan: crowdloanReducer,
    networkMetadata: networkMetadataMap,
    price: priceReducer } = useSelector((state: RootState) => state);

  const balanceMap = balanceReducer.details;
  const crowdLoanMap = crowdloanReducer.details;
  const { priceMap, tokenPriceMap } = priceReducer;

  let totalBalanceValue = new BigN(0);
  const networkBalanceMaps: Record<string, BalanceInfo> = {};
  const crowdloanContributeMap: Record<string, CrowdloanContributeValueType> = {};

  showedNetworks.forEach((networkKey) => {
    const registry = chainRegistryMap[networkKey];
    const balanceItem = balanceMap[networkKey];

    if (!registry || !balanceItem) {
      return;
    }

    if (balanceItem.state.valueOf() === APIItemState.NOT_SUPPORT.valueOf()) {
      networkBalanceMaps[networkKey] = {
        symbol: 'Unit',
        balanceValue: BN_ZERO,
        convertedBalanceValue: BN_ZERO,
        detailBalances: [],
        childrenBalances: []
      };

      return;
    }

    if (balanceItem.state.valueOf() !== APIItemState.READY.valueOf()) {
      return;
    }

    const mainTokenInfo = getMainTokenInfo(registry);
    let tokenDecimals, tokenSymbols;

    if (['genshiro_testnet', 'genshiro', 'equilibrium_parachain'].includes(networkKey)) {
      tokenDecimals = [mainTokenInfo.decimals];
      tokenSymbols = [mainTokenInfo.symbolAlt || mainTokenInfo.symbol];
    } else {
      tokenDecimals = registry.chainDecimals;
      tokenSymbols = getTokenSymbols(registry);
    }

    const balanceInfo = parseBalancesInfo(priceMap, tokenPriceMap, {
      networkKey,
      tokenDecimals,
      tokenSymbols,
      balanceItem
    }, registry.tokenMap);

    networkBalanceMaps[networkKey] = balanceInfo;
    totalBalanceValue = totalBalanceValue.plus(balanceInfo.convertedBalanceValue);

    if (balanceInfo.childrenBalances && balanceInfo.childrenBalances.length) {
      balanceInfo.childrenBalances.forEach((c) => {
        totalBalanceValue = totalBalanceValue.plus(c.convertedBalanceValue);
      });
    }
  });

  crowdloanNetworks.forEach((networkKey) => {
    const networkMetadata = networkMetadataMap[networkKey];

    if (!networkMetadata ||
      !['POLKADOT_PARACHAIN', 'KUSAMA_PARACHAIN'].some((g) => networkMetadata.groups.includes(g as NetWorkGroup))) {
      return;
    }

    const registry = getCrowdloadChainRegistry(networkMetadata.groups, chainRegistryMap);
    const crowdLoanItem = crowdLoanMap[networkKey];

    if (!registry ||
        !crowdLoanItem ||
        crowdLoanItem.state.valueOf() !== APIItemState.READY.valueOf()) {
      return;
    }

    const groupNetworkKey = getGroupNetworkKey(networkMetadata.groups);
    const price = groupNetworkKey ? priceMap[groupNetworkKey] : undefined;

    const contributeInfo = getBalances({
      balance: crowdLoanItem.contribute,
      decimals: registry.chainDecimals[0],
      symbol: registry.chainTokens[0],
      price
    });

    crowdloanContributeMap[networkKey] = {
      paraState: crowdLoanItem.paraState,
      contribute: contributeInfo
    };

    if (['all', 'polkadot', 'kusama'].includes(currentNetworkKey)) {
      totalBalanceValue = totalBalanceValue.plus(contributeInfo.convertedBalanceValue);
    }
  });

  return {
    totalBalanceValue,
    networkBalanceMaps,
    crowdloanContributeMap
  };
}
