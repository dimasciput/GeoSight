/* ==========================================================================
   CompareLayer
   ========================================================================== */

import React, { Fragment } from 'react';
import { useDispatch, useSelector } from "react-redux";
import CompareIcon from '@mui/icons-material/Compare';
import { PluginChild } from "../../Map/Plugin";
import { Actions } from '../../../../store/dashboard/index'

import './style.scss';

/**
 * CompareLayer component.
 */
export default function CompareLayer() {
  const dispatch = useDispatch()
  const { compareMode } = useSelector(state => state.mapMode)
  const { name: outlineIndicatorName } = useSelector(state => state.selectedIndicatorLayer)
  const { name: innerIndicatorName } = useSelector(state => state.selectedIndicatorSecondLayer)

  return (
    <Fragment>
      <div
        className={'CompareLayerComponent ' + (compareMode ? "Active" : "Inactive")}>
        <PluginChild title={
          (compareMode ? 'Turn off' : 'Turn on') + ' compare Layers'
        }>
          <CompareIcon onClick={() => {
            dispatch(Actions.MapMode.changeCompareMode())
          }}/>
        </PluginChild>
        {
          compareMode ?
            <div className={'CompareLayerComponentPopup'}>
              <div className={'Title'}>Compare mode</div>
              <div>Outline indicator : {outlineIndicatorName}</div>
              <div>
                Inner indicator : {innerIndicatorName ? innerIndicatorName :
                <i>Select second indicator.</i>}
              </div>
            </div>
            : ""
        }
      </div>
    </Fragment>
  )
}