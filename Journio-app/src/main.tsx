// import '@/mock/travel';
// import '@/mock/user';
import { config as AmapConfig } from '@amap/amap-react';
// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/theme.scss';
AmapConfig.version = '2.0';
AmapConfig.key = '7c1a41248f5e3a3c3e3da5cde9b7df24';
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(<App />);
