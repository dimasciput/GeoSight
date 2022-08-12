import React from 'react';
import App, { render } from '../../app';
import { store } from '../../store/dashboard';

import Dashboard from '../Dashboard'


export default function DashboardPage() {
  return (
    <App>
      <Dashboard/>
    </App>
  );
}

render(DashboardPage, store)