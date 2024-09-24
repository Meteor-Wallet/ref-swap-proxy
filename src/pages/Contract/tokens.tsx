import React from 'preact/compat';
import { z } from 'zod';
import { SupportedToken } from '../../components/SupportedToken';

const supportedTokenListFormat = z.array(
    z.union([
        z.string(),
        z.object({
            id: z.string(),
        }),
    ])
);

export function ContractTokens() {
    const [supportedTokenList, setSupportedTokenList] = React.useState<string>(
        localStorage.getItem('supportedTokenList') || '[]'
    );

    const parsedSupportedTokenList = supportedTokenListFormat.parse(
        JSON.parse(supportedTokenList)
    );

    const tokens = parsedSupportedTokenList
        .map((token) => {
            if (typeof token === 'string') {
                return token;
            }

            return token.id;
        })
        .filter((token_id) => token_id !== 'near');

    React.useEffect(() => {
        localStorage.setItem('supportedTokenList', supportedTokenList);
    }, [supportedTokenList]);

    return (
        <div class='container mx-auto px-4'>
            <div class='my-5'>
                <label
                    for='supportedTokenList'
                    class='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                >
                    Supported Token List (JSON stringified array)
                </label>
                <textarea
                    id='supportedTokenList'
                    type='text'
                    class='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                    placeholder='JSON stringify array of supported tokens'
                    onInput={(e) => {
                        const input = (e.target as HTMLInputElement).value;

                        try {
                            supportedTokenListFormat.parse(JSON.parse(input));
                            setSupportedTokenList(input);
                        } catch (err: unknown) {
                            // dont save invalid json
                        }
                    }}
                    rows={10}
                    required
                >
                    {supportedTokenList}
                </textarea>
            </div>
            <div class='my-5'>
                <h2 class='text-2xl font-semibold text-gray-900 dark:text-white'>
                    Supported Tokens
                </h2>
                <div class='mt-3'>
                    {tokens.map((token) => (
                        <SupportedToken key={token} token={token} />
                    ))}
                </div>
            </div>
        </div>
    );
}
