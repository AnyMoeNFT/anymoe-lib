import Web3 from 'web3';
import { AvailableProviderTypes, getWeb3Instance } from './provider';
import { createConnectorEmitter, ConnectorEmitter } from '../utils/emitter';

export default class AnyMoeConnector {
  web3: Web3 | undefined;
  account: string | string[] | undefined;
  emitter: ReturnType<typeof createConnectorEmitter>;
  constructor() {
    this.emitter = createConnectorEmitter();
  }
  /**
   *
   * @param providerType Provider type (metamask/walletconnect)
   * @param afterHook After instance initialized, it will be executed
   */
  async init(providerType: AvailableProviderTypes, afterHook?: (emitter: ConnectorEmitter) => Promise<void>) {
    const { web3, provider } = await getWeb3Instance(providerType);
    this.web3 = web3;
    // add event listeners to web3
    provider.on('accountsChanged', (accounts: string[]) => {
      this.emitter.emit('accountsChanged', { accounts });
    });
    provider.on('chainChanged', (chainId: string | number) => {
      this.emitter.emit('chainChanged', { chainId: `${chainId}` });
    });
    if (providerType === 'walletconnect') {
      provider.on('disconnect', (code: number, reason: string) => {
        this.emitter.emit('disconnect', { err: { code, reason }, providerType: 'walletconnect' });
      });
    } else if (providerType === 'metamask') {
      provider.on('connect', (err: unknown) => {
        this.emitter.emit('disconnect', { err, providerType: 'metamask' });
      });
    }
    // run hook
    if (afterHook) {
      await afterHook(this.emitter);
    }
    // get accounts
    this.getAccounts();
  }
  async getAccounts() {
    const accounts = await this.web3?.eth.getAccounts();
    if (!accounts) {
      throw new Error('We cannot get the account address from your wallet, please ensure you have created one.');
    }
    this.account = accounts.length <= 1 ? accounts[0] : accounts;
    if (Array.isArray(this.account)) {
      this.emitter.emit('multiAccount', { accounts: this.account });
    }
  }
  // if there's multi accounts, let user to choose one
  setAccount(account: string) {
    if (!this.account) {
      this.getAccounts();
    }
    if (Array.isArray(this.account) && !this.account.includes(account)) {
      throw new Error('This account is not in the wallet.');
    }
    this.account = account;
  }
}
