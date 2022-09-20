/* ==========================================================================
   REFERENCE LAYER
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";

import { Actions } from '../../../../store/dashboard'
import ReferenceLayer from '../../Map/ReferenceLayer'

import './style.scss';

/**
 * Reference layer.
 * Contains level selector.
 */
export default function ReferenceLayerSection() {
  const dispatch = useDispatch();
  const { referenceLayer } = useSelector(state => state.dashboard.data)
  const referenceLayerData = useSelector(state => state.referenceLayerData)
  const selectedIndicatorLayer = useSelector(state => state.selectedIndicatorLayer)
  const [adminLevel, setAdminLevel] = useState(null)

  const levels = referenceLayerData[referenceLayer.identifier]?.data?.levels

  // Onload for default checked and the layer
  useEffect(() => {
    if (levels && !adminLevel) {
      onChange(selectedIndicatorLayer.reporting_level)
    }
  }, [referenceLayerData, selectedIndicatorLayer])

  /** Change Admin Level **/
  const onChange = (level) => {
    if (levels[level]) {
      setAdminLevel(levels[level])
      dispatch(Actions.SelectedAdminLevel.change(levels[level]))
    }
  }

  // Current level
  let level = adminLevel;
  if (!level && levels) {
    level = levels[0]
  }

  return <div className='ReferenceLayerLevelSelector'>
    {
      levels && level ? (
        <div>
          <div className='ReferenceLayerLevelOptions'>
            {
              Object.keys(levels).map(level => {
                return <div
                  key={level}
                  className='ReferenceLayerLevelOption'
                  onClick={() => {
                    onChange(level)
                  }}
                >
                  {levels[level].level_name}
                </div>
              })
            }
          </div>
          <div className='ReferenceLayerLevelSelected'>
            {level.level_name}
          </div>
        </div>
      ) : ""
    }
    <ReferenceLayer/>
  </div>
}