import React from 'react';
import { render } from 'react-dom';
import App from './App';
import './i18n';

render(
  <React.Suspense fallback="Loading...">
    <App />
  </React.Suspense>,
  document.getElementById('root')
);
