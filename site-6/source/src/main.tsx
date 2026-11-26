import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/cormorant/wght.css';
import '@fontsource-variable/cormorant/wght-italic.css';
import '@fontsource-variable/montserrat/wght.css';
import 'lenis/dist/lenis.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
