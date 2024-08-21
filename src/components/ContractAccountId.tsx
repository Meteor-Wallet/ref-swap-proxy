import React from 'preact/compat';
import {
    contractAccountId,
    contractVersion,
    refreshContractVersion,
} from '../signals/contract';
import { accountState, activeAccount, wallet } from '../signals/wallet';
import { KeyPairEd25519 } from 'near-api-js/lib/utils';
import BN from 'bn.js';
import * as nearAPI from 'near-api-js';
import { config } from '../config';

export function ContractAccountId() {
    const { accountExists, locked } = contractVersion.value ?? {};

    const [createAccountError, setCreateAccountError] = React.useState<
        string | null
    >(null);
    const [showPrivateKey, setShowPrivateKey] = React.useState<boolean>(false);

    async function createAccount() {
        setCreateAccountError(null);

        if (!wallet.value) {
            return;
        }

        if (!contractAccountId.value) {
            return;
        }

        if (!activeAccount.value) {
            return;
        }

        if (
            !contractAccountId.value.endsWith(
                `.${activeAccount.value.accountId}`
            )
        ) {
            setCreateAccountError(
                'Contract account id must end with your account id'
            );
            return;
        }

        const accountBalance = new BN(accountState.value?.amount ?? '0');

        // 20e24
        if (!accountBalance.gt(new BN('20000000000000000000000000'))) {
            setCreateAccountError(
                'Insufficient balance to deploy contract, need 20 Near'
            );
            return;
        }

        const keypair = KeyPairEd25519.fromRandom();
        const privateKey = keypair.secretKey;

        localStorage.setItem(
            `privateKey:${contractAccountId.value}`,
            privateKey.toString()
        );

        const publicKey = keypair.publicKey.toString();

        try {
            await wallet.value.signAndSendTransactions({
                transactions: [
                    {
                        signerId: activeAccount.value.accountId,
                        receiverId: contractAccountId.value,
                        actions: [
                            {
                                type: 'CreateAccount',
                            },
                            {
                                type: 'AddKey',
                                params: {
                                    publicKey,
                                    accessKey: {
                                        permission: 'FullAccess',
                                    },
                                },
                            },
                            {
                                type: 'Transfer',
                                params: {
                                    deposit:
                                        nearAPI.utils.format.parseNearAmount(
                                            '16'
                                        )!,
                                },
                            },
                        ],
                    },
                    {
                        signerId: activeAccount.value?.accountId ?? '',
                        receiverId: config.refFinanceId,
                        actions: [
                            {
                                type: 'FunctionCall',
                                params: {
                                    methodName: 'storage_deposit',
                                    args: {
                                        account_id: contractAccountId.value,
                                    },
                                    gas: '300000000000000',
                                    deposit:
                                        nearAPI.utils.format.parseNearAmount(
                                            '4'
                                        )!,
                                },
                            },
                        ],
                    },
                ],
                callbackUrl: window.location.href,
            });

            refreshContractVersion();

            return;
        } catch (err: unknown) {
            setCreateAccountError(JSON.stringify(err));
            return;
        }
    }

    return (
        <>
            <div class='my-5'>
                <label
                    for='contractAccountId'
                    class='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                >
                    Contract Account Id
                </label>
                <input
                    id='contractAccountId'
                    type='text'
                    class='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                    placeholder={
                        activeAccount.value
                            ? `xxxx.${activeAccount.value.accountId}`
                            : 'contract address'
                    }
                    value={contractAccountId.value ?? ''}
                    onInput={(e) => {
                        contractAccountId.value = (
                            e.target as HTMLInputElement
                        ).value;
                    }}
                    required
                />
            </div>
            {accountExists === false && (
                <>
                    <button
                        type='button'
                        onClick={createAccount}
                        class='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                    >
                        Create Account
                    </button>
                    {createAccountError && (
                        <p class='text-red-600 dark:text-red-400'>
                            {createAccountError}
                        </p>
                    )}
                </>
            )}
            {accountExists === true && locked === false && (
                <>
                    <button
                        type='button'
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        class='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                    >
                        {showPrivateKey
                            ? 'Hide Private Key'
                            : 'Show Private Key'}
                    </button>
                    {showPrivateKey && (
                        <p class='block my-2 text-sm font-medium text-gray-900 dark:text-white'>
                            Private Key: ed25519:
                            {localStorage.getItem(
                                'privateKey:' + contractAccountId.value
                            )}
                        </p>
                    )}
                </>
            )}
        </>
    );
}
