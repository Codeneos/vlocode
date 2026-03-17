import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { useVsCodeApi } from './hooks/useVsCodeApi';
import './styles.scss?inline';

const Root: React.FC = () => {
    const { postMessage } = useVsCodeApi();
    return <App postMessage={postMessage} />;
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <Root />
        </React.StrictMode>
    );
}
