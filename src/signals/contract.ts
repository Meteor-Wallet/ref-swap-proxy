import { effect, signal } from '@preact/signals';
import { activeAccount, wallet } from './wallet';
import * as nearAPI from 'near-api-js';
import { z } from 'zod';
import { patchNotes } from '../data/patch-note';
import { BN } from 'bn.js';
import { config } from '../config';

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
    accountExists: boolean;
    contractDeployed: boolean;
    locked: boolean;
    owner: string;
} | null;

export const contractAccountId = signal<string>(
    localStorage.getItem('contractAccountId') ?? ''
);

effect(() => {
    localStorage.setItem('contractAccountId', contractAccountId.value);
});

export const contractVersion = signal<ContractVersionData>(null);

effect(() => {
    if (!wallet.value) {
        contractVersion.value = null;
        return;
    }

    if (!contractAccountId.value) {
        contractVersion.value = null;
        return;
    }

    refreshContractVersion();
});

export const refreshContractVersion = async (): Promise<void> => {
    let version: number = -1;
    let humanReadableVersion: string = 'Unknown';
    let accountExists: boolean = false;
    let contractDeployed: boolean = false;
    let locked: boolean = !localStorage.getItem(
        `privateKey:${contractAccountId.value}`
    );
    let owner: string = '';

    if (!wallet.value) {
        contractVersion.value = null;
        return;
    }

    if (!contractAccountId.value) {
        contractVersion.value = null;
        return;
    }

    const near = new nearAPI.Near({
        networkId: config.nearEnv,
        nodeUrl: config.nearRpcEndpoint,
    });

    const contract = await near.account(contractAccountId.value);

    try {
        const state = await contract.state();

        accountExists = true;

        if (state.code_hash === '11111111111111111111111111111111') {
            contractVersion.value = {
                version,
                humanReadableVersion,
                accountExists,
                contractDeployed,
                locked,
                owner,
            };

            return;
        }

        contractDeployed = true;
    } catch (err) {
        contractVersion.value = {
            version,
            humanReadableVersion,
            accountExists,
            contractDeployed,
            locked,
            owner,
        };

        return;
    }

    const contractId = contractAccountId.value;

    const getMetadataResponse = await contract
        .viewFunction({
            contractId,
            methodName: 'contract_source_metadata',
        })
        .then((res) => zContractSourceMetadata.parse(res))
        .catch((err) => {
            console.log(err);
            return null;
        });

    if (
        !getMetadataResponse ||
        getMetadataResponse.link !== config.contractRepo
    ) {
        contractVersion.value = {
            version,
            humanReadableVersion,
            accountExists,
            contractDeployed,
            locked,
            owner,
        };

        return;
    }

    version =
        patchNotes.find(
            (patchNote) =>
                patchNote.humanReadableVersion === getMetadataResponse.version
        )?.version ?? -1;

    humanReadableVersion = getMetadataResponse.version;

    owner = await contract
        .viewFunction({
            contractId,
            methodName: 'get_owner_id',
        })
        .then((res) => z.string().parse(res))
        .catch(() => '');

    contractVersion.value = {
        version,
        humanReadableVersion,
        accountExists,
        contractDeployed,
        locked,
        owner,
    };
};

export async function deployContract(fee: number, referralId: string) {
    if (!contractAccountId.value) {
        return;
    }

    const privateKey: string =
        localStorage.getItem(`privateKey:${contractAccountId.value}`) ?? '';

    if (!privateKey) {
        return;
    }

    const keyStore = new nearAPI.keyStores.InMemoryKeyStore();

    keyStore.setKey(
        config.nearEnv,
        contractAccountId.value,
        nearAPI.KeyPair.fromString(privateKey)
    );

    const near = await nearAPI.connect({
        networkId: config.nearEnv,
        nodeUrl: config.nearRpcEndpoint,
        deps: { keyStore },
    });

    console.log(near);

    const account = await near.account(contractAccountId.value);

    const contract = await fetch('/meteor_ref_swap_proxy.wasm');
    const contractBuffer = await contract.arrayBuffer();
    const contractCode = new Uint8Array(contractBuffer);

    await account
        .signAndSendTransaction({
            receiverId: contractAccountId.value,
            actions: [
                nearAPI.transactions.deployContract(contractCode),
                nearAPI.transactions.functionCall(
                    'new',
                    {
                        owner_id: activeAccount.value?.accountId,
                        exchange_fee: fee,
                        referral_id: referralId === '' ? null : referralId,
                        ref_exchange_id: config.refFinanceId,
                    },
                    BigInt('200000000000000'),
                    BigInt('0')
                ),
            ],
        })
        .then(refreshContractVersion);
}

export async function updateContract() {
    if (!contractAccountId.value) {
        return;
    }

    const privateKey: string =
        localStorage.getItem(`privateKey:${contractAccountId.value}`) ?? '';

    if (!privateKey) {
        return;
    }

    const keyStore = new nearAPI.keyStores.InMemoryKeyStore();

    keyStore.setKey(
        config.nearEnv,
        contractAccountId.value,
        nearAPI.KeyPair.fromString(privateKey)
    );

    const near = await nearAPI.connect({
        networkId: config.nearEnv,
        nodeUrl: config.nearRpcEndpoint,
        deps: { keyStore },
    });

    const account = await near.account(contractAccountId.value);

    const contract = await fetch('/meteor_ref_swap_proxy.wasm');
    const contractBuffer = await contract.arrayBuffer();
    const contractCode = new Uint8Array(contractBuffer);

    await account
        .signAndSendTransaction({
            receiverId: contractAccountId.value,
            actions: [nearAPI.transactions.deployContract(contractCode)],
        })
        .then(refreshContractVersion);
}

export async function lockContract() {
    if (!contractAccountId.value) {
        return;
    }

    const privateKey: string =
        localStorage.getItem(`privateKey:${contractAccountId.value}`) ?? '';

    if (!privateKey) {
        return;
    }

    const keyStore = new nearAPI.keyStores.InMemoryKeyStore();

    keyStore.setKey(
        config.nearEnv,
        contractAccountId.value,
        nearAPI.KeyPair.fromString(privateKey)
    );

    const near = await nearAPI.connect({
        networkId: config.nearEnv,
        nodeUrl: config.nearRpcEndpoint,
        deps: { keyStore },
    });

    const account = await near.account(contractAccountId.value);

    const publicKey = nearAPI.KeyPair.fromString(privateKey).getPublicKey();

    await account
        .signAndSendTransaction({
            receiverId: contractAccountId.value,
            actions: [nearAPI.transactions.deleteKey(publicKey)],
        })
        .then(() =>
            localStorage.removeItem(`privateKey:${contractAccountId.value}`)
        )
        .then(refreshContractVersion);
}
