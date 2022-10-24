import React from 'react';
import GlobalDateSelector from "./GlobalDateSelector";

import './style.scss';

/**
 * Left panel.
 */
export default function LeftPanel() {
  return <section className={'DashboardBottomPanel'}>
    <GlobalDateSelector/>
  </section>
}