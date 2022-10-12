/* ==========================================================================
   INDICATOR
   ========================================================================== */

import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../store/dashboard";
import { fetchingData } from "../../../../Requests";


/**
 * Indicator data.
 * @param {dict} indicator Indicator data.
 */
export function Indicator({ indicator }) {
  const dispatch = useDispatch();
  const indicatorData = useSelector(
    state => state.indicatorsData[indicator.id]
  );
  const selectedGlobalTime = useSelector(state => state.selectedGlobalTime);
  const [responseAndTime, setResponseAndTime] = useState(null);
  const prevState = useRef();
  prevState.selectedGlobalTime = '';

  /**
   * Fetch indicator data by the current global selected time
   */
  useEffect(() => {
    if (selectedGlobalTime && selectedGlobalTime !== prevState.selectedGlobalTime) {
      prevState.selectedGlobalTime = selectedGlobalTime
      setResponseAndTime(null)

      const { id, url } = indicator
      fetchingData(
        url, { 'time__lte': selectedGlobalTime }, {}, function (response, error) {
          setResponseAndTime({
            'time': selectedGlobalTime,
            'response': response,
            'error': error
          })
        }
      )
      dispatch(Actions.IndicatorsData.request(id))
    }
  }, [selectedGlobalTime]);

  /**
   * Update style
   */
  useEffect(() => {
    if (responseAndTime) {
      const { time, response, error } = responseAndTime
      const { id, reporting_levels } = indicator
      if (time === selectedGlobalTime) {
        dispatch(
          Actions.IndicatorsData.receive(response, error, id, reporting_levels)
        )
      }
    }
  }, [responseAndTime]);

  /**
   * Update style
   */
  useEffect(() => {
    if (indicatorData?.data) {
      dispatch(
        Actions.IndicatorsData.updateStyle(
          indicator.id, indicator.rules
        )
      );
    }
  }, [indicatorData]);

  return ""
}

/**
 * Indicator data.
 */
export default function Indicators() {
  const { indicators } = useSelector(state => state.dashboard.data);

  return <Fragment>
    {
      indicators.map(indicator => {
        return <Indicator key={indicator.id} indicator={indicator}/>
      })
    }
  </Fragment>
}