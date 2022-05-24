// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useTranslation from '@subwallet/extension-koni-ui/hooks/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

import transactionHistoryComingSoon from '../../../assets/transaction-history-coming-soon.png';

interface Props extends ThemeProps {
  className?: string;
}

function TransactionHistoryEmptyList ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  return (
    <div className={`${className || ''} empty-list transaction-history-empty-list`}>
      {/* <img
        alt='Empty'
        className='empty-list__img'
        src={transactionHistoryComingSoon}
      /> */}
      <div className='empty-list__text'>{t<string>('Transactions will appear here')}</div>
    </div>
  );
}

export default styled(TransactionHistoryEmptyList)`
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;

  .empty-list__img {
    height: 222px;
    width: auto;
    position: absolute;
    left: 0;
    right: 0;
    top: 20px;
    margin: 0 auto;
  }

  .empty-list__text {
    font-size: 15px;
    font-weight: 500;
    line-height: 26px;
    text-align: center;
  }
`;
