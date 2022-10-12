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
import Slider from '@mui/material/Slider';
import { fetchingData } from "../../../../Requests";
import { Actions } from "../../../../store/dashboard";
import { formatDate } from "../../../../utils/main";

import './style.scss';

/**
 * Indicator data.
 */
export default function Indicators() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { indicators } = useSelector(state => state.dashboard.data);
  const [datesByIndicators, setDatesByIndicators] = useState({})
  const selectedGlobalTime = useSelector(state => state.selectedGlobalTime);
  const [initDate, setInitDate] = useState((new Date()).toISOString())

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

  /** Init date
   */
  useEffect(() => {
    dispatch(Actions.SelectedGlobalTime.change(initDate))
  }, []);

  // Get dates list
  let dates = [initDate]
  for (const [key, value] of Object.entries(datesByIndicators)) {
    if (Array.isArray(value)) {
      dates = dates.concat(value)
    }
  }
  dates = [...new Set(dates)]
  dates = dates.sort()

  /***
   * Change the value text of the slider
   */
  function valueLabelFormat(value) {
    if (dates[value] === initDate) {
      return 'Today'
    } else {
      return dates[value]
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
                  valueLabelDisplay="auto"
                  marks={marks}

                  onChange={(evt) => {
                    dispatch(
                      Actions.SelectedGlobalTime.change(dates[evt.target.value])
                    )
                  }}
                />
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
              <div className='GlobalDateSelectionIconDate'>{formatDate(new Date(selectedGlobalTime))}</div>
              {open ? <KeyboardDoubleArrowDownIcon/> :
                <KeyboardDoubleArrowUpIcon/>}
            </div>
          </div>
        </Fragment> : ""
    }
  </div>
}