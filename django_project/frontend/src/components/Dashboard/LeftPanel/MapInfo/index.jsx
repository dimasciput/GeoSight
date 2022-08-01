/* ==========================================================================
   MapInfo
   ========================================================================== */

import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';

import './style.scss';

/**
 * MapInfo.
 */
export default function MapInfo() {
  const selectedIndicator = useSelector(state => state.selectedIndicator)

  return <Fragment>
    {
      Object.keys(selectedIndicator).length > 0 ?
        <div className="MapInfo">
          <div>{selectedIndicator.category}/{selectedIndicator.name}</div>
          <div>
            {
              selectedIndicator.reporting_level ?
                <Fragment>Admin {selectedIndicator.reporting_level}</Fragment> : ""
            }
          </div>
        </div> : ""
    }
  </Fragment>
}
