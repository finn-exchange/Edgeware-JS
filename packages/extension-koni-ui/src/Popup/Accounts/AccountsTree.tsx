// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@subwallet/extension-base/background/types';

import Account from '@subwallet/extension-koni-ui/Popup/Accounts/Account';
import React from 'react';

interface Props extends AccountWithChildren {
  parentName?: string;
  closeSetting?: () => void;
  changeAccountCallback?: (address: string) => void;
}

export default function AccountsTree ({ changeAccountCallback, closeSetting, parentName, suri, ...account }: Props): React.ReactElement<Props> {
  return (
    <>
      <Account
        {...account}
        changeAccountCallback={changeAccountCallback}
        closeSetting={closeSetting}
        parentName={parentName}
        suri={suri}
      />
      {account?.children?.map((child, index) => (
        <AccountsTree
          closeSetting={closeSetting}
          key={`${index}:${child.address}`}
          {...child}
          parentName={account.name}
        />
      ))}
    </>
  );
}
