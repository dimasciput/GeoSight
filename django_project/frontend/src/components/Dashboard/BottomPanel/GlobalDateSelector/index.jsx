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
import Switch from "@mui/material/Switch";

import { fetchingData } from "../../../../Requests";
import { Actions } from "../../../../store/dashboard";
import { formatDate, formatDateTime } from "../../../../utils/main";
import { SelectWithList } from "../../../Input/SelectWithList";

import './style.scss';

/** TYPE INTERVAL SECTION */
export const INTERVALS = {
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
  const currentIndicatorSecondLayer = useSelector(state => state.selectedIndicatorSecondLayer);

  const [open, setOpen] = useState(false)
  const [datesByIndicators, setDatesByIndicators] = useState({})
  const [dates, setDates] = useState([])

  const [isInFilter, setIsInFilter] = useState(false)
  const [isInLatestValue, setIsInLatestValue] = useState(false)
  const [selectedDatePoint, setSelectedDatePoint] = useState(null)
  const [interval, setInterval] = useState(INTERVALS.DAILY)
  const [minDate, setMinDate] = useState(null)
  const [maxDate, setMaxDate] = useState(null)

  const prevState = useRef();

  /***
   * Return date label
   */
  const dateLabel = (date) => {
    switch (interval) {
      case INTERVALS.YEARLY:
        return date.getFullYear()
      case INTERVALS.MONTHLY:
        let month = '' + (date.getMonth() + 1)
        if (month.length < 2)
          month = '0' + month;
        return month + '-' + date.getFullYear()
      case INTERVALS.DAILY:
        return formatDate(date, true)
    }
  }

  /**
   *  Update dates time
   * **/
  const updateDatesTime = () => {
    if (!isInFilter) {
      const min = null
      const max = dates[dates.length - 1]
      const newSelectedGlobalStr = JSON.stringify({
        min: min,
        max: max
      })
      if (newSelectedGlobalStr !== prevState.selectedGlobalTimeStr) {
        prevState.selectedGlobalTimeStr = newSelectedGlobalStr
        dispatch(Actions.SelectedGlobalTime.change(null, max))
      }
      return
    }
    // if it is in filter
    if (selectedDatePoint) {
      let min = null
      let max = selectedDatePoint

      const selectedDate = new Date(selectedDatePoint)
      const year = selectedDate.getFullYear()
      const month = selectedDate.getMonth()
      const date = selectedDate.getDate()

      // construct min/max
      switch (interval) {
        case INTERVALS.YEARLY:
          min = formatDateTime(new Date(year, 0, 1, 0, 0, 0))
          max = formatDateTime(new Date(year, 11, 31, 23, 59, 59))
          break
        case INTERVALS.MONTHLY:
          min = formatDateTime(new Date(year, month, 1, 0, 0, 0))
          max = formatDateTime(new Date(year, month + 1, 0, 23, 59, 59))
          break
        case INTERVALS.DAILY:
          min = formatDateTime(new Date(year, month, date, 0, 0, 0))
          max = formatDateTime(new Date(year, month, date, 23, 59, 59))
          break
      }

      if (!isInFilter || isInLatestValue) {
        min = null
      }
      const newSelectedGlobalStr = JSON.stringify({
        min: min,
        max: max
      })
      if (newSelectedGlobalStr !== prevState.selectedGlobalTimeStr) {
        prevState.selectedGlobalTimeStr = newSelectedGlobalStr
        dispatch(Actions.SelectedGlobalTime.change(min, max))
      }
    }
  }

  /**
   * Return dates list of data
   * **/
  const formatDates = () => {
    let newDates = []
    // Get dates list
    currentIndicatorLayer?.indicators?.map(indicator => {
      const indicatorDates = datesByIndicators[indicator.id]
      if (Array.isArray(indicatorDates)) {
        newDates = newDates.concat(indicatorDates)
      }
    })
    currentIndicatorSecondLayer?.indicators?.map(indicator => {
      const indicatorDates = datesByIndicators[indicator.id]
      if (Array.isArray(indicatorDates)) {
        newDates = newDates.concat(indicatorDates)
      }
    })
    newDates = [...new Set(newDates)]
    newDates = newDates.reverse()

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
          group = formatDate(date, true)
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

    return newDates;
  }

  /**
   * CURRENT DATES
   * **/
  const currentDates = formatDates()
  const options = currentDates.map(date => {
    return {
      name: dateLabel(new Date(date)),
      value: date
    }
  })

  /**
   * Update Global Dates
   */
  useEffect(() => {
    updateDatesTime()
    if (!minDate || !currentDates.includes(minDate) || minDate === maxDate) {
      setMinDate(currentDates[0])
    }
    if (!maxDate || !currentDates.includes(maxDate) || minDate === maxDate) {
      setMaxDate(currentDates[currentDates.length - 1])
    }
  }, [selectedDatePoint, interval, isInLatestValue, isInFilter]);

  /**
   * Update Global Dates
   */
  useEffect(() => {
    if (!(selectedDatePoint >= minDate && selectedDatePoint <= maxDate)) {
      setSelectedDatePoint(maxDate)
    }
  }, [minDate, maxDate]);

  /**
   * Update dates
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
    let newDates = currentDates
    setDates([...newDates])

    // Check current min/max
    let max = selectedGlobalTime.max
    if (newDates && newDates.indexOf(selectedGlobalTime.max) < 0) {
      max = newDates[newDates.length - 1]
    }
    setSelectedDatePoint(max)
  }, [datesByIndicators, currentIndicatorLayer, currentIndicatorSecondLayer, interval]);

  // Update the inputs
  let currentSelectedDatePointMark = 0
  let usedDates = dates
  if (minDate && maxDate) {
    usedDates = usedDates.filter(date => date >= minDate && date <= maxDate)
  }
  const count = usedDates.length - 1
  const steps = [0, Math.floor(count * 0.5), count]
  const marks = usedDates.map((date, idx) => {
    if (date === selectedDatePoint) {
      currentSelectedDatePointMark = idx
    }
    return {
      value: idx,
      date: date,
      label: steps.includes(idx) ? dateLabel(new Date(date)) : '',
    }
  })

  return <div className={'GlobalDateSelection ' + (open ? 'Open' : '')}>
    {
      selectedDatePoint ?
        <Fragment>
          <div
            className={'GlobalDateSelectionOuterWrapper ' + (!isInFilter ? 'Disabled' : '')}>
            <div className='GlobalDateSelectionWrapper'>
              <div className='GlobalAdvancedFilter'>
                <div
                  className='GlobalDateSelectionIconDate'>
                  {
                    selectedGlobalTime.min && selectedGlobalTime.min !== selectedGlobalTime.max ?
                      <Fragment>
                        {
                          formatDateTime(new Date(selectedGlobalTime.min), true)
                        }
                        <span className='DateSeparator'>-</span>
                      </Fragment> :
                      ""
                  }
                  {
                    formatDateTime(new Date(selectedGlobalTime.max), true)
                  }
                </div>
                <div className='Separator'/>
                <Switch
                  className='Secondary'
                  checked={isInFilter}
                  onChange={() => {
                    setIsInFilter(!isInFilter)
                  }}
                />
                <div className='GlobalAdvancedFilterText'>Advanced Filter</div>
              </div>
              <div className='GlobalDateSelectionSliderWrapper'>
                <div
                  className={'GlobalDateSelectionSlider ' + (dates.length <= 1 ? 'Small' : '')}>
                  <Slider
                    value={currentSelectedDatePointMark}
                    max={marks.length - 1}
                    step={null}
                    track={false}
                    valueLabelDisplay="auto"
                    marks={marks}
                    valueLabelFormat={value => dates[value] ? dateLabel(new Date(dates[value])) : ''}
                    onChange={(evt) => {
                      setSelectedDatePoint(marks[evt.target.value].date)
                    }}
                    disabled={!isInFilter}
                  />
                </div>
                <div className='GlobalDateSelectionWrapperInterval'>
                  <SelectWithList
                    list={[INTERVALS.DAILY, INTERVALS.MONTHLY, INTERVALS.YEARLY]}
                    required={true}
                    value={interval}
                    isDisabled={!isInFilter}
                    onChange={evt => {
                      setInterval(evt.value)
                    }}/>
                  <div className='GlobalDateSelectionShowLatestValue'>
                    <Switch
                      className='Secondary'
                      checked={isInLatestValue}
                      disabled={!isInFilter}
                      onChange={() => {
                        setIsInLatestValue(!isInLatestValue)
                      }}
                    />
                    <div className='GlobalDateSelectionShowLatestValueText'>
                      Show any latest values
                    </div>
                  </div>
                  {
                    minDate ?
                      <div className='GlobalDateSelectionShowMinMax'>
                        <div className='GlobalDateSelectionShowMinMaxText'>
                          From
                        </div>
                        <SelectWithList
                          className='Selection'
                          list={options}
                          required={true}
                          value={minDate}
                          isDisabled={!isInFilter}
                          onChange={evt => {
                            if (evt.value > maxDate) {
                              setMinDate(maxDate)
                            } else {
                              setMinDate(evt.value)
                            }
                          }}/>
                      </div>
                      : ""
                  }
                  {
                    maxDate ?
                      <div className='GlobalDateSelectionShowMinMax'>
                        <div className='GlobalDateSelectionShowMinMaxText'>
                          To
                        </div>
                        <SelectWithList
                          className='Selection'
                          list={options}
                          required={true}
                          value={maxDate}
                          isDisabled={!isInFilter}
                          onChange={evt => {
                            if (evt.value < minDate) {
                              setMaxDate(minDate)
                            } else {
                              setMaxDate(evt.value)
                            }
                          }}/>
                      </div>
                      : ""
                  }
                </div>
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