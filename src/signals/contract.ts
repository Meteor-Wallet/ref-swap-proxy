import { computed, effect, signal } from '@preact/signals';
import { activeAccount, wallet } from './wallet';
import * as nearAPI from 'near-api-js';
import * as bip39 from 'bip39';
import { derivePath } from 'near-hd-key';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { z } from 'zod';
import { patchNotes } from '../data/patch-note';

const zContractSourceMetadata = z.object({
    version: z.string(),
    link: z.union([z.string(), z.null()]),
    standards: z.array(
        z.object({
            standard: z.string(),
            version: z.string(),
        })
    ),
});

type ContractVersionData = {
    version: number;
    humanReadableVersion: string;
} | null;

export const contractVersion = signal<ContractVersionData>(null);

export const refreshContractVersion = async (): Promise<void> => {
    if (!wallet.value) {
        contractVersion.value = null;
        return;
    }

    if (!activeAccount.value) {
        contractVersion.value = null;
        return;
    }

    const near = new nearAPI.Near({
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
    });

    const account = await near.account(activeAccount.value.accountId);

    const state = await account.state();
    if (state.code_hash === '11111111111111111111111111111111') {
        contractVersion.value = null;
        return;
    }

    const contractId = activeAccount.value.accountId;

    const getMetadataResponse = await account
        .viewFunction({
            contractId,
            methodName: 'contract_source_metadata',
        })
        .then((res) => zContractSourceMetadata.parse(res))
        .catch((err) => {
            console.log(err);
            return null;
        });

    console.log(getMetadataResponse);

    if (
        !getMetadataResponse ||
        getMetadataResponse.link !==
            'https://github.com/Near-Playground/account-smart-contract/tree/main/rust-contract'
    ) {
        contractVersion.value = null;
        return;
    }

    contractVersion.value = {
        version:
            patchNotes.find(
                (patchNote) =>
                    patchNote.humanReadableVersion ===
                    getMetadataResponse.version
            )?.version ?? -1,
        humanReadableVersion: getMetadataResponse.version,
    };
};

effect(refreshContractVersion);

export async function deployContract(secret: string) {
    if (!wallet.value) {
        throw new Error('Wallet not connected');
    }

    if (!activeAccount.value) {
        throw new Error('No active account');
    }

    if (secret === '') {
        throw new Error('Secret is required');
    }

    let privateKey: string;

    if (secret.startsWith('ed25519:')) {
        privateKey = secret;
    } else {
        const seed = await bip39.mnemonicToSeed(
            secret
                .trim()
                .split(/\s+/)
                .map((part) => part.toLowerCase())
                .join(' ')
        );
        const { key } = derivePath("m/44'/397'/0'", seed.toString('hex'));
        const keyPair = nacl.sign.keyPair.fromSeed(key);
        privateKey = 'ed25519:' + bs58.encode(Buffer.from(keyPair.secretKey));
    }

    const keyStore = new nearAPI.keyStores.InMemoryKeyStore();

    keyStore.setKey(
        'testnet',
        activeAccount.value.accountId,
        nearAPI.KeyPair.fromString(privateKey)
    );

    const near = await nearAPI.connect({
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        deps: { keyStore },
    });

    const account = await near.account(activeAccount.value.accountId);

    const contract = await fetch('/near_playground_account.wasm');
    const contractBuffer = await contract.arrayBuffer();
    const contractCode = new Uint8Array(contractBuffer);

    await account.deployContract(contractCode);
}
