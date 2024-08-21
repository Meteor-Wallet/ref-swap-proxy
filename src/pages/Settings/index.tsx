import { ContractAccountId } from '../../components/ContractAccountId';
import { darkMode } from '../../signals/darkMode';
import {
    activeAccount,
    wallet,
    walletSelectorModal,
} from '../../signals/wallet';

export function Settings() {
    return (
        <div class='container mx-auto px-4'>
            <h1 class='text-xl mt-8 mb-5'>Settings</h1>
            <hr class='h-1 my-5 bg-gray-400 dark:bg-gray-600' />
            <h1 class='text-lg my-5'>Visual Settings</h1>
            <label class='inline-flex items-center my-5 cursor-pointer'>
                <input
                    type='checkbox'
                    onChange={(e) => (darkMode.value = e.currentTarget.checked)}
                    class='sr-only peer'
                    checked={darkMode.value}
                />
                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span class='ms-3 text-sm font-medium text-gray-900 dark:text-gray-300'>
                    {darkMode.value ? 'Dark mode' : 'Light mode'}
                </span>
            </label>
            <hr class='h-1 my-5 bg-gray-400 dark:bg-gray-600' />
            <h1 class='text-lg my-5'>Account Settings</h1>
            <span class='block'>
                {activeAccount.value ? (
                    <>
                        Currently logged in as:&nbsp;
                        <b>{activeAccount.value.accountId}</b>&nbsp;[&nbsp;
                        <a
                            href='#'
                            class='text-blue-600 dark:text-blue-400 hover:underline'
                            onClick={(e) => {
                                e.preventDefault();
                                wallet.value?.signOut();
                            }}
                        >
                            Log out
                        </a>
                        &nbsp;]
                    </>
                ) : (
                    <>
                        Currently not logged in. [&nbsp;
                        <a
                            href='#'
                            class='text-blue-600 dark:text-blue-400 hover:underline'
                            onClick={(e) => {
                                e.preventDefault();
                                walletSelectorModal.show();
                            }}
                        >
                            Log in
                        </a>
                        &nbsp;]
                    </>
                )}
            </span>
            <span class='flex flex-row'>
                Wallet:{' '}
                {wallet.value ? (
                    <>
                        <img
                            src={wallet.value.metadata.iconUrl}
                            class='h-4 w-4 mx-1 my-1 rounded-full'
                        />
                        <b>{wallet.value.metadata.name}</b>
                    </>
                ) : (
                    'None'
                )}
            </span>
            <hr class='h-1 my-5 bg-gray-400 dark:bg-gray-600' />
            <ContractAccountId />
            <hr class='h-1 my-5 bg-gray-400 dark:bg-gray-600' />
        </div>
    );
}
