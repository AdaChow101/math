// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 对应 index.html 中的 id="root"
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);