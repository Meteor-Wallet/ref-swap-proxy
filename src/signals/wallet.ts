import {
    AccountState,
    Wallet,
    setupWalletSelector,
} from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { computed, effect, signal } from '@preact/signals';
import * as nearAPI from 'near-api-js';
import '@near-wallet-selector/modal-ui/styles.css';
import { AccountView } from 'near-api-js/lib/providers/provider';
import { config } from '../config';

const selector = await setupWalletSelector({
    network: config.nearEnv,
    modules: [setupMyNearWallet(), setupMeteorWallet()],
});

export const walletSelectorModal = setupModal(selector, {
    contractId: '',
});

export const accounts = signal<AccountState[]>([]);

export const wallet = signal<Wallet | null>(null);

export const activeAccount = computed<AccountState | undefined>(() => {
    return accounts.value.find((account) => account.active);
});

export const accountState = signal<AccountView | null>(null);

effect(() => {
    if (!activeAccount.value) {
        accountState.value = null;
        return;
    }

    refreshAccountState();
});

export async function refreshAccountState() {
    if (!activeAccount.value) {
        accountState.value = null;
        return;
    }

    const near = await nearAPI.connect({
        networkId: config.nearEnv,
        nodeUrl: config.nearRpcEndpoint,
    });

    const account = await near.account(activeAccount.value.accountId);

    const state = await account.state();

    accountState.value = state;
}

selector.store.observable.subscribe((state) => {
    accounts.value = state.accounts;

    if (state.selectedWalletId !== null) {
        selector.wallet(state.selectedWalletId).then((selectedWallet) => {
            wallet.value = selectedWallet;
        });
    } else {
        wallet.value = null;
    }
});
