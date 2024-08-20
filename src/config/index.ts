import { NetworkId } from '@near-wallet-selector/core';
import { mainnetConfig } from './mainnet';
import { testnetConfig } from './testnet';

export interface Config {
    nearEnv: NetworkId;
    nearRpcEndpoint: string;
    refFinanceId: string;
    contractRepo: string;
}

export const config =
    import.meta.env.MODE === 'mainnet' ? mainnetConfig : testnetConfig;
