import {
    LocationProvider,
    Router,
    Route,
    hydrate,
    prerender as ssr,
} from 'preact-iso';
import { Header } from './components/Header.jsx';
import { Home } from './pages/Home/index.jsx';
import { ContractInfo } from './pages/Contract/info.jsx';
import { ContractTokens } from './pages/Contract/tokens.jsx';
import { PatchNotes } from './pages/Contract/patch-notes.js';
import { Settings } from './pages/Settings/index.jsx';
import { NotFound } from './pages/_404.jsx';
import './style.css';
import 'flowbite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <LocationProvider>
                <Header />
                <main>
                    <Router>
                        <Route path='/' component={Home} />
                        <Route path='/contract/info' component={ContractInfo} />
                        <Route
                            path='/contract/tokens'
                            component={ContractTokens}
                        />
                        <Route
                            path='/contract/patch-notes'
                            component={PatchNotes}
                        />
                        <Route path='/settings' component={Settings} />
                        <Route default component={NotFound} />
                    </Router>
                </main>
            </LocationProvider>
        </QueryClientProvider>
    );
}

if (typeof window !== 'undefined') {
    hydrate(<App />, document.getElementById('app')!);
}

export async function prerender(data: Record<string, unknown>) {
    return await ssr(<App {...data} />);
}
