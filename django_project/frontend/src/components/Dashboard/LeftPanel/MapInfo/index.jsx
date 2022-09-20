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
  const selectedIndicatorLayer = useSelector(state => state.selectedIndicatorLayer)

  return <Fragment>
    {
      Object.keys(selectedIndicatorLayer).length > 0 ?
        <div className="MapInfo">
          <div>
            {selectedIndicatorLayer.group ? selectedIndicatorLayer.group + '/' : ""}
            {selectedIndicatorLayer.name}
          </div>
        </div> : ""
    }
  </Fragment>
}
