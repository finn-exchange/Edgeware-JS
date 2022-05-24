// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import NETWORKS from '@subwallet/extension-koni-base/api/endpoints';
import FormatBalance from '@subwallet/extension-koni-ui/components/FormatBalance';
import { useTranslation } from '@subwallet/extension-koni-ui/components/translate';
import { BalanceFormatType } from '@subwallet/extension-koni-ui/components/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/util';
import reformatAddress from '@subwallet/extension-koni-ui/util/reformatAddress';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import DonateInputAddress from './DonateInputAddress/index';

interface Props {
  networkKey: string;
  className: string;
  onchange: (address: string) => void;
  balance: string;
  balanceFormat: BalanceFormatType;
}

function ReceiverInputAddress ({ balance, balanceFormat, className = '', networkKey, onchange }: Props): React.ReactElement {
  const { t } = useTranslation();
  const networkPrefix = NETWORKS[networkKey].ss58Format;
  const [receiveAddress, setReceiveAddress] = useState<string>('');

  const formattedAddress = useMemo<string>(() => {
    if (receiveAddress) {
      return reformatAddress(receiveAddress, networkPrefix);
    }

    return '';
  }, [receiveAddress, networkPrefix]);

  const onChangeReceiveAddress = useCallback((address: string) => {
    onchange(address);
    setReceiveAddress(address);
  }, [onchange]);

  return (
    <div className={className}>
      <DonateInputAddress
        autoPrefill={false}
        className={'receive-input-address'}
        help={t<string>('Select a contact or paste the address you want to donate to.')}
        isSetDefaultValue={false}
        label={t<string>('Donate to address')}
        networkPrefix={networkPrefix}
        onChange={onChangeReceiveAddress}
        type='allPlus'
        withEllipsis
      />

      <div className='receiver-input-address__balance'>
        <FormatBalance
          format={balanceFormat}
          value={balance}
        />
      </div>

      <div className='receiver-input-address__address'>
        {toShort(formattedAddress)}
      </div>
    </div>
  );
}

export default styled(ReceiverInputAddress)(({ theme }: ThemeProps) => `
  position: relative;

  .receiver-input-address__address {
    position: absolute;
    font-size: 14px;
    line-height: 26px;
    color: ${theme.textColor2};
    right: 16px;
    top: 36px;
    pointer-events: none;
  }

  .receive-input-address {
    .input-address-dropdown__input {
      width: 220px !important;
    }
  }

  .receive-input-address .key-pair__address {
    display: none;
  }

  .receiver-input-address__balance {
    position: absolute;
    font-size: 15px;
    line-height: 26px;
    color: ${theme.textColor2};
    right: 16px;
    top: 8px;
    pointer-events: none;
  }

  .format-balance__value {
    font-weight: 400;
    font-size: 14px;
    color: ${theme.textColor};
  }

  .format-balance__postfix {
    color: ${theme.textColor2};
  }
`);
