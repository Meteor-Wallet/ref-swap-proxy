import { useLocation } from 'preact-iso';
import {
    accounts,
    activeAccount,
    wallet,
    walletSelectorModal,
} from '../signals/wallet';
import { darkMode } from '../signals/darkMode';
import { contractVersion, deployContract } from '../signals/contract';

export function Header() {
    const { url } = useLocation();

    return (
        <nav class='bg-white border-gray-200 dark:bg-gray-900'>
            <div class='max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4'>
                <a
                    href='/'
                    class='flex items-center space-x-3 rtl:space-x-reverse'
                >
                    <span class='self-center text-2xl text-gray-900 font-semibold whitespace-nowrap dark:text-white'>
                        Ref Exchange Proxy V2
                    </span>
                </a>
                <div class='flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse'>
                    <button
                        type='button'
                        class='flex text-sm bg-white text-gray-800 dark:text-white dark:bg-gray-800 md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600'
                        id='user-menu-button'
                        aria-expanded='false'
                        data-dropdown-toggle='user-dropdown'
                        data-dropdown-placement='bottom'
                    >
                        <span class='sr-only'>Open user menu</span>
                        {activeAccount.value?.accountId ?? 'Guest'}
                    </button>
                    <div
                        class='z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600'
                        id='user-dropdown'
                    >
                        {activeAccount.value && (
                            <div class='px-4 py-3'>
                                <span class='block text-sm text-gray-900 dark:text-white'>
                                    {activeAccount.value?.accountId}
                                </span>
                                <div class='flex flex-row'>
                                    <img
                                        class='block my-1 h-3 w-3 rounded-full mr-1'
                                        src={wallet.value?.metadata.iconUrl}
                                    />
                                    <span class='block text-sm  text-gray-500 truncate dark:text-gray-400'>
                                        {wallet.value?.metadata.name}
                                    </span>
                                </div>
                            </div>
                        )}
                        <ul class='py-2' aria-labelledby='user-menu-button'>
                            {darkMode.value ? (
                                <li>
                                    <a
                                        href='#'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            darkMode.value = false;
                                        }}
                                        class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white'
                                    >
                                        Switch to Light Mode
                                    </a>
                                </li>
                            ) : (
                                <li>
                                    <a
                                        href='#'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            darkMode.value = true;
                                        }}
                                        class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white'
                                    >
                                        Switch to Dark Mode
                                    </a>
                                </li>
                            )}
                            <li>
                                <a
                                    href='/settings'
                                    class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white'
                                >
                                    Settings
                                </a>
                            </li>
                            {activeAccount.value ? (
                                <li>
                                    <a
                                        href='#'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            wallet.value?.signOut();
                                        }}
                                        class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white'
                                    >
                                        Sign out
                                    </a>
                                </li>
                            ) : (
                                <li>
                                    <a
                                        href='#'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            walletSelectorModal.show();
                                        }}
                                        class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white'
                                    >
                                        Sign in
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                    <button
                        data-collapse-toggle='navbar-user'
                        type='button'
                        class='inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
                        aria-controls='navbar-user'
                        aria-expanded='false'
                    >
                        <span class='sr-only'>Open main menu</span>
                        <svg
                            class='w-5 h-5'
                            aria-hidden='true'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 17 14'
                        >
                            <path
                                stroke='currentColor'
                                stroke-linecap='round'
                                stroke-linejoin='round'
                                stroke-width='2'
                                d='M1 1h15M1 7h15M1 13h15'
                            />
                        </svg>
                    </button>
                </div>
                <div
                    class='items-center justify-between hidden w-full md:flex md:w-auto md:order-1'
                    id='navbar-user'
                >
                    <ul class='flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700'>
                        <li>
                            <a
                                href='/'
                                class={`block py-2 px-3 ${
                                    url == '/'
                                        ? 'text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500'
                                        : 'text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700'
                                }`}
                                aria-current='page'
                            >
                                Home
                            </a>
                        </li>
                        <li>
                            <a
                                href='/contract/info'
                                class={`block py-2 px-3 ${
                                    url == '/contract/info'
                                        ? 'text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500'
                                        : 'text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700'
                                }`}
                            >
                                Contract Info
                            </a>
                        </li>
                        <li>
                            <a
                                href='/contract/tokens'
                                class={`block py-2 px-3 ${
                                    url == '/contract/tokens'
                                        ? 'text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500'
                                        : 'text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700'
                                }`}
                            >
                                Contract Tokens
                            </a>
                        </li>
                        <li>
                            <a
                                href='/contract/patch-notes'
                                class={`block py-2 px-3 ${
                                    url == '/contract/patch-notes'
                                        ? 'text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500'
                                        : 'text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700'
                                }`}
                            >
                                Patch Notes
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
