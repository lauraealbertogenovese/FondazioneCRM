import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SnackbarProvider } from 'notistack';
import { setDefaultOptions } from 'date-fns';
import { it } from 'date-fns/locale';
const root = ReactDOM.createRoot(document.getElementById('root'));
setDefaultOptions({locale:it})
root.render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={3}  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} autoHideDuration={3000}>
      <App />
    </SnackbarProvider>
  </React.StrictMode>
);
