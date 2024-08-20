import {
    contractVersion,
    deployContract,
    refreshContractVersion,
} from '../../signals/contract';
import {
    accountState,
    activeAccount,
    refreshAccountState,
} from '../../signals/wallet';
import { LoginRequired } from '../../components/LoginRequired';
import React from 'preact/compat';
import { utils } from 'near-api-js';

export function DeployContract() {
    const [secret, setSecret] = React.useState('');
    const [deploying, setDeploying] = React.useState(false);
    const [deployError, setDeployError] = React.useState<string | null>(null);

    const accountBalance = accountState.value?.amount;

    if (!activeAccount.value) {
        return <LoginRequired />;
    }

    if (contractVersion.value) {
        return (
            <div class='container mx-auto px-4'>
                <h1 class='text-xl mt-8 mb-5'>
                    Contract deployed successfully!
                </h1>
            </div>
        );
    }

    return (
        <div class='container mx-auto px-4'>
            <h1 class='text-xl mt-8 mb-5'>Deploy Contract</h1>
            <hr class='h-1 my-5 bg-gray-400 dark:bg-gray-600' />
            <p class='my-5'>
                For security reasons, we need to request your seed phrase /
                private key to deploy the contract. Detailed information and the
                reasons behind this requirement are provided in the following
                link: [&nbsp;
                <a
                    href='https://github.com/Near-Playground/account-smart-contract/blob/main/markdown/wallet-selector-deploy-contract-challenges.md'
                    class='text-blue-600 dark:text-blue-400 hover:underline'
                    target='_blank'
                >
                    Read More
                </a>
                &nbsp;]
            </p>
            <p class='my-5'>
                Your seed phrase / private key won't be sent to any server nor
                being stored locally. It will be kept in memory and disposed as
                soon as the contract is deployed or you leave this page.
            </p>
            <hr class='h-1 my-5 bg-gray-400 dark:bg-gray-600' />
            <h1 class='text-lg my-5'>Step 1: Account Secret</h1>
            <div class='my-5'>
                <label
                    for='email'
                    class='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                >
                    Seed Phrase / Private Key for account &nbsp;
                    {activeAccount.value.accountId}
                </label>
                <input
                    type='text'
                    class='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                    placeholder='ed25519:xxxxxx'
                    value={secret}
                    onInput={(e) => {
                        setSecret((e.target as HTMLInputElement).value);
                    }}
                    required
                />
            </div>
            <hr class='h-1 my-5 bg-gray-400 dark:bg-gray-600' />
            <h1 class='text-lg my-5'>Step 2: Account Balance</h1>
            <p class='my-5'>
                Your account balance:&nbsp;
                {utils.format.formatNearAmount(accountBalance ?? '0', 2)} Near.
                [&nbsp;
                <a
                    class='text-blue-600 dark:text-blue-400 hover:underline'
                    href='https://near-faucet.io/'
                    target='_blank'
                >
                    Top Up Here
                </a>
                &nbsp;] [&nbsp;
                <a
                    class='text-blue-600 dark:text-blue-400 hover:underline'
                    href='#'
                    onClick={(e) => {
                        e.preventDefault();
                        refreshAccountState();
                    }}
                >
                    Refresh Balance
                </a>
                &nbsp;]
            </p>
            <p class='my-5'>
                Recommended to spare at least 7 Near for storage usage.
            </p>
            <hr class='h-1 my-5 bg-gray-400 dark:bg-gray-600' />
            <h1 class='text-lg my-5'>Step 3: Deploy the contract</h1>
            <button
                type='button'
                disabled={deploying}
                onClick={async () => {
                    setDeploying(true);
                    setDeployError(null);
                    await deployContract(secret).catch((err: unknown) =>
                        err instanceof Error
                            ? setDeployError(err.message)
                            : setDeployError('Unknown error')
                    );
                    refreshContractVersion();
                    setDeploying(false);
                }}
                class='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
            >
                Deploy Contract
            </button>
            {deployError && (
                <p class='text-red-600 dark:text-red-400'>{deployError}</p>
            )}
        </div>
    );
}
