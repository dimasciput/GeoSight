import React, { useRef } from 'react';
import Select from "react-select";

import './style.scss';

const fontFamilyTypes = [
  { value: '"Arial", sans-serif', label: 'Arial' },
  { value: '"Courier New", monospace', label: 'Courier New' },
  { value: '"Rubik", sans-serif', label: 'Rubik' },
  { value: '"Tahoma", sans-serif', label: 'Tahoma' },
  { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: '"Verdana", sans-serif', label: 'Verdana' },
]

/** Label Style Config */
export default function LabelStyle({ label_styles, update }) {
  label_styles = Object.assign({}, {
    minZoom: 0,
    maxZoom: 24,
    fontFamily: '"Rubik", sans-serif',
    fontSize: 14,
    fontColor: '#000000',
    fontWeight: 300,
    strokeColor: '#FFFFFF',
    strokeWeight: 0,
    haloColor: '#FFFFFF',
    haloWeight: 0,
  }, label_styles)

  const prevState = useRef();

  /** Update data **/
  const updateData = (newStyles) => {
    if (prevState.styles !== JSON.stringify(newStyles)) {
      update(newStyles)
      prevState.styles = JSON.stringify(newStyles)
    }
  }

  const style = {
    fontFamily: label_styles.fontFamily,
    fontSize: label_styles.fontSize,
    fontWeight: label_styles.fontWeight,
    WebkitTextFillColor: label_styles.fontColor,
    WebkitTextStrokeColor: label_styles.strokeColor,
    WebkitTextStrokeWidth: label_styles.strokeWeight,
  }
  if (label_styles.haloWeight) {
    style.textShadow = `0px 0px ${label_styles.haloWeight}px ${label_styles.haloColor}, 0px 0px ${label_styles.haloWeight}px ${label_styles.haloColor}`
  }

  const fontFamilyValue = fontFamilyTypes.find(
    family => family.value === label_styles.fontFamily
  )

  return <div className='LabelStyle'>
    <div className='LabelStyleTitle'><b className='light'>Labels</b></div>
    <table>
      <tbody>
      <tr className="BasicFormSection">
        <td></td>
        <td>
          <label className="form-label">
            Visible Zoom
          </label>
        </td>
        <td>
          <div className='FlexConfig'>
            <input
              type="number" spellCheck="false"
              value={label_styles.minZoom}
              min={0}
              max={24}
              onChange={evt => {
                label_styles.minZoom = parseInt(evt.target.value)
                if (label_styles.minZoom > label_styles.maxZoom) {
                  label_styles.maxZoom = label_styles.minZoom
                }
                updateData(label_styles)
              }}/>
            <span>-</span>
            <input
              type="number" spellCheck="false"
              value={label_styles.maxZoom}
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
        </td>
      </tr>
      <tr className="BasicFormSection">
        <td rowSpan="8" className='LabelStylePreview' valign={"middle"}
            style={style}>
          Preview
        </td>
        <td>
          <label className="form-label">Font Family</label>
        </td>
        <td>
          <Select
            options={fontFamilyTypes} defaultValue={fontFamilyValue}
            onChange={(evt) => {
              label_styles.fontFamily = evt.value
              updateData(label_styles)
            }}/>
        </td>
      </tr>
      <tr className="BasicFormSection">
        <td>
          <label className="form-label">Font Size</label>
        </td>
        <td>
          <div className='FlexConfig'>
            <input
              type="number" spellCheck="false"
              value={label_styles.fontSize}
              min={6}
              max={40}
              onChange={evt => {
                label_styles.fontSize = parseInt(evt.target.value)
                updateData(label_styles)
              }}/>
            <span>px</span>
          </div>
        </td>
      </tr>
      <tr className="BasicFormSection">
        <td>
          <label className="form-label">Font Weight</label>
        </td>
        <td>
          <div className='FlexConfig'>
            <input
              type="number" spellCheck="false"
              value={label_styles.fontWeight}
              min={0}
              max={1000}
              step={100}
              onChange={evt => {
                label_styles.fontWeight = parseInt(evt.target.value)
                updateData(label_styles)
              }}/>
            <span>px</span>
          </div>
        </td>
      </tr>
      <tr className="BasicFormSection">
        <td>
          <label className="form-label">Font Color</label>
        </td>
        <td>
          <div className='FlexConfig ColorConfig'>
            <input type="text"
                   value={label_styles.fontColor}
                   onChange={evt => {
                     label_styles.fontColor = evt.target.value
                     updateData(label_styles)
                   }}
                   spellCheck="false"/>
            <div className='ColorConfigPreview'>
              <input type="color" spellCheck="false"
                     value={label_styles.fontColor}
                     onChange={evt => {
                       label_styles.fontColor = evt.target.value
                       updateData(label_styles)
                     }}
              />
            </div>
          </div>
        </td>
      </tr>
      <tr className="BasicFormSection">
        <td>
          <label className="form-label">Stroke Color</label>
        </td>
        <td>
          <div className='FlexConfig ColorConfig'>
            <input type="text"
                   value={label_styles.strokeColor}
                   onChange={evt => {
                     label_styles.strokeColor = evt.target.value
                     updateData(label_styles)
                   }}
                   spellCheck="false"/>
            <div className='ColorConfigPreview'>
              <input type="color" spellCheck="false"
                     value={label_styles.strokeColor}
                     onChange={evt => {
                       label_styles.strokeColor = evt.target.value
                       updateData(label_styles)
                     }}
              />
            </div>
          </div>
        </td>
      </tr>
      <tr className="BasicFormSection">
        <td>
          <label className="form-label">Stroke Weight</label>
        </td>
        <td>
          <div className='FlexConfig'>
            <input
              type="number" spellCheck="false"
              value={label_styles.strokeWeight}
              step={0.1}
              min={0}
              max={10}
              onChange={evt => {
                label_styles.strokeWeight = parseFloat(evt.target.value)
                updateData(label_styles)
              }}/>
            <span>px</span>
          </div>
        </td>
      </tr>
      <tr className="BasicFormSection">
        <td>
          <label className="form-label">Halo Color</label>
        </td>
        <td>
          <div className='FlexConfig ColorConfig'>
            <input type="text"
                   value={label_styles.haloColor}
                   onChange={evt => {
                     label_styles.haloColor = evt.target.value
                     updateData(label_styles)
                   }}
                   spellCheck="false"/>
            <div className='ColorConfigPreview'>
              <input type="color" spellCheck="false"
                     value={label_styles.haloColor}
                     onChange={evt => {
                       label_styles.haloColor = evt.target.value
                       updateData(label_styles)
                     }}
              />
            </div>
          </div>
        </td>
      </tr>
      <tr className="BasicFormSection">
        <td>
          <label className="form-label">Halo Weight</label>
        </td>
        <td>
          <div className='FlexConfig'>
            <input
              type="number" spellCheck="false"
              value={label_styles.haloWeight}
              step={1}
              min={0}
              max={20}
              onChange={evt => {
                label_styles.haloWeight = parseFloat(evt.target.value)
                updateData(label_styles)
              }}/>
            <span>px</span>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
}