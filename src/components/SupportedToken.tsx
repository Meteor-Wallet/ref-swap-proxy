import { useQuery } from '@tanstack/react-query';
import React from 'preact/compat';
import { useEffect } from 'preact/hooks';
import * as nearAPI from 'near-api-js';
import { config } from '../config';
import { contractAccountId, contractVersion } from '../signals/contract';
import { activeAccount, wallet } from '../signals/wallet';
import { BN } from 'bn.js';
import { Optional, Transaction } from '@near-wallet-selector/core';

export function SupportedToken(props: { token: string }) {
    const { token } = props;
    const [lowerBound, setLowerBound] = React.useState<number>(-1);
    const [confirmationCount, setConfirmationCount] = React.useState<number>(0);
    const query = useQuery({
        queryKey: ['registered', token],
        queryFn: async () => {
            const near = await nearAPI.connect({
                networkId: config.nearEnv,
                nodeUrl: config.nearRpcEndpoint,
            });

            const account = await near.account('dontcare');

            return Promise.all([
                account.viewFunction({
                    contractId: contractAccountId.value,
                    methodName: 'check_token_registered',
                    args: {
                        token_id: token,
                    },
                }),
                account.viewFunction({
                    contractId: token,
                    methodName: 'ft_metadata',
                    args: {},
                }),
            ]);
        },
    });

    useEffect(() => {
        async function fetchBalance() {
            const near = await nearAPI.connect({
                networkId: config.nearEnv,
                nodeUrl: config.nearRpcEndpoint,
            });

            const account = await near.account('dontcare');

            const balance = await account.viewFunction({
                contractId: token,
                methodName: 'ft_balance_of',
                args: {
                    account_id: contractAccountId.value,
                },
            });

            if (lowerBound < 0 || parseFloat(balance) > lowerBound) {
                setLowerBound(parseFloat(balance));
            }
        }

        const polling = setInterval(async () => {
            setConfirmationCount((prev) => {
                if (prev >= 10) {
                    return prev;
                }

                fetchBalance();

                return prev + 1;
            });
        }, 2000);

        return () => {
            clearInterval(polling);
        };
    }, []);

    async function register() {
        if (activeAccount.value?.accountId !== contractVersion.value?.owner) {
            alert('You are not the owner of the contract!');
            return;
        }

        const near = await nearAPI.connect({
            networkId: config.nearEnv,
            nodeUrl: config.nearRpcEndpoint,
        });

        const account = await near.account('dontcare');

        const transactions: Array<Optional<Transaction, 'signerId'>> = [];

        const [storageBalanceBounds, storageBalanceOf] = await Promise.all([
            account.viewFunction({
                contractId: token,
                methodName: 'storage_balance_bounds',
                args: {},
            }),
            account.viewFunction({
                contractId: token,
                methodName: 'storage_balance_of',
                args: {
                    account_id: contractAccountId.value,
                },
            }),
        ]);

        const requiredStorageDeposit = new BN(storageBalanceBounds.min).sub(
            new BN(storageBalanceOf)
        );

        if (requiredStorageDeposit.gt(new BN(0))) {
            transactions.push({
                receiverId: token,
                actions: [
                    {
                        type: 'FunctionCall',
                        params: {
                            methodName: 'storage_deposit',
                            args: {
                                account_id: contractAccountId.value,
                            },
                            gas: '50000000000000',
                            deposit: requiredStorageDeposit.toString(),
                        },
                    },
                ],
            });
        }

        transactions.push({
            receiverId: contractAccountId.value,
            actions: [
                {
                    type: 'FunctionCall',
                    params: {
                        methodName: 'register_token',
                        args: {
                            token_id: token,
                        },
                        gas: '50000000000000',
                        deposit: '1',
                    },
                },
            ],
        });

        await wallet.value?.signAndSendTransactions({
            transactions,
        });

        query.refetch();
    }

    async function withdraw() {
        if (activeAccount.value?.accountId !== contractVersion.value?.owner) {
            alert('You are not the owner of the contract!');
            return;
        }

        if (lowerBound < 1) {
            alert('No balance to withdraw!');
            return;
        }

        const near = await nearAPI.connect({
            networkId: config.nearEnv,
            nodeUrl: config.nearRpcEndpoint,
        });

        const account = await near.account('dontcare');

        const transactions: Array<Optional<Transaction, 'signerId'>> = [];

        transactions.push({
            receiverId: contractAccountId.value,
            actions: [
                {
                    type: 'FunctionCall',
                    params: {
                        methodName: 'withdraw_ft',
                        args: {
                            token_id: token,
                            amount: new BN(lowerBound).toString(),
                            receiver_id: activeAccount.value?.accountId,
                        },
                        gas: '50000000000000',
                        deposit: '1',
                    },
                },
            ],
        });

        await wallet.value?.signAndSendTransactions({
            transactions,
        });

        setLowerBound(-1);
        setConfirmationCount(0);
    }

    const [registered, metadata] = query.data || [null, {}];

    if (query.isLoading) {
        return <div class='mt-3'>Loading... ({token})</div>;
    }

    if (query.data && registered === true) {
        return (
            <div class='mt-3'>
                <hr class='h-1 my-5 bg-gray-400 dark:bg-gray-600' />
                <h1 class='text-xl mt-8 mb-5'>{metadata.symbol}</h1>
                <p>
                    Balance:{' '}
                    {lowerBound < 0
                        ? '?'
                        : (lowerBound / 10 ** metadata.decimals).toPrecision(
                              3
                          )}{' '}
                    {metadata.symbol}
                </p>
                {confirmationCount < 10 ? (
                    <p>
                        Withdrawal is available after {10 - confirmationCount}{' '}
                        confirmations
                    </p>
                ) : (
                    <>
                        [&nbsp;
                        <a
                            href='#'
                            class='text-blue-600 dark:text-blue-400 hover:underline'
                            onClick={(e) => {
                                e.preventDefault();

                                withdraw();
                            }}
                        >
                            Withdraw
                        </a>
                        &nbsp;]
                    </>
                )}
            </div>
        );
    }

    if (query.data && registered === false) {
        return (
            <div class='mt-3'>
                <hr class='h-1 my-5 bg-gray-400 dark:bg-gray-600' />
                <h1 class='text-xl mt-8 mb-5'>{metadata.symbol}</h1>
                Not Supported Yet. [&nbsp;
                <a
                    href='#'
                    class='text-blue-600 dark:text-blue-400 hover:underline'
                    onClick={(e) => {
                        e.preventDefault();

                        register();
                    }}
                >
                    Register
                </a>
                &nbsp;]
            </div>
        );
    }

    return <div class='mt-3'>Unknown response... ({token})</div>;
}
