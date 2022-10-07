import React, { useEffect, useState } from 'react';
import { SelectWithList } from "../../../../components/Input/SelectWithList";
import './style.scss';


/**
 * Spatial operator input
 * @param {dict} attribute Attribute of data.
 * @param {Array} attributes Attributes of data.
 * @param {Function} setAttributes Set Attribute Functions.
 * @param {Array} fields Fields of data.
 */
export default function Aggregation(
  { attribute, attributes, setAttributes, fields }
) {
  const [spatialMethod, spatialValue] = attribute.value.split(/[()]+/)
  const [method, setMethod] = useState(spatialMethod)
  const [methodValue, setMethodValue] = useState(
    spatialValue ? spatialValue : ''
  )

  useEffect(() => {
      let value = ''
      if (method) {
        value = method
        if (method !== formDefinitions.aggregation_count && methodValue) {
          value += `(${methodValue})`
        }
      }
      attribute.value = value
      setAttributes([...attributes])
    }, [method, methodValue]
  )

  useEffect(() => {
      const [spatialMethod, spatialValue] = attribute.value.split(/[()]+/)
      setMethod(spatialMethod)
      setMethodValue(spatialValue)
    }, [attribute]
  )

  const onLoading = fields === undefined || fields === null
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
          placeholder={onLoading ? "Loading" : "Select.."}
          list={formDefinitions.aggregation}
          required={true}
          value={method}
          disabled={onLoading}
          onChange={evt => {
            setMethod(evt.value)
          }}/>
        <span className="form-helptext">{attribute.description}</span>
      </div>
      {
        method !== formDefinitions.aggregation_count ?
          <div className="BasicFormSection">
            <SelectWithList
              list={fields ? fields.filter(field => field.type === 'esriFieldTypeInteger').map(field => field.name) : []}
              placeholder={onLoading ? "Loading" : "Select.."}
              value={methodValue}
              disabled={onLoading}
              onChange={evt => {
                setMethodValue(evt.value)
              }}/>
            <span className="form-helptext">
              Select field to be aggregated.
            </span>
          </div>
          : ""
      }
    </div>
  </div>
}