// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetWorkMetadataDef } from '@subwallet/extension-base/background/KoniTypes';
import { getAllNetworkMetadata } from '@subwallet/extension-koni-ui/messaging';
import { store } from '@subwallet/extension-koni-ui/stores';
import { useEffect } from 'react';

function updateNetworkMetadata (metadataDefs: NetWorkMetadataDef[]): void {
  store.dispatch({ type: 'networkMetadata/update', payload: metadataDefs });
}

export default function useSetupNetworkMetadata (): void {
  useEffect(() => {
    console.log('--- Setup redux: networkMetadata');
    getAllNetworkMetadata().then((metadataDefs) => {
      updateNetworkMetadata(metadataDefs);
    }).catch(console.error);
  }, []);
}
