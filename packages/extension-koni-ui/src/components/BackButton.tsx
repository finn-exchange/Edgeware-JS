// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@subwallet/extension-koni-ui/components/Button';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

interface Props {
  className?: string;
  onClick: () => void;
}

function BackButton ({ className, onClick }: Props): React.ReactElement<Props> {
  return (
    <Button
      className={className}
      onClick={onClick}
    >
      <FontAwesomeIcon
        className='back-button__arrow-left-icon'
        // @ts-ignore
        icon={faArrowLeft}
        size='sm'
      />
    </Button>
  );
}

export default styled(BackButton)(({ theme }: ThemeProps) => `
  background: ${theme.backButtonBackground};
  margin-right: 11px;
  width: 42px;

  .back-button__arrow-left-icon {
    color: ${theme.backButtonTextColor};
    display: block;
    margin: auto;
  }

  &:not(:disabled):hover {
    background: ${theme.backButtonBackgroundHover};
  }
`);
