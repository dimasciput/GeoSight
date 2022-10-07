import React, { useEffect, useState } from 'react';
import { SelectWithList } from "../../../../components/Input/SelectWithList";
import './style.scss';

/**
 * Spatial operator input
 * @param {dict} attribute Attribute of data.
 * @param {Array} attributes Attributes of data.
 * @param {Function} setAttributes Set Attribute Functions.
 */
export default function SpatialOperator(
  { attribute, attributes, setAttributes }
) {
  const [spatialMethod, spatialValue] = attribute.value.split('=')
  const [method, setMethod] = useState(spatialMethod)
  const [methodValue, setMethodValue] = useState(
    spatialValue ? spatialValue : 0
  )


  // Indicator list
  useEffect(() => {
      const values = []
      if (method !== null && method !== undefined) {
        values.push(method)
      }
      if (method === formDefinitions.spatial_method_distance_value) {
        values.push(methodValue)
      }
      attribute.value = values.join('=')
      setAttributes([...attributes])
    }, [method, methodValue]
  )

  return <div className="BasicFormSection">
    <label
      className={"form-label " + (attribute.required ? 'required' : '')}>
      {attribute.title}
    </label>
    <input
      name={'attribute_' + attribute.name}
      required={attribute.required}
      type="text"
      hidden={true}
      value={attribute.value}
      onChange={(evt) => {
        attribute.value = evt.target.value
        setAttributes([...attributes])
      }}
    />
    <div className='InputInLine'>
      <div className="BasicFormSection">
        <SelectWithList
          list={formDefinitions.spatial_method}
          required={true}
          value={method}
          onChange={evt => {
            setMethod(evt.value)
          }}/>
        <span className="form-helptext">{attribute.description}</span>
      </div>
      {
        method === formDefinitions.spatial_method_distance_value ?
          <div className="BasicFormSection">
            <input
              type="number"
              placeholder={"Distance in meters."}
              value={methodValue}
              onChange={(evt) => {
                setMethodValue(evt.target.value)
              }}
            />
            <span className="form-helptext">Within in meters.</span>
          </div>
          : ""
      }
    </div>
  </div>
}