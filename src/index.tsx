import {
    LocationProvider,
    Router,
    Route,
    hydrate,
    prerender as ssr,
} from 'preact-iso';
import { Header } from './components/Header.jsx';
import { Home } from './pages/Home/index.jsx';
import { DeployContract } from './pages/Contract/deploy.jsx';
import { Settings } from './pages/Settings/index.jsx';
import { NotFound } from './pages/_404.jsx';
import './style.css';
import 'flowbite';

export function App() {
    return (
        <LocationProvider>
            <Header />
            <main>
                <Router>
                    <Route path='/' component={Home} />
                    <Route path='/contract/deploy' component={DeployContract} />
                    <Route path='/settings' component={Settings} />
                    <Route default component={NotFound} />
                </Router>
            </main>
        </LocationProvider>
    );
}

if (typeof window !== 'undefined') {
    hydrate(<App />, document.getElementById('app')!);
}

export async function prerender(data: Record<string, unknown>) {
    return await ssr(<App {...data} />);
}
