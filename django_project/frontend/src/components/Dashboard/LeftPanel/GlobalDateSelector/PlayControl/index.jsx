/* ==========================================================================
   DATE SELECTOR
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import Slider from '@mui/material/Slider';
import { Actions } from "../../../../../store/dashboard";
import { ThemeButton } from "../../../../Elements/Button";
import { allDataIsReady } from "../../../../../utils/indicators";

import './style.scss';

/***
 * Play control
 */
export default function PlayControl({ dates, initDate }) {
  const dispatch = useDispatch();
  const selectedGlobalTime = useSelector(state => state.selectedGlobalTime);
  const indicatorsData = useSelector(state => state.indicatorsData);
  const currentIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);

  // Speed it 2 second for 0%
  const minSpeed = 10; // second
  const [speed, setSpeed] = useState(1);
  const [nextIdx, setNextIdx] = useState(-1);

  // Set play control
  const [isPlay, setIsPlay] = useState(false);
  const [isPause, setIsPause] = useState(false);

  const idx = dates.indexOf(selectedGlobalTime)

  /**
   * Control functions
   */
  const play = () => {
    setIsPlay(true)
    setIsPause(false)
    setNextIdx(-1)
  }
  const pause = () => {
    setIsPlay(false)
    setIsPause(true)
    setNextIdx(-1)
  }
  const stop = () => {
    setIsPlay(false)
    setIsPause(false)
    setNextIdx(-1)
    dispatch(Actions.SelectedGlobalTime.change(initDate))
  }

  /**
   * Change date if play
   */
  useEffect(() => {
    if (isPlay) {
      const speedTime = minSpeed * 1000 / speed;
      setTimeout(function () {
        let nextIdx;
        if (idx === dates.length - 1) {
          nextIdx = 0
        } else {
          nextIdx = idx + 1
        }
        setNextIdx(nextIdx)
      }, speedTime);
    }
  }, [selectedGlobalTime, isPlay]);

  /**
   * If is play and nextIDX changed
   */
  useEffect(() => {
    if (isPlay && nextIdx >= 0) {
      let indicatorLayerData = []
      if (currentIndicatorLayer.indicators) {
        currentIndicatorLayer.indicators.map(indicatorLayer => {
          indicatorLayerData.push(indicatorsData[indicatorLayer.id])
        })
        if (allDataIsReady(indicatorLayerData)) {
          dispatch(Actions.SelectedGlobalTime.change(dates[nextIdx]))
        }
      }
    }
  }, [indicatorsData, nextIdx]);

  return <div className='GlobalDateSelectionControl'>
    <ThemeButton
      variant={'secondary Basic ' + (!isPlay ? 'Reverse' : '')}
      disabled={isPlay} onClick={play}>
      <PlayArrowIcon/>
    </ThemeButton>
    <ThemeButton
      variant={'secondary Basic ' + (!isPause ? 'Reverse' : '')}
      disabled={!isPlay} onClick={pause}>
      <PauseIcon/>
    </ThemeButton>
    <ThemeButton
      variant={'secondary Basic Reverse'}
      disabled={!isPlay && !isPause} onClick={stop}>
      <StopIcon/>
    </ThemeButton>
    <div className='GlobalDateSelectionSpeedControl'>
      <div className='GlobalDateSelectionSpeedControlText'>Speed
      </div>
      <Slider
        value={speed}
        min={1}
        max={100}
        onChange={(evt) => {
          setSpeed(evt.target.value)
        }}
      />
    </div>
  </div>
}