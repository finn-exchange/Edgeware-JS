// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import nftsEmptyData from '@subwallet/extension-koni-ui/assets/nft-coming-soon.png';
import useTranslation from '@subwallet/extension-koni-ui/hooks/useTranslation';
import React from 'react';
import styled from 'styled-components';

interface Props {
  className?: string;
}

function NftsEmptyList ({ className }: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className={`${className || ''} empty-list nfts-empty-list`}>
      {/* <img
        alt='Empty'
        className='empty-list__img'
        src={nftsEmptyData}
      /> */}
      <div className='empty-list__text'>
        <div>{t<string>('Your NFTs will appear here')}</div>
      </div>
    </div>
  );
}

export default styled(NftsEmptyList)`
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;

  .empty-list__img {
    height: 192px;
    width: auto;
    position: absolute;
    left: 0;
    right: 0;
    top: 20px;
    margin: 0 auto;
  }

  .empty-list__text {
    font-size: 15px;
    line-height: 26px;
    text-align: center;
    font-weight: 500;
  }
`;
