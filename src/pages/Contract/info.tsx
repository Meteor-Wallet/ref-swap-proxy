import React from 'preact/compat';
import { patchNotes } from '../../data/patch-note';
import {
    contractVersion,
    deployContract,
    updateContract,
} from '../../signals/contract';

export function ContractInfo() {
    const [fee, setFee] = React.useState<string>('0.2');
    const [referralId, setReferralId] = React.useState<string>('');

    const {
        version,
        humanReadableVersion,
        accountExists,
        contractDeployed,
        locked,
        owner,
    } = contractVersion.value ?? {};

    if (accountExists !== true) {
        return (
            <div class='container mx-auto px-4'>
                <h1 class='text-xl mt-8 mb-5'>Contract Account Id not set!</h1>
                <div>
                    Please configure contract account id in [&nbsp;
                    <a
                        href='/settings'
                        class='text-blue-600 dark:text-blue-400 hover:underline'
                    >
                        settings
                    </a>
                    &nbsp;].
                </div>
            </div>
        );
    }

    const latestPatch = patchNotes[patchNotes.length - 1];

    if (contractDeployed !== true) {
        return (
            <div class='container mx-auto px-4'>
                <h2 class='text-lg mt-8 mb-5'>Fresh account found!</h2>
                <div class='my-5'>
                    <label
                        for='contractAccountId'
                        class='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                    >
                        Fee (%)
                    </label>
                    <input
                        id='contractAccountId'
                        type='number'
                        step='0.01'
                        class='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        placeholder='Maximum 2 digit allowed'
                        value={fee}
                        onInput={(e) => {
                            setFee((e.target as HTMLInputElement).value);
                        }}
                        required
                    />
                </div>
                <div class='my-5'>
                    <label
                        for='contractAccountId'
                        class='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                    >
                        Ref Finance Referral Id (Leave this blank if you don't
                        know what is this)
                    </label>
                    <input
                        id='contractAccountId'
                        type='text'
                        class='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        placeholder="Leave this blank if you don't know what is this"
                        value={referralId}
                        onInput={(e) => {
                            setReferralId((e.target as HTMLInputElement).value);
                        }}
                    />
                </div>
                <button
                    type='button'
                    onClick={(e) => {
                        e.preventDefault();

                        deployContract(
                            Math.round(parseFloat(fee) * 100),
                            referralId
                        );
                    }}
                    class='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                >
                    Deploy Contract
                </button>
            </div>
        );
    }

    if (version === -1) {
        return (
            <div class='container mx-auto px-4'>
                <h1 class='text-xl mt-8 mb-5'>Error!</h1>
                <div>
                    The account already have a contract in it, but it is not the
                    recognised contract.
                </div>
            </div>
        );
    }

    return (
        <div class='container mx-auto px-4'>
            <p class='my-5 dark:text-green-300 text-green-700'>
                Recognised contract detected!
            </p>
            <p class='my-5'>Contract version: {humanReadableVersion}</p>
            <p class='my-5'>
                Latest Patch: {latestPatch.humanReadableVersion}
                {latestPatch.version !== version && !locked && (
                    <>
                        &nbsp;[&nbsp;
                        <a
                            href='#'
                            class='text-blue-600 dark:text-blue-400 hover:underline'
                            onClick={(e) => {
                                e.preventDefault();

                                updateContract();
                            }}
                        >
                            Update Contract
                        </a>
                        &nbsp;]
                    </>
                )}
            </p>
            <p class='my-5'>Contract owner: {owner}</p>
            <p class='my-5'>Contract Locked: {locked ? 'Yes' : 'No'}</p>
        </div>
    );
}
