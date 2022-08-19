import React, { useRef } from 'react';


/** Arcgis Config Fields */
export default function ArcgisConfigLabels({ label_styles, update }) {
  label_styles = label_styles ? label_styles : {}
  const prevState = useRef();

  /** Update data **/
  const updateData = (newStyles) => {
    if (prevState.styles !== JSON.stringify(newStyles)) {
      update(newStyles)
      prevState.styles = JSON.stringify(newStyles)
    }
  }

  return <div className='ArcgisConfigLabel'>
    <div><b className='light'>Labels</b></div>
    <div>
      <div className="BasicFormSection">
        <div>
          <label className="form-label">
            Visible Zoom
          </label>
        </div>
        <div className='ContextLayerConfig-IconSize'>
          <input
            type="number" spellCheck="false"
            value={label_styles.minZoom ? label_styles.minZoom : 0}
            min={0}
            max={24}
            onChange={evt => {
              label_styles.minZoom = parseInt(evt.target.value)
              if (label_styles.minZoom > label_styles.maxZoom) {
                label_styles.maxZoom = label_styles.minZoom
              }
              updateData(label_styles)
            }}/>
          <span> - </span>
          <input
            type="number" spellCheck="false"
            value={label_styles.maxZoom ? label_styles.maxZoom : 24}
            min={0}
            max={24}
            onChange={evt => {
              label_styles.maxZoom = parseInt(evt.target.value)
              if (label_styles.minZoom > label_styles.maxZoom) {
                label_styles.minZoom = label_styles.maxZoom
              }
              updateData(label_styles)
            }}/>
        </div>
      </div>
      <div className="BasicFormSection">
        <div>
          <label className="form-label">Font Size</label>
        </div>
        <div className='ContextLayerConfig-IconSize'>
          <input
            type="number" spellCheck="false"
            value={label_styles.fontSize ? label_styles.fontSize : 14}
            min={6}
            max={40}
            onChange={evt => {
              label_styles.fontSize = parseInt(evt.target.value)
              updateData(label_styles)
            }}/>
          <span> px </span>
        </div>
      </div>
    </div>
  </div>
}