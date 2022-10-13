/* ==========================================================================
   DATE SELECTOR
   ========================================================================== */

import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import KeyboardDoubleArrowDownIcon
  from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon
  from '@mui/icons-material/KeyboardDoubleArrowUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import Slider from '@mui/material/Slider';

import { fetchingData } from "../../../../Requests";
import { Actions } from "../../../../store/dashboard";
import { formatDate } from "../../../../utils/main";

import './style.scss';
import { ThemeButton } from "../../../Elements/Button";
import { allDataIsReady } from "../../../../utils/indicators";

/**
 * Indicator data.
 */
export default function GlobalDateSelector() {
  const dispatch = useDispatch();
  const { indicators } = useSelector(state => state.dashboard.data);
  const selectedGlobalTime = useSelector(state => state.selectedGlobalTime);
  const indicatorsData = useSelector(state => state.indicatorsData);
  const currentIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);

  const [open, setOpen] = useState(false);
  const [initDate, setInitDate] = useState((new Date()).toISOString())
  const [datesByIndicators, setDatesByIndicators] = useState({})
  const [dates, setDates] = useState([initDate])

  // Set play control
  const [isPlay, setIsPlay] = useState(false);
  const [isPause, setIsPause] = useState(false);

  // Speed it 2 second for 0%
  const minSpeed = 10; // second
  const [speed, setSpeed] = useState(1);
  const [nextIdx, setNextIdx] = useState(-1);

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

  /** Init date
   */
  useEffect(() => {
    dispatch(Actions.SelectedGlobalTime.change(initDate))
  }, []);

  /** Update dates
   */
  useEffect(() => {
    indicators.map(indicator => {
      if (!datesByIndicators[indicator.id]) {
        datesByIndicators[indicator.id] = null

        fetchingData(
          indicator.url.replace('/values/latest', '/dates'), {}, {}, function (response, error) {
            if (!error) {
              datesByIndicators[indicator.id] = response
            } else {
              datesByIndicators[indicator.id] = error.toString()
            }
            setDatesByIndicators({ ...datesByIndicators })
          }
        )
      }
    })
    setDatesByIndicators({ ...datesByIndicators })
  }, [indicators]);

  /**
   * Update dates
   */
  useEffect(() => {
    // Get dates list
    let newDates = [initDate]
    for (const [key, value] of Object.entries(datesByIndicators)) {
      if (Array.isArray(value)) {
        newDates = newDates.concat(value)
      }
    }
    newDates = [...new Set(newDates)]
    newDates = newDates.sort()
    setDates([...newDates])
  }, [datesByIndicators]);

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

  /***
   * Change the value text of the slider
   */
  function valueLabelFormat(value) {
    if (dates[value] === initDate) {
      return 'Today'
    } else {
      return dates[value].split('.')[0].replace('T', ' ')
    }
  }

  const count = dates.length - 1
  const steps = [0, Math.floor(count * 0.33), Math.floor(count * 0.66), count]
  const marks = dates.map((date, idx) => {
    return {
      value: idx,
      label: steps.includes(idx) ? formatDate(new Date(date)) : '',
    }
  })

  return <div className={'GlobalDateSelection ' + (open ? 'Open' : '')}>
    {
      selectedGlobalTime ?
        <Fragment>
          <div className='GlobalDateSelectionOuterWrapper'>
            <div className='GlobalDateSelectionWrapper'>
              <div className='GlobalDateSelectionSlider'>
                <Slider
                  track={false}
                  value={dates.indexOf(selectedGlobalTime)}
                  max={dates.length - 1}
                  valueLabelFormat={valueLabelFormat}
                  step={null}
                  disabled={isPlay}
                  valueLabelDisplay="auto"
                  marks={marks}

                  onChange={(evt) => {
                    dispatch(
                      Actions.SelectedGlobalTime.change(dates[evt.target.value])
                    )
                  }}
                />
              </div>
              <div className='GlobalDateSelectionControl'>
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
            </div>
          </div>
          <div className='GlobalDateSelectionIconWrapper'>
            <div className='GlobalDateSelectionIcon' onClick={() => {
              setOpen(!open)
            }}>
              {open ? <KeyboardDoubleArrowDownIcon/> :
                <KeyboardDoubleArrowUpIcon/>}
              <AccessTimeIcon/>
              <div
                className='GlobalDateSelectionIconDate'>{formatDate(new Date(selectedGlobalTime))}</div>
              {open ? <KeyboardDoubleArrowDownIcon/> :
                <KeyboardDoubleArrowUpIcon/>}
            </div>
          </div>
        </Fragment> : ""
    }
  </div>
}