// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CrowdloanParaState } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';

export type CrowdloanItemType = {
  networkKey: string;
  contribute: string | BigN;
  contributeToUsd: string | BigN;
  networkDisplayName: string;
  groupDisplayName: string;
  logo: string;
  symbol: string;
  paraState?: CrowdloanParaState;
  crowdloanUrl?: string
}

export type TabHeaderItemType = {
  tabId: number;
  label: string;
  lightIcon: string;
  darkIcon: string;
  activatedLightIcon: string;
  activatedDarkIcon: string;
}
