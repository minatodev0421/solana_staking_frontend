import React from 'react';
import ReactDOM from 'react-dom';
import AppWithProvider from './App';
import {Provider} from 'react-redux'
import store from './store'
ReactDOM.render(
  // <React.StrictMode>
    <Provider store={store}>
      <AppWithProvider />
    </Provider>
    
  // </React.StrictMode>
  ,
  document.getElementById('root')
);
