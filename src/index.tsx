import React from 'react';
import ReactDOM from 'react-dom/client';
import './tailwind.css';
import './dark-overrides.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Maintenance from './Maintenance';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const isMaintenance = process.env.REACT_APP_MAINTENANCE ? (process.env.REACT_APP_MAINTENANCE === 'true') : false;

root.render(
  <React.StrictMode>
    {isMaintenance ? <Maintenance /> : <App />}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
