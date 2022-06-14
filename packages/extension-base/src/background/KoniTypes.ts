// Copyright 2019-2022 @polkadot/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AuthUrls, Resolver } from '@subwallet/extension-base/background/handlers/State';
import { AccountJson, AuthorizeRequest, RequestAccountList, RequestAccountSubscribe, RequestAuthorizeReject, RequestAuthorizeSubscribe, RequestAuthorizeTab, RequestCurrentAccountAddress, ResponseAuthorizeList, ResponseJsonGetAccountInfo, SeedLengths } from '@subwallet/extension-base/background/types';
import { InjectedAccount, MetadataDefBase } from '@subwallet/extension-inject/types';

import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsicFunction } from '@polkadot/api/promise/types';
import { KeyringPair$Json } from '@polkadot/keyring/types';
import { Registry } from '@polkadot/types/types';
import { Keyring } from '@polkadot/ui-keyring';
import { SingleAddress } from '@polkadot/ui-keyring/observable/types';
import { KeyringOptions } from '@polkadot/ui-keyring/options/types';
import { KeyringPairs$Json } from '@polkadot/ui-keyring/types';
import { BN } from '@polkadot/util';
import { KeypairType } from '@polkadot/util-crypto/types';

export enum ApiInitStatus {
  SUCCESS,
  ALREADY_EXIST,
  NOT_SUPPORT
}

export interface AuthRequestV2 extends Resolver<ResultResolver> {
  id: string;
  idStr: string;
  request: RequestAuthorizeTab;
  url: string;
}

export interface RequestAuthorizeApproveV2 {
  id: string;
  accounts: string[];
}

export interface RequestAuthorizationAll {
  connectValue: boolean;
}

export interface RequestAuthorization extends RequestAuthorizationAll {
  url: string;
}

export interface RequestAuthorizationPerAccount extends RequestAuthorization {
  address: string;
}

export interface ResultResolver {
  result: boolean;
  accounts: string[];
}

export interface RejectResolver {
  error: Error;
  accounts: string[];
}

export interface RequestForgetSite {
  url: string;
}

export interface StakingRewardItem {
  state: APIItemState
  name: string,
  chainId: string,
  latestReward?: string,
  totalReward?: string,
  totalSlash?: string,
  smartContract?: string
}

export interface StakingRewardJson {
  details: Array<StakingRewardItem>
}

export interface StakingItem {
  name: string,
  chainId: string,
  balance?: string,
  nativeToken: string,
  unit?: string,
  state: APIItemState
}

export interface StakingJson {
  ready?: boolean,
  details: Record<string, StakingItem>
}

export interface PriceJson {
  ready?: boolean,
  currency: string,
  priceMap: Record<string, number>,
  tokenPriceMap: Record<string, number>
}

export enum APIItemState {
  PENDING = 'pending',
  READY = 'ready',
  CACHED = 'cached',
  ERROR = 'error',
  NOT_SUPPORT = 'not_support'
}

export enum RMRK_VER {
  VER_1 = '1.0.0',
  VER_2 = '2.0.0'
}

export enum CrowdloanParaState {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface NftTransferExtra {
  cronUpdate: boolean;
  forceUpdate: boolean;
  selectedNftCollection?: NftCollection; // for rendering
  nftItems?: NftItem[]; // for rendering, remaining nfts
}

export interface NftItem {
  id?: string;
  name?: string;
  image?: string;
  external_url?: string;
  rarity?: string;
  collectionId?: string;
  description?: string;
  properties?: Record<any, any> | null;
  chain?: string;
  rmrk_ver?: RMRK_VER;
}

export interface NftCollection {
  collectionId: string;
  collectionName?: string;
  image?: string;
  chain?: string;
  itemCount?: number;
}

export interface NftJson {
  total: number;
  nftList: Array<NftItem>;
}

export interface NftCollectionJson {
  ready: boolean;
  nftCollectionList: Array<NftCollection>;
}

export interface TokenBalanceRaw {
  reserved: BN,
  frozen: BN,
  free: BN
}

export interface BalanceChildItem {
  reserved: string,
  frozen: string,
  free: string,
  decimals: number
}

export interface BalanceItem {
  state: APIItemState,
  free: string,
  reserved: string,
  miscFrozen: string,
  feeFrozen: string,
  children?: Record<string, BalanceChildItem>
}

export interface BalanceJson {
  details: Record<string, BalanceItem>
}

export interface CrowdloanItem {
  state: APIItemState,
  paraState?: CrowdloanParaState,
  contribute: string
}

export interface CrowdloanJson {
  details: Record<string, CrowdloanItem>
}

export interface ChainRegistry {
  chainDecimals: number[];
  chainTokens: string[];
  tokenMap: Record<string, TokenInfo>
}

export interface DefaultFormatBalance {
  decimals?: number[] | number;
  unit?: string[] | string;
}

export interface ApiState {
  apiDefaultTx: SubmittableExtrinsicFunction;
  apiDefaultTxSudo: SubmittableExtrinsicFunction;
  isApiReady: boolean;
  isApiReadyOnce: boolean;
  isDevelopment?: boolean;
  isEthereum?: boolean;
  specName: string;
  specVersion: string;
  systemChain: string;
  systemName: string;
  systemVersion: string;
  registry: Registry;
  defaultFormatBalance: DefaultFormatBalance;
}

export interface ApiProps extends ApiState {
  api: ApiPromise;
  apiError?: string;
  apiUrl: string;
  isNotSupport?: boolean;
  isApiReadyOnce: boolean;
  isApiConnected: boolean;
  isEthereum: boolean;
  isApiInitialized: boolean;
  isReady: Promise<ApiProps>;
  apiRetry?: number;
  recoverConnect?: () => void;
  useEvmAddress?: boolean
}

export type NetWorkGroup = 'RELAY_CHAIN' | 'POLKADOT_PARACHAIN' | 'KUSAMA_PARACHAIN' | 'MAIN_NET' | 'TEST_NET' | 'UNKNOWN';

export interface NetWorkInfo {
  chain: string;
  genesisHash: string;
  icon?: string;
  ss58Format: number;
  chainType?: 'substrate' | 'ethereum';
  provider: string;
  groups: NetWorkGroup[];
  paraId?: number;
  isEthereum?: boolean;
  nativeToken?: string;
  crowdloanUrl?: string;
  decimals?: number;
}

export interface DonateInfo {
  key: string;
  name: string;
  value: string;
  icon: string;
  link: string;
}

export interface DropdownOptionType {
  text: string;
  value: string;
}

export interface DropdownTransformOptionType {
  label: string;
  value: string;
}

export interface DropdownTransformGroupOptionType {
  label: string;
  options: DropdownTransformOptionType[];
}

export interface NetWorkMetadataDef extends MetadataDefBase {
  networkKey: string;
  groups: NetWorkGroup[];
  isEthereum: boolean;
  paraId?: number;
  isAvailable: boolean;
}

export type CurrentNetworkInfo = {
  networkKey: string;
  networkPrefix: number;
  icon: string;
  genesisHash: string;
  isEthereum: boolean;
  isReady?: boolean; // check if current network info is lifted from initial state
}

export type TokenInfo = {
  isMainToken: boolean,
  symbol: string,
  symbolAlt?: string, // Alternate display for symbol
  erc20Address?: string,
  assetIndex?: number,
  decimals: number,
  name: string,
  coinGeckoKey?: string,
  specialOption?: object
}

// all Accounts and the address of the current Account
export interface AccountsWithCurrentAddress {
  accounts: AccountJson[];
  currentAddress?: string;
  isShowBalance?: boolean;
  allAccountLogo?: string;
}

export interface OptionInputAddress {
  options: KeyringOptions;
}

export interface CurrentAccountInfo {
  address: string;
}

export interface RequestSettingsType {
  isShowBalance: boolean;
  accountAllLogo: string;
  theme: ThemeTypes;
}

export interface ResponseSettingsType {
  isShowBalance: boolean;
  accountAllLogo: string;
  theme: ThemeTypes;
}

export interface RandomTestRequest {
  start: number;
  end: number;
}

export type PdotApi = {
  keyring: Keyring;
  apisMap: Record<string, ApiProps>;
}

export interface BackgroundWindow extends Window {
  pdotApi: PdotApi;
}

export interface TransactionHistoryItemType {
  time: number;
  networkKey: string;
  change: string;
  changeSymbol?: string; // if undefined => main token
  fee?: string;
  feeSymbol?: string;
  // if undefined => main token, sometime "fee" uses different token than "change"
  // ex: sub token (DOT, AUSD, KSM, ...) of Acala, Karaura uses main token to pay fee
  isSuccess: boolean;
  action: 'send' | 'received';
  extrinsicHash: string
}

export interface RequestTransactionHistoryGet {
  address: string;
  networkKey: string;
}

export interface RequestTransactionHistoryGetByMultiNetworks {
  address: string;
  networkKeys: string[];
}

export interface RequestTransactionHistoryAdd {
  address: string;
  networkKey: string;
  item: TransactionHistoryItemType;
}

export interface RequestApi {
  networkKey: string;
}

export interface RequestAccountExportPrivateKey {
  address: string;
  password: string;
}

export interface ResponseAccountExportPrivateKey {
  privateKey: string;
}

export interface RequestSeedCreateV2 {
  length?: SeedLengths;
  seed?: string;
  types?: Array<KeypairType>;
}

export interface RequestSeedValidateV2 {
  suri: string;
  types?: Array<KeypairType>;
}

export interface RequestAccountCreateSuriV2 {
  name: string;
  genesisHash?: string | null;
  password: string;
  suri: string;
  types?: Array<KeypairType>;
  isAllowed: boolean;
}

export interface RequestDeriveCreateV2 {
  name: string;
  genesisHash?: string | null;
  suri: string;
  parentAddress: string;
  parentPassword: string;
  password: string;
  isAllowed: boolean;
}

export interface RequestJsonRestoreV2 {
  file: KeyringPair$Json;
  password: string;
  address: string;
  isAllowed: boolean;
}

export interface RequestBatchRestoreV2 {
  file: KeyringPairs$Json;
  password: string;
  accountsInfo: ResponseJsonGetAccountInfo[];
  isAllowed: boolean;
}

export interface ResponseSeedCreateV2 {
  seed: string,
  addressMap: Record<KeypairType, string>
}

export interface RequestCheckTransfer {
  networkKey: string,
  from: string,
  to: string,
  value?: string,
  transferAll?: boolean
  token?: string
}

export interface RequestTransfer extends RequestCheckTransfer {
  password: string;
}

export interface ResponsePrivateKeyValidateV2 {
  addressMap: Record<KeypairType, string>,
  autoAddPrefix: boolean
}

export type ResponseSeedValidateV2 = ResponseSeedCreateV2
export type ResponseAccountCreateSuriV2 = Record<KeypairType, string>
export type AccountRef = Array<string>
export type AccountRefMap = Record<string, AccountRef>

export type RequestPrice = null
export type RequestSubscribePrice = null
export type RequestBalance = null
export type RequestSubscribeBalance = null
export type RequestSubscribeBalancesVisibility = null
export type RequestCrowdloan = null
export type RequestSubscribeCrowdloan = null
export type RequestSubscribeNft = null
export type RequestSubscribeStaking = null
export type RequestSubscribeStakingReward = null
export type ThemeTypes = 'light' | 'dark'
export type RequestNftForceUpdate = {
  collectionId: string,
  nft: NftItem,
  isSendingSelf: boolean,
  chain: string
}

export enum TransferErrorCode {
  INVALID_FROM_ADDRESS = 'invalidFromAccount',
  INVALID_TO_ADDRESS = 'invalidToAccount',
  NOT_ENOUGH_VALUE = 'notEnoughValue',
  INVALID_VALUE = 'invalidValue',
  INVALID_TOKEN = 'invalidToken',
  KEYRING_ERROR = 'keyringError',
  TRANSFER_ERROR = 'transferError',
  TIMEOUT = 'timeout',
  UNSUPPORTED = 'unsupported'
}

export type TransferError = {
  code: TransferErrorCode,
  data?: object,
  message: string
}

export interface ResponseCheckTransfer {
  errors?: Array<TransferError>,
  fromAccountFree: string,
  toAccountFree: string,
  estimateFee?: string,
  feeSymbol?: string // if undefined => use main token
}

export enum TransferStep {
  READY = 'ready',
  START = 'start',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error'
}

type TxResultType = {
  change: string;
  changeSymbol?: string;
  fee?: string;
  feeSymbol?: string;
}

export interface ResponseTransfer {
  step: TransferStep,
  errors?: Array<TransferError>,
  extrinsicHash?: string,
  extrinsicStatus?: string,
  data?: object,
  txResult?: TxResultType,
  isFinalized?: boolean
}

export interface EvmNftTransactionRequest {
  networkKey: string,
  senderAddress: string,
  recipientAddress: string,
  params: Record<string, any>
}

export interface EvmNftTransaction {
  tx: Record<string, any> | null,
  estimatedFee: string | null
}

export interface EvmNftSubmitTransaction {
  senderAddress: string,
  password: string,
  recipientAddress: string,
  networkKey: string,
  rawTransaction: Record<string, any>
}

export interface EvmNftTransactionResponse {
  passwordError?: string | null,
  callHash?: string,
  status?: boolean,
  transactionHash?: string,
  txError?: boolean,
  isSendingSelf: boolean
}

export interface CustomEvmToken {
  name?: string,
  smartContract: string,
  symbol?: string,
  decimals?: number,
  chain: 'edgEvm' | 'moonbeam' | 'moonriver' | 'moonbase' | 'shidenEvm',
  type: 'erc20' | 'erc721'
}

export interface EvmTokenJson {
  erc20: CustomEvmToken[],
  erc721: CustomEvmToken[]
}

export interface _ServiceInfo {
  currentAccount: string,
  chainRegistry: Record<string, ChainRegistry>;
  customErc721Registry: CustomEvmToken[];
}

export interface DeleteEvmTokenParams {
  smartContract: string,
  chain: 'edgEvm' | 'moonbeam' | 'moonriver' | 'moonbase' | 'shidenEvm',
  type: 'erc20' | 'erc721'
}

export interface ValidateEvmTokenRequest {
  smartContract: string,
  chain: 'edgEvm' | 'moonbeam' | 'moonriver' | 'moonbase' | 'shidenEvm',
  type: 'erc20' | 'erc721'
}

export interface ValidateEvmTokenResponse {
  name: string,
  symbol: string,
  decimals?: number,
  isExist: boolean
}

export interface SupportTransferResponse {
  supportTransfer: boolean;
  supportTransferAll: boolean;
}

export interface RequestFreeBalance {
  address: string,
  networkKey: string,
  token?: string
}

export interface RequestTransferCheckReferenceCount {
  address: string,
  networkKey: string
}

export interface RequestTransferCheckSupporting {
  networkKey: string,
  token: string
}

export interface RequestTransferExistentialDeposit {
  networkKey: string,
  token: string
}

export interface RequestSaveRecentAccount {
  accountId: string;
}

export interface KoniRequestSignatures {
  'pri(evmTokenState.validateEvmToken)': [ValidateEvmTokenRequest, ValidateEvmTokenResponse];
  'pri(evmTokenState.deleteMany)': [DeleteEvmTokenParams[], boolean];
  'pri(evmTokenState.upsertEvmTokenState)': [CustomEvmToken, boolean];
  'pri(evmTokenState.getEvmTokenState)': [null, EvmTokenJson];
  'pri(evmTokenState.getSubscription)': [null, EvmTokenJson, EvmTokenJson];
  'pri(evmNft.submitTransaction)': [EvmNftSubmitTransaction, EvmNftTransactionResponse, EvmNftTransactionResponse];
  'pri(evmNft.getTransaction)': [EvmNftTransactionRequest, EvmNftTransaction];
  'pri(nftTransfer.setNftTransfer)': [NftTransferExtra, boolean];
  'pri(nftTransfer.getNftTransfer)': [null, NftTransferExtra];
  'pri(nftTransfer.getSubscription)': [null, NftTransferExtra, NftTransferExtra];
  'pri(nft.forceUpdate)': [RequestNftForceUpdate, boolean];
  'pri(api.init)': [RequestApi, ApiInitStatus];
  'pri(staking.getStaking)': [null, StakingJson];
  'pri(staking.getSubscription)': [RequestSubscribeStaking, StakingJson, StakingJson];
  'pri(stakingReward.getStakingReward)': [null, StakingRewardJson];
  'pri(stakingReward.getSubscription)': [RequestSubscribeStakingReward, StakingRewardJson, StakingRewardJson];
  'pri(nft.getNft)': [null, NftJson];
  'pri(nft.getSubscription)': [RequestSubscribeNft, NftJson, NftJson];
  'pri(nftCollection.getNftCollection)': [null, NftCollectionJson];
  'pri(nftCollection.getSubscription)': [null, NftCollectionJson, NftCollectionJson];
  'pri(price.getPrice)': [RequestPrice, PriceJson];
  'pri(price.getSubscription)': [RequestSubscribePrice, PriceJson, PriceJson];
  'pri(balance.getBalance)': [RequestBalance, BalanceJson];
  'pri(balance.getSubscription)': [RequestSubscribeBalance, BalanceJson, BalanceJson];
  'pri(crowdloan.getCrowdloan)': [RequestCrowdloan, CrowdloanJson];
  'pri(crowdloan.getSubscription)': [RequestSubscribeCrowdloan, CrowdloanJson, CrowdloanJson];
  'pri(authorize.listV2)': [null, ResponseAuthorizeList];
  'pri(authorize.requestsV2)': [RequestAuthorizeSubscribe, boolean, AuthorizeRequest[]];
  'pri(authorize.approveV2)': [RequestAuthorizeApproveV2, boolean];
  'pri(authorize.changeSiteAll)': [RequestAuthorizationAll, boolean, AuthUrls];
  'pri(authorize.changeSite)': [RequestAuthorization, boolean, AuthUrls];
  'pri(authorize.changeSitePerAccount)': [RequestAuthorizationPerAccount, boolean, AuthUrls];
  'pri(authorize.forgetSite)': [RequestForgetSite, boolean, AuthUrls];
  'pri(authorize.forgetAllSite)': [null, boolean, AuthUrls];
  'pri(authorize.rejectV2)': [RequestAuthorizeReject, boolean];
  'pri(seed.createV2)': [RequestSeedCreateV2, ResponseSeedCreateV2];
  'pri(seed.validateV2)': [RequestSeedValidateV2, ResponseSeedValidateV2];
  'pri(privateKey.validateV2)': [RequestSeedValidateV2, ResponsePrivateKeyValidateV2];
  'pri(accounts.create.suriV2)': [RequestAccountCreateSuriV2, ResponseAccountCreateSuriV2];
  'pri(accounts.checkTransfer)': [RequestCheckTransfer, ResponseCheckTransfer];
  'pri(accounts.transfer)': [RequestTransfer, Array<TransferError>, ResponseTransfer];
  'pri(derivation.createV2)': [RequestDeriveCreateV2, boolean];
  'pri(json.restoreV2)': [RequestJsonRestoreV2, void];
  'pri(json.batchRestoreV2)': [RequestBatchRestoreV2, void];
  'pri(accounts.exportPrivateKey)': [RequestAccountExportPrivateKey, ResponseAccountExportPrivateKey];
  'pri(accounts.subscribeWithCurrentAddress)': [RequestAccountSubscribe, boolean, AccountsWithCurrentAddress];
  'pri(accounts.subscribeAccountsInputAddress)': [RequestAccountSubscribe, string, OptionInputAddress];
  'pri(accounts.saveRecent)': [RequestSaveRecentAccount, SingleAddress];
  'pri(accounts.triggerSubscription)': [null, boolean];
  'pri(currentAccount.saveAddress)': [RequestCurrentAccountAddress, boolean, CurrentAccountInfo];
  'pri(currentAccount.changeBalancesVisibility)': [null, boolean, ResponseSettingsType];
  'pri(currentAccount.subscribeSettings)': [null, ResponseSettingsType, ResponseSettingsType];
  'pri(currentAccount.saveAccountAllLogo)': [string, boolean, ResponseSettingsType];
  'pri(currentAccount.saveTheme)': [ThemeTypes, boolean, ResponseSettingsType];
  'pri(networkMetadata.list)': [null, NetWorkMetadataDef[]];
  'pri(chainRegistry.getSubscription)': [null, Record<string, ChainRegistry>, Record<string, ChainRegistry>];
  'pri(transaction.history.getSubscription)': [null, Record<string, TransactionHistoryItemType[]>, Record<string, TransactionHistoryItemType[]>];
  'pri(transaction.history.add)': [RequestTransactionHistoryAdd, boolean, TransactionHistoryItemType[]];
  'pri(transfer.checkReferenceCount)': [RequestTransferCheckReferenceCount, boolean];
  'pri(transfer.checkSupporting)': [RequestTransferCheckSupporting, SupportTransferResponse];
  'pri(transfer.getExistentialDeposit)': [RequestTransferExistentialDeposit, string];
  'pri(subscription.cancel)': [string, boolean];
  'pri(freeBalance.subscribe)': [RequestFreeBalance, string, string];
  'pub(utils.getRandom)': [RandomTestRequest, number];
  'pub(accounts.listV2)': [RequestAccountList, InjectedAccount[]];
  'pub(accounts.subscribeV2)': [RequestAccountSubscribe, boolean, InjectedAccount[]];
}
