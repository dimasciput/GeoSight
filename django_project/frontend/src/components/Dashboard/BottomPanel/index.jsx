import React from 'react';
import GlobalDateSelector from "./GlobalDateSelector";

import './style.scss';

/**
 * Left panel.
 */
export default function BottomPanel() {
  return <section className={'DashboardBottomPanel'}>
    <GlobalDateSelector/>
  </section>
}