import React from 'react';
import ReactDOM from 'react-dom/client';
import AppSinglePage from './AppSinglePage'; // Single-page version
// import App from './App'; // Multi-page version
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppSinglePage />
  </React.StrictMode>
);
