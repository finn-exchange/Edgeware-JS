// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetWorkInfo } from '@subwallet/extension-base/background/KoniTypes';
import { ethereumChains } from '@subwallet/extension-koni-base/api/dotsama/api-helper';

const NETWORKS: Record<string, NetWorkInfo> = {
  beresheetEvm: {
    chain: 'Beresheet - EVM',
    genesisHash: '0x742a2ca70c2fda6cee4f8df98d64c4c670a052d9568058982dad9d5a7a135c5c___EVM',
    ss58Format: 7,
    provider: 'wss://beresheet.edgewa.re/evm',
    groups: ['TEST_NET'],
    isEthereum: true,
    nativeToken: 'EDG',
    decimals: 18
  },
  edgEvm: {
    chain: 'Edgeware - EVM',
    genesisHash: '0x742a2ca70c2fda6cee4f8df98d64c4c670a052d9568058982dad9d5a7a135c5b___EVM',
    ss58Format: 7,
    provider: 'wss://mainnet.edgewa.re/evm',
    groups: ['MAIN_NET'],
    isEthereum: true,
    nativeToken: 'EDG',
    decimals: 18
  },
  edgeware: {
    chain: 'Edgeware',
    genesisHash: '0x742a2ca70c2fda6cee4f8df98d64c4c670a052d9568058982dad9d5a7a135c5b',
    ss58Format: 7,
    provider: 'wss://edgeware.api.onfinality.io/public-ws',
    groups: ['MAIN_NET'],
    nativeToken: 'EDG'
  }
};

export const EVM_NETWORKS = ethereumChains.reduce((previousValue, currentValue) => {
  if (NETWORKS[currentValue]) {
    previousValue[currentValue] = NETWORKS[currentValue];
  }

  return previousValue;
}, {} as Record<string, NetWorkInfo>);
export default NETWORKS;
