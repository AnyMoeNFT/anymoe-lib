import mitt, { Emitter } from 'mitt';
import { AvailableProviderTypes } from '../lib/provider';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ConnectEvents = {
  multiAccount: {
    accounts: string[];
  };
  accountsChanged: {
    accounts: string[];
  };
  chainChanged: {
    chainId: string;
  };
  disconnect: {
    err: unknown;
    providerType: AvailableProviderTypes;
  };
};

export type ConnectorEmitter = Emitter<ConnectEvents>;

export const createConnectorEmitter: () => ConnectorEmitter = () => mitt();
