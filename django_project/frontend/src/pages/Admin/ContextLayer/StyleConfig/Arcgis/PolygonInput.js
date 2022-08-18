/* ==========================================================================
   ARCGIS STYLE
   ========================================================================== */

import React from 'react';

/**
 * One point input
 */
export default function PolygonInput({ style, update }) {

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
    <div className="BasicFormSection">
      <div>
        <label className="form-label">Fill Color</label>
      </div>
      <div>
        <input
          type="color" spellCheck="false"
          value={style.style.fillColor}
          onChange={evt => {
            style.style.fillColor = evt.target.value
            update()
          }}/>
      </div>
    </div>
    <div className="BasicFormSection">
      <div>
        <label className="form-label">Fill Color Opacity</label>
      </div>
      <div>
        <input
          type="number" spellCheck="false"
          value={style.style.fillOpacity}
          step={0.1}
          max={1}
          onChange={evt => {
            style.style.fillOpacity = evt.target.value
            update()
          }}/>
      </div>
    </div>
  </div>
}