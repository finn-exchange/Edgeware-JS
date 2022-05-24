// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { canDerive } from '@subwallet/extension-base/utils';
import { EVM_ACCOUNT_TYPE } from '@subwallet/extension-koni-ui/Popup/CreateAccount';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';

import { AccountContext, AccountInfoEl, ActionContext, ButtonArea, Checkbox, InputWithLabel, Label, NextStepButton, Theme, Warning } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { validateAccount, validateDerivationPath } from '../../messaging';
import { nextDerivationPath } from '../../util/nextDerivationPath';
import AddressDropdown from './AddressDropdown';
import DerivationPath from './DerivationPath';

interface Props {
  className?: string;
  isLocked?: boolean;
  parentAddress: string;
  parentGenesis: string | null;
  onDerivationConfirmed: (derivation: { account: { address: string; suri: string }; parentPassword: string }) => void;
  isBusy: boolean;
  setBusy: (isBusy: boolean) => void;
  isConnectWhenDerive: boolean;
  onConnectWhenDerive: (isConnectWhenDerive: boolean) => void;
}

// match any single slash
const singleSlashRegex = /([^/]|^)\/([^/]|$)/;

function SelectParent ({ className, isBusy, isConnectWhenDerive, isLocked, onConnectWhenDerive, onDerivationConfirmed, parentAddress, parentGenesis, setBusy }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { accounts, hierarchy } = useContext(AccountContext);
  const defaultPath = useMemo(() => nextDerivationPath(accounts, parentAddress), [accounts, parentAddress]);
  const [suriPath, setSuriPath] = useState<null | string>(defaultPath);
  const [parentPassword, setParentPassword] = useState<string>('');
  const [isProperParentPassword, setIsProperParentPassword] = useState(false);
  const [isHaveDerivationPath, setIsHaveDerivationPath] = useState(!!defaultPath);
  const [pathError, setPathError] = useState('');
  const passwordInputRef = useRef<HTMLDivElement>(null);
  const allowSoftDerivation = useMemo(() => {
    const parent = accounts.find(({ address }) => address === parentAddress);

    return parent?.type === 'sr25519';
  }, [accounts, parentAddress]);
  const themeContext = useContext(ThemeContext as React.Context<Theme>);

  // reset the password field if the parent address changes
  useEffect(() => {
    setParentPassword('');
  }, [parentAddress]);

  useEffect(() => {
    // forbid the use of password since Keyring ignores it
    if (suriPath?.includes('///')) {
      setPathError(t('`///password` not supported for derivation'));
    }

    if (!allowSoftDerivation && suriPath && singleSlashRegex.test(suriPath)) {
      setPathError(t('Soft derivation is only allowed for sr25519 accounts'));
    }
  }, [allowSoftDerivation, suriPath, t]);

  const allAddresses = useMemo(
    () => hierarchy
      .filter(({ isExternal }) => !isExternal)
      .filter(({ type }) => canDerive(type) && type !== EVM_ACCOUNT_TYPE)
      .map(({ address, genesisHash }): [string, string | null] => [address, genesisHash || null]),
    [hierarchy]
  );

  const _onParentPasswordEnter = useCallback(
    (parentPassword: string): void => {
      setParentPassword(parentPassword);
      setIsProperParentPassword(!!parentPassword);
    },
    []
  );

  const _onSuriPathChange = useCallback(
    (path: string): void => {
      if (!path) {
        setIsHaveDerivationPath(false);
      } else {
        setIsHaveDerivationPath(true);
      }

      setSuriPath(path);
      setPathError('');
    },
    []
  );

  const _onParentChange = useCallback(
    (address: string) => {
      onAction(`/account/derive/${address}`);
    },
    [onAction]
  );

  const _onSubmit = useCallback(
    async (): Promise<void> => {
      if (suriPath && parentAddress && parentPassword) {
        setBusy(true);

        const isUnlockable = await validateAccount(parentAddress, parentPassword);

        if (isUnlockable) {
          try {
            const account = await validateDerivationPath(parentAddress, suriPath, parentPassword);

            onDerivationConfirmed({ account, parentPassword });
          } catch (error) {
            setPathError(t('Invalid derivation path'));
            console.error(error);
          }
        } else {
          setIsProperParentPassword(false);
        }

        setBusy(false);
      }
    },
    [suriPath, parentAddress, parentPassword, setBusy, onDerivationConfirmed, t]
  );

  useEffect(() => {
    setParentPassword('');
    setIsProperParentPassword(false);

    passwordInputRef.current?.querySelector('input')?.focus();
  }, [_onParentPasswordEnter]);

  return (
    <>
      <div className={className}>
        <div className='derive-account'>
          {isLocked
            ? (
              <AccountInfoEl
                address={parentAddress}
                className={`account-info-container ${themeContext.id === 'dark' ? '-dark' : '-light'}`}
                genesisHash={parentGenesis}
              />
            )
            : (
              <Label label={t<string>('Choose Parent Account:')}>
                <AddressDropdown
                  allAddresses={allAddresses}
                  onSelect={_onParentChange}
                  selectedAddress={parentAddress}
                  selectedGenesis={parentGenesis}
                />
              </Label>
            )
          }
          <div ref={passwordInputRef}>
            <InputWithLabel
              data-input-password
              isError={!!parentPassword && !isProperParentPassword}
              isFocused
              label={t<string>('enter the password for the account you want to derive from')}
              onChange={_onParentPasswordEnter}
              type='password'
              value={parentPassword}
            />
            {!!parentPassword && !isProperParentPassword && (
              <Warning
                className='select-parent-warning'
                isBelowInput
                isDanger
              >
                {t('Wrong password')}
              </Warning>
            )}
          </div>
          {isProperParentPassword && (
            <>
              <DerivationPath
                defaultPath={defaultPath}
                isError={!!pathError}
                onChange={_onSuriPathChange}
                parentAddress={parentAddress}
                parentPassword={parentPassword}
                withSoftPath={allowSoftDerivation}
              />
              {(!!pathError) && (
                <Warning
                  className='select-parent-warning'
                  isBelowInput
                  isDanger
                >
                  {pathError}
                </Warning>
              )}
            </>
          )}
        </div>

        <Checkbox
          checked={isConnectWhenDerive}
          label={t<string>('Auto connect to all DApp after importing')}
          onChange={onConnectWhenDerive}
        />
        <ButtonArea>
          <NextStepButton
            className='next-step-btn'
            data-button-action='create derived account'
            isBusy={isBusy}
            isDisabled={!isProperParentPassword || !!pathError || !isHaveDerivationPath}
            onClick={_onSubmit}
          >
            {t<string>('Create a derived account')}
          </NextStepButton>
        </ButtonArea>
      </div>
    </>
  );
}

export default styled(React.memo(SelectParent))`
  padding: 25px 15px 15px;
  flex: 1;
  overflow-y: auto;

  .next-step-btn {
    > .children {
      display: flex;
      align-items: center;
      position: relative;
      justify-content: center;
    }
  }

  .select-parent-warning {
    margin-top: 10px;
  }
`;
