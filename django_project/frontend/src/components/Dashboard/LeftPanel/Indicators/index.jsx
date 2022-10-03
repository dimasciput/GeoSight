/* ==========================================================================
   INDICATOR
   ========================================================================== */

import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../store/dashboard";


/**
 * Indicator data.
 * @param {dict} indicator Indicator data.
 */
export function Indicator({ indicator }) {
  const dispatch = useDispatch();
  const indicatorData = useSelector(
    state => state.indicatorsData[indicator.id]
  );

  /**
   * Fetch indicator data
   */
  useEffect(() => {
    if (!indicatorData?.data) {
      dispatch(
        Actions.IndicatorsData.fetch(
          dispatch, indicator.id, indicator.url, indicator.reporting_levels
        )
      );
    }
  }, []);

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