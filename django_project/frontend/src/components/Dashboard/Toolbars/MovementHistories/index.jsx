/* ==========================================================================
   History Movement
   ========================================================================== */

import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import HomeIcon from '@mui/icons-material/Home';
import ForwardIcon from '@mui/icons-material/Forward';
import { Actions } from '../../../../store/dashboard/index'

import { Plugin, PluginChild } from "../../MapLibre/Plugin";

import './style.scss';

/**
 * Movement history component.
 */
export default function MovementHistories({ map }) {
  const prevState = useRef();
  const dispatch = useDispatch()
  const { extent } = useSelector(state => state.map)
  const [history, setHistory] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(null);

  /**
   * When map moved
   */
  useEffect(() => {
    if (map) {
      map.on('moveend', function () {
        const bounds = map.getBounds()
        const newExtent = [
          bounds._sw.lng, bounds._sw.lat,
          bounds._ne.lng, bounds._ne.lat
        ]
        if (!prevState.force) {
          dispatch(Actions.Map.updateExtent(newExtent))
        }
        prevState.force = false
      });
    }
  }, [map]);

  /**
   * When new bound changed
   */
  useEffect(() => {
    if (extent && !prevState.force) {
      if (currentIdx === null) {
        setHistory([extent])
        setCurrentIdx(0)
      } else {
        const newIdx = currentIdx + 1
        const newHistory = history.slice(0, newIdx)
        setCurrentIdx(newIdx)
        setHistory([...newHistory, extent])
      }
    } else if (prevState.force) {
      map.fitBounds([
        [extent[0], extent[1]],
        [extent[2], extent[3]]
      ])
    }
  }, [extent]);

  /***
   * Change bound by idx
   */
  const changeBound = (idx) => {
    const newBoundFromHistory = history[idx]
    setCurrentIdx(idx)
    prevState.force = true
    dispatch(Actions.Map.updateExtent(newBoundFromHistory))
  }

  const homeDisabled = !map || !history.length
  const backwardDisabled = !map || !history.length || currentIdx === 0
  const forwardDisabled = !map || !history.length || currentIdx === history.length - 1

  return (
    <Fragment>
      <Plugin className={'MovementHistory'}>
        <PluginChild
          title={'Back to home'} disabled={homeDisabled} onClick={() => {
          if (!homeDisabled) {
            changeBound(0)
          }
        }}>
          <HomeIcon/>
        </PluginChild>
        <PluginChild
          title={'Previous place'} disabled={backwardDisabled}
          className='MovementPreviousIcon'
          onClick={() => {
            if (!backwardDisabled) {
              changeBound(currentIdx - 1)
            }
          }}>
          <ForwardIcon/>
        </PluginChild>
        <PluginChild
          title={'Next place'} disabled={forwardDisabled}
          onClick={() => {
            if (!forwardDisabled) {
              changeBound(currentIdx + 1)
            }
          }}>
          <ForwardIcon/>
        </PluginChild>
      </Plugin>
    </Fragment>
  )
}