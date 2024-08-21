import { walletSelectorModal } from '../signals/wallet';

export function LoginRequired() {
    return (
        <div class='container mx-auto px-4'>
            <h1 class='text-xl mt-8 mb-5'>Login Required</h1>
            <hr class='h-1 my-5 bg-gray-400 dark:bg-gray-600' />
            <p class='my-5'>
                As a contract dApp, most of the feature in this application
                requires you to login with your NEAR account. Please login to
                continue.
            </p>
            <button
                type='button'
                onClick={() => {
                    walletSelectorModal.show();
                }}
                class='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
            >
                Login
            </button>
        </div>
    );
}
