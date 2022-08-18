/* ==========================================================================
   ARCGIS STYLE
   ========================================================================== */

import React from 'react';

/**
 * One point input
 */
export default function PolylineInput({ style, update }) {

  return <div className='ContextLayerConfigInput BasicForm'>
    <div className="BasicFormSection">
      <div>
        <label className="form-label">Border Color</label>
      </div>
      <div>
        <input
          type="color" spellCheck="false"
          defaultValue={style.style.color}
          onChange={evt => {
            style.style.color = evt.target.value
            update()
          }}
        />
      </div>
    </div>
    <div className="BasicFormSection">
      <div>
        <label className="form-label">Border Weight</label>
      </div>
      <div>
        <input
          type="number" spellCheck="false"
          defaultValue={style.style.weight}
          step={0.1}
          onChange={evt => {
            style.style.weight = evt.target.value
            update()
          }}/>
      </div>
    </div>
  </div>
}