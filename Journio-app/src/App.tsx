import { ThemeProvider } from '@/contexts/ThemeContext';
import React from 'react';
import { AliveScope } from 'react-activation';
import { RouterProvider } from 'react-router-dom';
import './App.css';
import { router } from './router';

function App(): React.ReactElement {
  return (
    <ThemeProvider>
      <AliveScope>
        <RouterProvider router={router} />
      </AliveScope>
    </ThemeProvider>
  );
}

export default App;
