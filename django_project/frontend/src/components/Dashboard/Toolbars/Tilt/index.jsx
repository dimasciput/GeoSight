/* ==========================================================================
   Tilt
   ========================================================================== */

import React, { useEffect, useState } from 'react';

import { Plugin, PluginChild } from "../../MapLibre/Plugin";

import './style.scss';

/**
 * Measurement
 */
export default function Tilt({ map }) {
  const [degree, setDegree] = useState(false);

  const calculateDegree = () => {
    setDegree(Math.floor(90 - map.getPitch()))
  }
  /**
   * Map created
   */
  useEffect(() => {
    if (map) {
      map.on('pitch', function () {
        calculateDegree()
      });
      calculateDegree()
    }
  }, [map]);

  return <Plugin className={'TiltControl'}>
    <PluginChild
      title={'Reset tilt'}
      disabled={!map}
      onClick={() => {
        map.easeTo({ pitch: 0 })
      }}>
      <div className='TiltBase'/>
      <div className='TiltDegreeLine'
           style={{ transform: 'rotate(-' + degree + 'deg)' }}/>
      <div className='TiltDegree'>{degree}</div>
    </PluginChild>
  </Plugin>
}