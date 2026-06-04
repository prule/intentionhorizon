import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import { initStore } from './data/store';
import App from './App';

// Load the IndexedDB-backed store into the in-memory cache before first paint,
// so the synchronous compute/render layer always has data to read.
initStore().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
