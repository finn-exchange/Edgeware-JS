// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountContext } from '@subwallet/extension-koni-ui/components';
import InputWithLabel from '@subwallet/extension-koni-ui/components/InputWithLabel';
import ValidatedInput from '@subwallet/extension-koni-ui/components/ValidatedInput';
import useTranslation from '@subwallet/extension-koni-ui/hooks/useTranslation';
import { isNotShorterThan } from '@subwallet/extension-koni-ui/util/validators';
import React, { useContext, useMemo } from 'react';

interface Props {
  address?: string;
  className?: string;
  isFocused?: boolean;
  label?: string;
  onBlur?: () => void;
  onChange: (name: string | null) => void;
  value?: string | null;
}

export default function Name ({ address, className, isFocused, label, onBlur, onChange, value }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const isNameValid = useMemo(() => isNotShorterThan(3, t<string>('Account name is too short')), [t]);

  const account = accounts.find((account) => account.address === address);
  const startValue = value || account?.name;

  return (
    <ValidatedInput
      className={className}
      component={InputWithLabel}
      data-input-name
      defaultValue={startValue}
      isFocused={isFocused}
      label={label || t<string>('A descriptive name for your account')}
      onBlur={onBlur}
      onEnter={onBlur}
      onValidatedChange={onChange}
      type='text'
      validator={isNameValid}
    />
  );
}
