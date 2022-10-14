/* ==========================================================================
   DATE SELECTOR
   ========================================================================== */

import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import KeyboardDoubleArrowDownIcon
  from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon
  from '@mui/icons-material/KeyboardDoubleArrowUp';
import Slider from '@mui/material/Slider';

import { fetchingData } from "../../../../Requests";
import { Actions } from "../../../../store/dashboard";
import { formatDate, formatDateTime } from "../../../../utils/main";
import { SelectWithList } from "../../../Input/SelectWithList";

import './style.scss';

/** TYPE INTERVAL SECTION */
export const INTERVALS = {
  HOURLY: 'Hourly',
  DAILY: 'Daily',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly'
}
/**
 * Indicator data.
 */
export default function GlobalDateSelector() {
  const dispatch = useDispatch();
  const { indicators } = useSelector(state => state.dashboard.data);
  const selectedGlobalTime = useSelector(state => state.selectedGlobalTime);
  const currentIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);

  const [open, setOpen] = useState(false);
  const [datesByIndicators, setDatesByIndicators] = useState({})
  const [dates, setDates] = useState([])
  const [minDate, setMinDate] = useState(null)
  const [maxDate, setMaxDate] = useState(null)
  const [interval, setInterval] = useState(INTERVALS.DAILY)

  const selectedGlobalTimeStr = JSON.stringify(selectedGlobalTime);
  const prevState = useRef();

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

  /** Update global dates
   */
  useEffect(() => {
    if (minDate === dates[0]) {
      dispatch(Actions.SelectedGlobalTime.change(null, maxDate))
    } else {
      dispatch(Actions.SelectedGlobalTime.change(minDate, maxDate))
    }
  }, [minDate, maxDate]);

  /**
   * Update dates
   */
  useEffect(() => {
    let newDates = []
    if (Object.keys(currentIndicatorLayer).length !== 0) {
      // Get dates list
      currentIndicatorLayer.indicators.map(indicator => {
        const indicatorDates = datesByIndicators[indicator.id]
        if (Array.isArray(indicatorDates)) {
          newDates = newDates.concat(indicatorDates)
        }
      })
      newDates = [...new Set(newDates)]
      newDates = newDates.reverse()
    }

    // Check interval and create dates
    const intervalGroupDates = {}
    newDates.map(newDate => {
      let group = ''
      const date = new Date(newDate)
      switch (interval) {
        case INTERVALS.YEARLY:
          group = date.getUTCFullYear()
          break
        case INTERVALS.MONTHLY:
          group = date.getUTCFullYear() + '-' + date.getUTCMonth()
          break
        case INTERVALS.DAILY:
          group = formatDate(date)
          break
        case INTERVALS.HOURLY:
          group = formatDate(date) + ' ' + date.getHours()
          break
      }
      if (!intervalGroupDates[group]) {
        intervalGroupDates[group] = []
      }
      intervalGroupDates[group].push(newDate)
    })

    // We sort
    newDates = []
    for (const [key, dates] of Object.entries(intervalGroupDates)) {
      newDates.push(dates[0])
    }
    newDates.sort()
    setDates([...newDates])

    // Check current min/max
    let min = selectedGlobalTime.min
    let max = selectedGlobalTime.max
    if (newDates) {
      if (newDates.indexOf(selectedGlobalTime.min) < 0) {
        min = newDates[0]
      }
      if (newDates.indexOf(selectedGlobalTime.max) < 0) {
        max = newDates[newDates.length - 1]
      }
    } else {
      min = null
      max = null
    }
    setMinDate(min)
    setMaxDate(max)
    const newSelectedGlobalStr = JSON.stringify({
      min: min,
      max: max
    })
    if (newSelectedGlobalStr !== prevState.selectedGlobalTimeStr) {
      prevState.selectedGlobalTimeStr = newSelectedGlobalStr
      if (min === newDates[0]) {
        dispatch(Actions.SelectedGlobalTime.change(null, max))
      } else {
        dispatch(Actions.SelectedGlobalTime.change(min, max))
      }
    }
  }, [datesByIndicators, currentIndicatorLayer, interval]);

  /***
   * Return date label
   */
  const dateLabel = (date) => {
    switch (interval) {
      case INTERVALS.YEARLY:
        return date.getUTCFullYear()
      case INTERVALS.MONTHLY:
        let month = '' + (date.getUTCMonth() + 1)
        if (month.length < 2)
          month = '0' + month;
        return month + '-' + date.getUTCFullYear()
      case INTERVALS.DAILY:
        return formatDate(date)
      case INTERVALS.HOURLY:
        return formatDateTime(date)
    }
  }

  /***
   * Change the value text of the slider
   */
  function valueLabelFormat(value) {
    if (dates[value]) {
      return dateLabel(new Date(dates[value]))
    } else {
      return ''
    }
  }

  const count = dates.length - 1
  const steps = [0, Math.floor(count * 0.33), Math.floor(count * 0.66), count]
  const marks = dates.map((date, idx) => {
    return {
      value: idx,
      label: steps.includes(idx) ? dateLabel(new Date(date)) : '',
    }
  })

  return <div className={'GlobalDateSelection ' + (open ? 'Open' : '')}>
    {
      selectedGlobalTime.max ?
        <Fragment>
          <div className='GlobalDateSelectionOuterWrapper'>
            <div className='GlobalDateSelectionWrapper'>
              <div className='GlobalDateSelectionWrapperInterval'>
                <SelectWithList
                  list={[INTERVALS.HOURLY, INTERVALS.DAILY, INTERVALS.MONTHLY, INTERVALS.YEARLY]}
                  required={true}
                  value={interval}
                  onChange={evt => {
                    setInterval(evt.value)
                  }}/>
              </div>
              <div className='GlobalDateSelectionSliderWrapper'>
                <div className='Separator'></div>
                <div
                  className={'GlobalDateSelectionSlider ' + (dates.length <= 1 ? 'Small' : '')}>
                  <Slider
                    value={[dates.indexOf(minDate), dates.indexOf(maxDate)]}
                    max={dates.length - 1}
                    valueLabelFormat={value => dates[value] ? dateLabel(new Date(dates[value])) : ''}
                    step={null}
                    valueLabelDisplay="auto"
                    marks={marks}

                    onChange={(evt) => {
                      setMinDate(dates[evt.target.value[0]])
                      setMaxDate(dates[evt.target.value[1]])
                    }}
                  />
                </div>
                <div className='Separator'></div>
              </div>
            </div>
          </div>
          {/* MINI ICON */}
          <div className='GlobalDateSelectionIconOuterWrapper'>
            <div className='GlobalDateSelectionIconWrapper'>
              <div className='Separator'></div>
              <div className='GlobalDateSelectionIcon' onClick={() => {
                setOpen(!open)
              }}>
                {open ? <KeyboardDoubleArrowDownIcon/> :
                  <KeyboardDoubleArrowUpIcon/>}
                <AccessTimeIcon/>
                <div
                  className='GlobalDateSelectionIconDate'>
                  {
                    selectedGlobalTime.min && selectedGlobalTime.min !== selectedGlobalTime.max ?
                      <Fragment>
                        {dateLabel(new Date(selectedGlobalTime.min))}
                        <span className='DateSeparator'>-</span>
                      </Fragment> :
                      ""
                  }
                  {dateLabel(new Date(selectedGlobalTime.max))}
                </div>
                {open ? <KeyboardDoubleArrowDownIcon/> :
                  <KeyboardDoubleArrowUpIcon/>}
              </div>
              <div className='Separator'></div>
            </div>
          </div>
        </Fragment> : ""
    }
  </div>
}