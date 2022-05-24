// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getLogoByNetworkKey } from '@subwallet/extension-koni-ui/util';
import React from 'react';
import styled from 'styled-components';

interface Props {
  className: string;
  networkKey: string;
  symbol: string;
  networkName: string;
}

function TokenItem ({ className = '', networkKey, networkName, symbol }: Props): React.ReactElement<Props> {
  return (
    <div className={className}>
      <img
        alt={networkKey}
        className='token-item-logo'
        src={getLogoByNetworkKey(networkKey)}
      />
      <div className='token-item-right-content'>
        <div className='token-item__symbol'>{symbol}</div>
        <div className='token-item__chain'>{networkName}</div>
      </div>
    </div>
  );
}

export default React.memo(styled(TokenItem)(({ theme }: ThemeProps) => `
  display: flex;
  align-items: center;

  .token-item__symbol {
    font-size: 16px;
    line-height: 20px;
    color: ${theme.textColor};
    font-weight: 500;
  }

  .token-item__chain {
    font-size: 12px;
    line-height: 20px;
  }

  .token-item-logo {
    height: 30px;
    min-width: 30px;
    border-radius: 50%;
    margin-right: 6px;
    border: 2px solid transparent;
    background: ${theme.identiconBackground};
  }
`));
