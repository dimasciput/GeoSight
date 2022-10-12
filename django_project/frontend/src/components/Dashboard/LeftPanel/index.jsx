/* ==========================================================================
   LEFT SIDE CONTAINER
   ========================================================================== */

import React, { useState } from 'react';
import { useSelector } from "react-redux";

import LeftRightToggleButton, { LEFT, RIGHT } from '../../ToggleButton'
import MapInfo from './MapInfo'
import Basemaps from './Basemaps'
import ProjectOverviewSection from './ProjectOverview'
import ContextLayersAccordion from './ContextLayers'
import GlobalDateSelector from './GlobalDateSelector'
import Indicators from './Indicators'
import IndicatorLayersAccordion from './IndicatorLayers'
import ReferenceLayerSection from './ReferenceLayer'
import FiltersAccordion from './Filters'

import './style.scss';

/**
 * Left panel.
 */
export default function LeftPanel({ setLeftExpanded }) {
  const {
    basemapsLayers
  } = useSelector(state => state.dashboard.data);
  const [state, setState] = useState(LEFT);
  const [tab, setTab] = useState('LAYERS');

  const onLeft = () => {
    setState(LEFT);
    if (setLeftExpanded) {
      setLeftExpanded(true)
    }
  };
  const onRight = () => {
    setState(RIGHT);
    if (setLeftExpanded) {
      setLeftExpanded(false)
    }
  };
  const [expanded, setExpanded] = useState('indicators');

  const handleChange = (panel) => (event, isExpanded) => {
    if (panel === 'projectOverview' && isExpanded) {
      setExpanded('projectOverview')
    } else {
      setExpanded(expanded === 'indicators' ? 'contextLayers' : 'indicators');
    }
  };

  const className = `dashboard__panel dashboard__left_side ${state} ${expanded ? 'expanded' : ''} `
  const classNameWrapper = `dashboard__content-wrapper ${tab}`
  return (
    <section className={className}>
      <LeftRightToggleButton
        initState={state}
        onLeft={onLeft}
        onRight={onRight}/>
      <div className={classNameWrapper}>
        <div className='dashboard__content-wrapper__navbar'>
          <div onClick={() => setTab('LAYERS')}
               className={tab === 'LAYERS' ? 'active' : ''}>
            LAYERS
          </div>
          <div onClick={() => setTab('FILTERS')}
               className={tab === 'FILTERS' ? 'active' : ''}>
            FILTERS
          </div>
        </div>
        <div className='dashboard__content-wrapper__inner dataset-wrapper'>
          <ProjectOverviewSection
            expanded={expanded === 'projectOverview'}
            handleChange={handleChange}
          />
          <ContextLayersAccordion
            expanded={expanded === 'contextLayers'}
            handleChange={handleChange}
          />
          <IndicatorLayersAccordion
            expanded={expanded === 'indicators'}
            handleChange={handleChange}
          />
          <Indicators/>
        </div>
        <div className='dashboard__content-wrapper__inner filter-wrapper'>
          <FiltersAccordion/>
        </div>
      </div>
      <div className='dashboard__left_side__bottom'>
        <div className='dashboard__left_side__basemaps'>
          <Basemaps data={basemapsLayers}/>
        </div>
        <ReferenceLayerSection/>
        <MapInfo/>
      </div>
      <GlobalDateSelector/>
    </section>
  )
}
