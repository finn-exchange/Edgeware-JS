// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import failStatus from '@subwallet/extension-koni-ui/assets/fail-status.svg';
import successStatus from '@subwallet/extension-koni-ui/assets/success-status.svg';
import { ActionContext, Button } from '@subwallet/extension-koni-ui/components';
import useTranslation from '@subwallet/extension-koni-ui/hooks/useTranslation';
import { TxResult } from '@subwallet/extension-koni-ui/Popup/Sending/old/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getScanExplorerTransactionHistoryUrl, isSupportScanExplorer } from '@subwallet/extension-koni-ui/util';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

export interface Props extends ThemeProps {
  className?: string;
  txResult: TxResult;
  networkKey: string;
  onResend: () => void;
  successResultText?: string;
  failResultText?: string;
}

function getErrorMessage (txError?: Error | null): string | null {
  if (!txError) {
    return null;
  }

  if (txError.message) {
    return txError.message;
  }

  return null;
}

function SendFundResult ({ className = '', failResultText = 'Send Fund Fail', networkKey, onResend, successResultText = 'Send Fund Successful', txResult: { extrinsicHash, isTxSuccess, txError } }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const navigate = useContext(ActionContext);
  const _backToHome = useCallback(
    () => {
      window.localStorage.setItem('popupNavigation', '/');
      navigate('/');
    },
    [navigate]
  );

  const viewTransactionBtn = (networkKey: string, extrinsicHash: string) => {
    if (isSupportScanExplorer(networkKey)) {
      return (
        <a
          className='kn-send-fund-stt-btn kn-view-history-btn'
          href={getScanExplorerTransactionHistoryUrl(networkKey, extrinsicHash)}
          rel='noreferrer'
          target={'_blank'}
        >
          {t<string>('View Transaction')}
        </a>
      );
    }

    return (
      <span className='kn-send-fund-stt-btn kn-view-history-btn -disabled'>
        {t<string>('View Transaction')}
      </span>
    );
  };

  const errorMessage = getErrorMessage(txError);

  return (
    <div className={`kn-send-fund-result-wrapper ${className}`}>
      {isTxSuccess
        ? <div className='kn-send-fund-result'>
          <img
            alt='success'
            className='kn-status-img'
            src={successStatus}
          />
          <div className='kn-stt-text'>{t<string>(successResultText)}</div>
          <div
            className='kn-stt-subtext'
          >{t<string>('Your request has been confirmed. You can track its progress on the Transaction History page.')}</div>
          <Button
            className='kn-send-fund-stt-btn'
            onClick={_backToHome}
          >
            {t<string>('Back To Home')}
          </Button>

          {extrinsicHash && viewTransactionBtn(networkKey, extrinsicHash)}
        </div>
        : <div className='kn-send-fund-result'>
          <img
            alt='fail'
            className='kn-status-img'
            src={failStatus}
          />
          <div className='kn-stt-text'>{t<string>(failResultText)}</div>
          <div className='kn-stt-subtext'>
            {extrinsicHash
              ? (t<string>('There was a problem with your request. You can track its progress on the Transaction History page.'))
              : (t<string>('There was a problem with your request.'))
            }

            {errorMessage && (
              <div className={'kn-l-text-danger'}>{errorMessage}</div>
            )}
          </div>

          <Button
            className='kn-send-fund-stt-btn'
            onClick={onResend}
          >
            {t<string>('Resend')}
          </Button>

          {extrinsicHash && viewTransactionBtn(networkKey, extrinsicHash)}
        </div>
      }
    </div>
  );
}

export default React.memo(styled(SendFundResult)(({ theme }: ThemeProps) => `
  margin: 20px 45px 0;

  .kn-send-fund-result {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .kn-status-img {
    width: 120px;
    margin-top: 10px;
    margin-bottom: 32px;
  }

  .kn-stt-text {
    font-size: 20px;
    line-height: 36px;
    color: ${theme.textColor};
    font-weight: 500;
  }

  .kn-stt-subtext {
    color: ${theme.textColor};
    margin-bottom: 30px;
    text-align: center;
    font-size: 14px;
  }

  .kn-send-fund-stt-btn {
    margin-bottom: 10px;
  }

  .kn-l-text-danger {
    color: ${theme.iconDangerColor};
  }

  .kn-send-fund-stt-btn > .children {
    font-weight: 500;
  }

  .kn-view-history-btn {
    background-color: ${theme.buttonBackground2};
    color: ${theme.buttonTextColor3};
    cursor: pointer;
    display: flex;
    width: 100%;
    height: 48px;
    box-sizing: border-box;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    line-height: 26px;
    padding: 0 1rem;
    position: relative;
    text-align: center;
    text-decoration: none;
    align-items: center;
    justify-content: center;
    font-weight: 500;

    &.-disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
`));
