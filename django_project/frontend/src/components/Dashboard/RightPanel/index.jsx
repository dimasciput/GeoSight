/* ==========================================================================
   RIGHT SIDE CONTAINER
   ========================================================================== */

import React, { Fragment, useState } from 'react';
import { useSelector } from "react-redux";

import WidgetList from '../../Widget'
import MapLegend from "./MapLegend";
import LeftRightToggleButton, { LEFT, RIGHT } from '../../ToggleButton'

import './style.scss';

export default function RightPanel() {
  const { widgets } = useSelector(state => state.dashboard.data);
  const hasWidget = widgets && widgets.length > 0
  const [state, setState] = useState(hasWidget ? RIGHT : LEFT);

  const onLeft = () => {
    setState(LEFT);
  };
  const onRight = () => {
    setState(RIGHT);
  };

  const className = `dashboard__panel dashboard__right_side ${state}`
  return (
    <Fragment>
      <section className={className}>
        {
          hasWidget ?
            <LeftRightToggleButton
              initState={state}
              onLeft={onLeft}
              onRight={onRight}/>
            : ""
        }
        <div className='dashboard__content-wrapper'>
          <div className='dashboard__content'>
            <WidgetList widgets={widgets}/>
          </div>
        </div>
        <div className='dashboard__right_side__bottom'>
          <MapLegend/>
        </div>
      </section>
    </Fragment>
  )
}
