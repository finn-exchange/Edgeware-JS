// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TransactionHistoryItemType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { Button, Warning } from '@subwallet/extension-koni-ui/components';
import LoadingContainer from '@subwallet/extension-koni-ui/components/LoadingContainer';
import Toggle from '@subwallet/extension-koni-ui/components/Toggle';
import useTranslation from '@subwallet/extension-koni-ui/hooks/useTranslation';
import { updateTransactionHistory } from '@subwallet/extension-koni-ui/messaging';
import { Header } from '@subwallet/extension-koni-ui/partials';
import AuthTransaction from '@subwallet/extension-koni-ui/Popup/Sending/old/AuthTransaction';
import InputBalance from '@subwallet/extension-koni-ui/Popup/Sending/old/component/InputBalance';
import useApi from '@subwallet/extension-koni-ui/Popup/Sending/old/hook/useApi';
import { useCall } from '@subwallet/extension-koni-ui/Popup/Sending/old/hook/useCall';
import SendFundResult from '@subwallet/extension-koni-ui/Popup/Sending/old/SendFundResult';
import { TxResult } from '@subwallet/extension-koni-ui/Popup/Sending/old/types';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isAccountAll } from '@subwallet/extension-koni-ui/util';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { DeriveBalancesAll } from '@polkadot/api-derive/types';
import { checkAddress } from '@polkadot/phishing';
import { AccountInfoWithProviders, AccountInfoWithRefCount } from '@polkadot/types/interfaces';
import { BN, BN_HUNDRED, BN_ZERO, isFunction } from '@polkadot/util';

import Available from './component/Available';
import InputAddress from './component/InputAddress';

interface Props extends ThemeProps {
  className?: string;
}

interface ContentProps extends ThemeProps {
  className?: string;
  setWrapperClass: (classname: string) => void;
  api: ApiPromise;
  apiUrl: string;
  currentAccount?: AccountJson | null;
  isEthereum: boolean;
  networkKey: string;
}

function isRefcount (accountInfo: AccountInfoWithProviders | AccountInfoWithRefCount): accountInfo is AccountInfoWithRefCount {
  return !!(accountInfo as AccountInfoWithRefCount).refcount;
}

type ExtractTxResultType = {
  change: string;
  fee?: string;
}

function extractTxResult (result: SubmittableResult): ExtractTxResultType {
  let change = '0';
  let fee;

  const { events } = result;

  const transferEvent = events.find((e) =>
    e.event.section === 'balances' &&
    e.event.method.toLowerCase() === 'transfer'
  );

  if (transferEvent) {
    change = transferEvent.event.data[2]?.toString() || '0';
  }

  const withdrawEvent = events.find((e) =>
    e.event.section === 'balances' &&
    e.event.method.toLowerCase() === 'withdraw');

  if (withdrawEvent) {
    fee = withdrawEvent.event.data[1]?.toString();
  }

  return {
    change,
    fee
  };
}

async function checkPhishing (_senderId: string | null, recipientId: string | null): Promise<[string | null, string | null]> {
  return [
    // not being checked atm
    // senderId
    //   ? await checkAddress(senderId)
    //   : null,
    null,
    recipientId
      ? await checkAddress(recipientId)
      : null
  ];
}

type SupportType = 'NETWORK' | 'ACCOUNT';

function Wrapper ({ className = '', theme }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { currentAccount: { account: currentAccount },
    currentNetwork: { isEthereum, networkKey } } = useSelector((state: RootState) => state);
  const [wrapperClass, setWrapperClass] = useState<string>('');
  const { api, apiUrl, isApiReady, isNotSupport } = useApi(networkKey);

  const isProviderSupportSendFund = !!api && !!api.tx && !!api.tx.balances;

  const notSupportSendFund = (supportType: SupportType = 'NETWORK') => {
    return (
      <div className={'kn-l-screen-content'}>
        <Warning>
          { supportType === 'NETWORK' &&
            t<string>('The action is not supported for the current network. Please switch to another network.')
          }
          { supportType === 'ACCOUNT' &&
            t<string>('The action is not supported for the current account. Please switch to another account.')
          }
        </Warning>
      </div>
    );
  };

  const renderContent = () => {
    if (currentAccount && isAccountAll(currentAccount.address)) {
      return notSupportSendFund('ACCOUNT');
    }

    return (
      isApiReady
        ? isProviderSupportSendFund
          ? (
            <SendFund
              api={api}
              apiUrl={apiUrl}
              className={'send-fund-container'}
              currentAccount={currentAccount}
              isEthereum={isEthereum}
              networkKey={networkKey}
              setWrapperClass={setWrapperClass}
              theme={theme}
            />
          )
          : notSupportSendFund()
        : isNotSupport
          ? notSupportSendFund()
          : (<LoadingContainer />)
    );
  };

  return (
    <div className={`-wrapper ${className} ${wrapperClass}`}>
      <Header
        showAdd
        showCancelButton
        showSearch
        showSettings
        showSubHeader
        subHeaderName={t<string>('Send fund')}
      />

      {renderContent()}
    </div>
  );
}

function SendFund ({ api, apiUrl, className = '', currentAccount, isEthereum, networkKey, setWrapperClass }: ContentProps): React.ReactElement {
  const { t } = useTranslation();
  const propSenderId = currentAccount?.address;
  const [amount, setAmount] = useState<BN | undefined>(BN_ZERO);
  const [hasAvailable] = useState(true);
  const [isProtected, setIsProtected] = useState(false);
  const [isAll, setIsAll] = useState(false);
  const [[maxTransfer, noFees], setMaxTransfer] = useState<[BN | null, boolean]>([null, false]);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [[, recipientPhish], setPhishing] = useState<[string | null, string | null]>([null, null]);
  const balances = useCall<DeriveBalancesAll>(api.derive.balances?.all, [senderId], undefined, apiUrl);
  const accountInfo = useCall<AccountInfoWithProviders | AccountInfoWithRefCount>(api.query.system.account, [senderId], undefined, apiUrl);
  const [extrinsic, setExtrinsic] = useState<SubmittableExtrinsic<'promise'> | null>(null);
  const [isShowTxModal, setShowTxModal] = useState<boolean>(false);
  const [txResult, setTxResult] = useState<TxResult>({ isShowTxResult: false, isTxSuccess: false });
  const { isShowTxResult } = txResult;

  useEffect(() => {
    const fromId = senderId as string;
    const toId = recipientId as string;
    let isSync = true;

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (balances && balances.accountId.eq(fromId) && fromId && toId && isFunction(api.rpc.payment?.queryInfo)) {
      setTimeout((): void => {
        try {
          api.tx.balances
            .transfer(toId, balances.availableBalance)
            .paymentInfo(fromId)
            .then(({ partialFee }): void => {
              const adjFee = partialFee.muln(110).div(BN_HUNDRED);
              const maxTransfer = balances.availableBalance.sub(adjFee);

              if (isSync) {
                setMaxTransfer(
                  maxTransfer.gt(api.consts.balances.existentialDeposit as unknown as BN)
                    ? [maxTransfer, false]
                    : [null, true]
                );
              }
            })
            .catch(console.error);
        } catch (error) {
          console.error((error as Error).message);
        }
      }, 0);
    } else {
      setMaxTransfer([null, false]);
    }

    return () => {
      isSync = false;
    };
  }, [api, balances, propSenderId, recipientId, senderId]);

  useEffect((): void => {
    checkPhishing(senderId, recipientId)
      .then(setPhishing)
      .catch(console.error);
  }, [propSenderId, recipientId, senderId]);

  const noReference = accountInfo
    ? isRefcount(accountInfo)
      ? accountInfo.refcount.isZero()
      : accountInfo.consumers.isZero()
    : true;
  const canToggleAll = !isProtected && balances && balances.accountId.eq(senderId) && maxTransfer && noReference;

  const amountGtAvailableBalance = amount && balances && amount.gt(balances.availableBalance);

  const txParams: unknown[] | (() => unknown[]) | null =
    useMemo(() => {
      return canToggleAll && isAll
        ? isFunction(api.tx.balances.transferAll)
          ? [recipientId, false]
          : [recipientId, maxTransfer]
        : [recipientId, amount];
    }, [amount, api.tx.balances.transferAll, canToggleAll, isAll, maxTransfer, recipientId]);

  const tx: ((...args: any[]) => SubmittableExtrinsic<'promise'>) | null = canToggleAll && isAll && isFunction(api.tx.balances.transferAll)
    ? api.tx.balances.transferAll
    : isProtected
      ? api.tx.balances.transferKeepAlive
      : api.tx.balances.transfer;

  const _onSend = useCallback(() => {
    if (tx) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setExtrinsic(tx(...(
        isFunction(txParams)
          ? txParams()
          : (txParams || [])
      )));

      setShowTxModal(true);
    }
  }, [txParams, tx]);

  const _onCancelTx = useCallback(() => {
    setExtrinsic(null);
    setShowTxModal(true);
  }, []);

  const onGetTxResult = useCallback((isTxSuccess: boolean, extrinsicHash?: string, txError?: Error | null) => {
    setWrapperClass('-disable-header-action');

    setTxResult({
      isShowTxResult: true,
      isTxSuccess,
      txError,
      extrinsicHash
    });

    _onCancelTx();
  }, [_onCancelTx, setWrapperClass]);

  const _onTxSuccess = useCallback((result: SubmittableResult, extrinsicHash?: string) => {
    if (!senderId) {
      return;
    }

    if (result && extrinsicHash) {
      const { change, fee } = extractTxResult(result);

      const item: TransactionHistoryItemType = {
        action: 'send',
        change,
        extrinsicHash,
        fee,
        isSuccess: true,
        networkKey,
        time: Date.now()
      };

      updateTransactionHistory(senderId, networkKey, item, () => {
        onGetTxResult(true, extrinsicHash);
      }).catch((e) => console.log('Error when update Transaction History', e));
    } else {
      onGetTxResult(true);
    }
  }, [senderId, networkKey, onGetTxResult]);

  const _onTxFail = useCallback((result: SubmittableResult | null, error: Error | null, extrinsicHash?: string) => {
    if (!senderId) {
      return;
    }

    if (result && extrinsicHash) {
      const { change, fee } = extractTxResult(result);

      const item: TransactionHistoryItemType = {
        action: 'send',
        change,
        extrinsicHash,
        fee,
        isSuccess: false,
        networkKey,
        time: Date.now()
      };

      updateTransactionHistory(senderId, networkKey, item, () => {
        onGetTxResult(false, extrinsicHash, error);
      }).catch((e) => console.log('Error when update Transaction History', e));
    } else {
      onGetTxResult(false, undefined, error);
    }
  }, [senderId, networkKey, onGetTxResult]);

  const _onResend = useCallback(() => {
    setTxResult({
      isTxSuccess: false,
      isShowTxResult: false,
      txError: undefined
    });

    setWrapperClass('');
  }, [setWrapperClass]);

  const isSameAddress = !!recipientId && !!senderId && (recipientId === senderId);

  return (
    <>
      {/* eslint-disable-next-line multiline-ternary */}
      {!isShowTxResult ? (
        <div className={`${className} -main-content`}>
          <InputAddress
            className={'kn-field -field-1'}
            defaultValue={propSenderId}
            help={t<string>('The account you will send funds from.')}
            isEtherium={isEthereum}
            // isDisabled={!!propSenderId}
            label={t<string>('Send from account')}
            labelExtra={
              <Available
                api={api}
                apiUrl={apiUrl}
                label={t<string>('Transferable')}
                params={senderId}
              />
            }
            onChange={setSenderId}
            type='account'
            withEllipsis
          />
          <InputAddress
            autoPrefill={false}
            className={'kn-field -field-2'}
            help={t<string>('Select a contact or paste the address you want to send funds to.')}
            isEtherium={isEthereum}
            label={t<string>('Send to address')}
            // isDisabled={!!propRecipientId}
            labelExtra={
              <Available
                api={api}
                apiUrl={apiUrl}
                label={t<string>('Transferable')}
                params={recipientId}
              />
            }
            onChange={setRecipientId}
            type='allPlus'
            withEllipsis
          />
          {recipientPhish && (
            <Warning
              className={'kn-l-warning'}
              isDanger
            >
              {t<string>('The recipient is associated with a known phishing site on {{url}}', { replace: { url: recipientPhish } })}
            </Warning>
          )}
          {isSameAddress && (
            <Warning
              className={'kn-l-warning'}
              isDanger
            >
              {t<string>('The recipient address is the same as the sender address.')}
            </Warning>
          )}
          {canToggleAll && isAll
            ? (
              <InputBalance
                autoFocus
                className={'kn-field -field-3'}
                defaultValue={maxTransfer}
                help={t<string>('The full account balance to be transferred, minus the transaction fees')}
                isDisabled
                key={maxTransfer?.toString()}
                label={t<string>('transferable minus fees')}
                registry={api.registry}
              />
            )
            : (
              <>
                <InputBalance
                  autoFocus
                  className={'kn-field -field-3'}
                  help={t<string>('Type the amount you want to transfer. Note that you can select the unit on the right e.g sending 1 milli is equivalent to sending 0.001.')}
                  isError={!hasAvailable}
                  isZeroable
                  label={t<string>('amount')}
                  onChange={setAmount}
                  // maxValue={maxTransfer}
                  placeholder={'0'}
                  registry={api.registry}
                />
                {amountGtAvailableBalance && (
                  <Warning
                    className={'kn-l-warning'}
                    isDanger
                  >
                    {t<string>('The amount you want to transfer is greater than your available balance.')}
                  </Warning>
                )}
                <InputBalance
                  className={'kn-field -field-4'}
                  defaultValue={api.consts.balances.existentialDeposit}
                  help={t<string>('The minimum amount that an account should have to be deemed active')}
                  isDisabled
                  label={t<string>('existential deposit')}
                  registry={api.registry}
                />
              </>
            )
          }
          {isFunction(api.tx.balances.transferKeepAlive) && (
            <div className={'kn-field -toggle -toggle-1'}>
              <Toggle
                className='typeToggle'
                label={
                  isProtected
                    ? t<string>('Transfer with account keep-alive checks')
                    : t<string>('Normal transfer without keep-alive checks')
                }
                onChange={setIsProtected}
                value={isProtected}
              />
            </div>
          )}
          {canToggleAll && (
            <div className={'kn-field -toggle -toggle-2'}>
              <Toggle
                className='typeToggle'
                label={t<string>('Transfer the full account balance, reap the sender')}
                onChange={setIsAll}
                value={isAll}
              />
            </div>
          )}
          {!isProtected && !noReference && (
            <Warning className={'kn-l-warning'}>
              {t<string>('There is an existing reference count on the sender account. As such the account cannot be reaped from the state.')}
            </Warning>
          )}
          {!amountGtAvailableBalance && !isSameAddress && noFees && (
            <Warning className={'kn-l-warning'}>
              {t<string>('The transaction, after application of the transfer fees, will drop the available balance below the existential deposit. As such the transfer will fail. The account needs more free funds to cover the transaction fees.')}
            </Warning>
          )}

          <div className={'kn-l-submit-wrapper'}>
            <Button
              className={'kn-submit-btn'}
              isDisabled={isSameAddress || !hasAvailable || !(recipientId) || (!amount && !isAll) || amountGtAvailableBalance || !!recipientPhish}
              onClick={_onSend}
            >
              {t<string>('Make Transfer')}
            </Button>
          </div>
        </div>
      ) : (
        <SendFundResult
          networkKey={networkKey}
          onResend={_onResend}
          txResult={txResult}
        />
      )}

      {extrinsic && isShowTxModal && (
        <AuthTransaction
          api={api}
          apiUrl={apiUrl}
          extrinsic={extrinsic}
          onCancel={_onCancelTx}
          requestAddress={senderId}
          txHandler={{
            onTxSuccess: _onTxSuccess,
            onTxFail: _onTxFail
          }}
        />
      )}
    </>
  );
}

export default React.memo(styled(Wrapper)(({ theme }: Props) => `
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100vh;

  &.-disable-header-action {
    .koni-header-right-content .kn-l-expand-btn,
    .network-select-item,
    .setting-icon-wrapper {
      cursor: not-allowed;
      opacity: 0.5;
      pointer-events: none !important;
    }

    .subheader-container__part-3 .kn-l-cancel-btn {
      display: none;
    }
  }

  .send-fund-container {
    padding-left: 15px;
    padding-right: 15px;
    padding-bottom: 15px;
    flex: 1;
    padding-top: 25px;
    overflow-y: auto;

    // &::-webkit-scrollbar {
    //   display: none;
    // }
  }

  .kn-l-screen-content {
    flex: 1;
    padding: 25px 15px 15px;
  }

  .kn-field {
    margin-bottom: 10px;

    &.-field-1 {
      z-index: 5;
    }

    &.-field-2 {
      z-index: 4;
      margin-bottom: 10px;
    }

    &.-field-3 {
      margin-top: 20px;
      z-index: 3;
    }

    &.-field-4 {
      z-index: 2;
    }

    &.-toggle {
      margin-top: 20px;
      margin-bottom: 20px;
      display: flex;
      justify-content: flex-end;
    }

    &.-field-4, &.-toggle-1 {
        display: none !important;
    }
  }

  .kn-l-warning {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .kn-l-submit-wrapper {
    position: sticky;
    bottom: -15px;
    padding: 15px;
    margin-left: -15px;
    margin-bottom: -15px;
    margin-right: -15px;
    background-color: ${theme.background};
  }
`));
