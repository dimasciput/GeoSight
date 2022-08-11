/* ==========================================================================
   RIGHT SIDE CONTAINER
   ========================================================================== */

import React, { Fragment, useState } from 'react';
import { useSelector } from "react-redux";

import WidgetList from '../../Widget'
import LeftRightToggleButton, { LEFT, RIGHT } from '../../ToggleButton'

import './style.scss';

export default function RightPanel() {
  const [state, setState] = useState(RIGHT);
  const { widgets } = useSelector(state => state.dashboard.data);

  const onLeft = () => {
    setState(LEFT);
  };
  const onRight = () => {
    setState(RIGHT);
  };

  const className = `dashboard__panel dashboard__right_side ${state}`
  return (
    <Fragment>
      {
        widgets && widgets.length > 0 ?
          <section className={className}>
            <LeftRightToggleButton
              initState={state}
              onLeft={onLeft}
              onRight={onRight}/>
            <div className='dashboard__content-wrapper'>
              <div className='dashboard__content'>
                <WidgetList widgets={widgets}/>
              </div>
            </div>
          </section> : ""
      }
    </Fragment>
  )
}
