import detectEthereumProvider from '@metamask/detect-provider';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from 'web3';
import { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers';
import { AbstractProvider, provider } from 'web3-core/types';

export declare class Web3Provider extends WalletConnectProvider implements AbstractProvider {
  sendAsync(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void;
  on(eventName: string, callback: unknown): void | Promise<void>;
}

export type AvailableProviderTypes = 'metamask' | 'walletconnect';

export const getWeb3Instance = async (type: AvailableProviderTypes) => {
  if (type === 'metamask') {
    const provider = await detectEthereumProvider();
    if (!provider) {
      throw new Error('No metamask provider was found.');
    }
    return {
      web3: new Web3(provider as provider),
      provider: provider as Web3Provider,
    };
  }
  if (type === 'walletconnect') {
    const provider = new WalletConnectProvider({
      infuraId: '27e484dcd9e3efcfd25a83a78777cdf1',
    });
    try {
      await provider.enable();
    } catch (err) {
      console.error('Enable wallet connect provider failed.', err);
      throw new Error('Cannot connect to the wallet connect.');
    }
    return {
      web3: new Web3(provider as Web3Provider),
      provider: provider as Web3Provider,
    };
  }
  throw new Error('Provider type is not supported.');
};
