import React from 'react';
import { RouterProvider } from 'react-router-dom';
import './App.css';
import { router } from './router';

function App(): React.ReactElement {
  return <RouterProvider router={router} />;
}

export default App;
