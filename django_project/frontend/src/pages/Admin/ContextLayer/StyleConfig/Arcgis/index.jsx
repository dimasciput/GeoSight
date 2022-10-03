/* ==========================================================================
   ARCGIS STYLE
   ========================================================================== */

import React, { Fragment, useEffect } from 'react';
import parseArcRESTStyle from "../../../../../utils/esri/leaflet-esri-style";

import PointInput from './PointInput'
import PolygonInput from './PolygonInput'
import PolylineInput from './PolylineInput'
import ArcgisConfigFields from './Fields'
import LabelStyle from '../../../LabelStyle'

export function ArcgisConfigStyle({ data, update }) {
  const style = data.styles;

  const styleInput = () => {
    switch (style.classificationValueMethod) {
      case "classMaxValue":
      case "classExactValue":
        return style.classifications.map(classification => {
          return <div className='Classification'
                      key={classification.label}>
            <div>
              <b className='light'>{classification.label}</b>
              {
                style.geometryType === "esriGeometryPolygon" ?
                  <PolygonInput
                    style={classification.style} update={update}/> :
                  style.geometryType === "esriGeometryPolyline" ?
                    <PolylineInput
                      style={classification.style} update={update}/> :
                    style.geometryType === "esriGeometryPoint" ?
                      <PointInput
                        style={classification.style} update={update}/> : ""
              }

            </div>
          </div>
        })
      case "noClassification":
        switch (style.geometryType) {
          case "esriGeometryPolygon":
            return <PolygonInput style={style.style} update={update}/>
          case "esriGeometryPolyline":
            return <PolylineInput style={style.style} update={update}/>
          case "esriGeometryPoint":
            return <PointInput style={style.style} update={update}/>
        }
    }
  }
  return <div className='ArcgisConfig STYLES'>
    {styleInput()}
  </div>
}

/**
 * Map Config component.
 */
export default function ArcgisConfig({ originalData, setData, ArcgisData }) {
  const data = JSON.parse(JSON.stringify(originalData))

  useEffect(() => {
    if (data && ArcgisData?.data && ArcgisData?.data?.renderer) {
      const style = parseArcRESTStyle(ArcgisData.data)

      if (!data?.data_fields || data.data_fields.length === 0) {
        data.data_fields = ArcgisData?.data?.fields
      }

      if (!data?.styles) {
        data.styles = style
      }
      update()
    }
  }, [data, ArcgisData])

  const update = () => {
    setData({
      ...data,
      data_fields: data.data_fields,
      label_styles: data.label_styles,
    })
  }

  return <Fragment>
    {
      data.data_fields ?
        <div className='ArcgisConfig FIELDS'>
          <div className='ArcgisConfigLabel'>
            <LabelStyle
              label_styles={data.label_styles}
              update={(label_styles) => {
                data.label_styles = label_styles
                update()
              }}/>
          </div>
          <div className='ArcgisConfigFields'>
            <ArcgisConfigFields
              data_fields={data.data_fields}
              update={(fields) => {
                data.data_fields = fields
                update()
              }}/>
          </div>
        </div> :
        <div>Loading</div>
    }
    {
      data.styles ? <ArcgisConfigStyle data={data} update={update}/> :
        <div>Loading</div>
    }
  </Fragment>
}

