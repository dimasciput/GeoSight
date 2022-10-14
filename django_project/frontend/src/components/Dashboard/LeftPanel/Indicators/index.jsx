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
  const selectedGlobalTimeStr = JSON.stringify(selectedGlobalTime);
  const [responseAndTime, setResponseAndTime] = useState(null);
  const prevState = useRef();

  /**
   * Fetch indicator data by the current global selected time
   */
  useEffect(() => {
    if (selectedGlobalTime.max && selectedGlobalTimeStr !== prevState.selectedGlobalTimeStr) {
      prevState.selectedGlobalTimeStr = selectedGlobalTimeStr
      setResponseAndTime(null)

      const { id, url } = indicator
      const params = {
        'time__lte': selectedGlobalTime.max
      }
      if (selectedGlobalTime.min) {
        params['time__gte'] = selectedGlobalTime.min
      }
      fetchingData(
        url, params, {}, function (response, error) {
          setResponseAndTime({
            'timeStr': selectedGlobalTimeStr,
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
      const { timeStr, response, error } = responseAndTime
      const { id, reporting_levels } = indicator
      if (timeStr === selectedGlobalTimeStr) {
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