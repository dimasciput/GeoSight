/* ==========================================================================
   Value input for filters
   ========================================================================== */
import React, { Fragment, useEffect, useState } from "react";
import { Input, } from "@mui/material";
import Slider from '@mui/material/Slider';
import {
  MultipleSelectWithSearch,
  SelectWithSearch,
} from "../../../Input/SelectWithSearch";
import { IS_NOT_NULL, IS_NULL } from "../../../../utils/queryExtraction"
import Moment from "moment";
import DatePicker from "react-datepicker";

/***
 * Filter Value Input
 * @param {str} field Field of filter.
 * @param {str} operator Operator of filter.
 * @param value Value og filter.
 * @param {dict} indicator Indicator that will be used for filter.
 * @param {bool} disabled Is filter disabled or not.
 * @param {function} onChange When the filter change.
 */
export default function FilterValueInput(
  { field, operator, value, indicator, disabled = false, onChange }
) {
  const [initValue, setInitValue] = useState(value);

  let min = null
  let max = null
  if (indicator?.data) {
    const data = indicator.data.filter(row => {
      return row !== undefined
    }).map(row => {
      return parseFloat(row)
    })
    min = Math.min(...data)
    max = Math.max(...data)
    if (isNaN(min)) {
      min = null
    }
    if (isNaN(max)) {
      max = null
    }
  }
  useEffect(() => {
    setInitValue(value)
    if (min && max && (initValue === undefined || initValue === '')) {
      setInitValue(0)
    }
  }, [value]);

  const needsValue = ![IS_NULL, IS_NOT_NULL].includes(operator)
  const isDate = field.split('.')[1] === 'date'

  return <Fragment>
    {
      needsValue ?
        operator === 'IN' ?
          (
            indicator ? <MultipleSelectWithSearch
              value={value} onChangeFn={onChange}
              options={indicator.data}
              className='FilterInput'
              disabled={disabled}/> : ''
          ) :
          (
            operator === '=' && indicator && isNaN(indicator.data[0]) ?
              !isDate ?
                <SelectWithSearch
                  value={value} onChangeFn={onChange}
                  options={indicator.data} className='FilterInput'
                  disabled={disabled}
                /> :
                <div
                  className="FilterDatePickerInput MuiInputBase-root MuiInput-root MuiInput-underline MuiInputBase-colorPrimary">
                  <DatePicker
                    dateFormat="yyyy-MM-dd"
                    selected={value ? new Date(value) : ""}
                    onChange={date => {
                      onChange(Moment(date).format('YYYY-MM-DD'))
                    }}
                  />
                </div>
              :
              (
                ['<', '<=', '>', '>='].includes(operator) && isDate ?
                  <div
                    className="FilterDatePickerInput MuiInputBase-root MuiInput-root MuiInput-underline MuiInputBase-colorPrimary">
                    <DatePicker
                      dateFormat="yyyy-MM-dd"
                      selected={value ? new Date(value) : ""}
                      onChange={date => {
                        onChange(Moment(date).format('YYYY-MM-DD'))
                      }}
                    />
                  </div> :
                  ['<', '<=', '>', '>='].includes(operator) && (min === null || max === null) ?
                    isDate ?
                      <div
                        className="FilterDatePickerInput MuiInputBase-root MuiInput-root MuiInput-underline MuiInputBase-colorPrimary">
                        <DatePicker
                          dateFormat="yyyy-MM-dd"
                          selected={value ? new Date(value) : ""}
                          onChange={date => {
                            onChange(Moment(date).format('YYYY-MM-DD'))
                          }}
                        />
                      </div> :
                      <Input
                        className='FilterInput'
                        type="text"
                        placeholder="Value"
                        value={value}
                        onChange={(event) => {
                          onChange(event.target.value);
                        }}
                        disabled={disabled}
                      /> : (
                      <div className='MuiInputSliderWithInput'>
                        <div className='MuiInputSlider'>
                          <Slider
                            value={initValue === '' ? 0 : initValue}
                            step={1}
                            min={min}
                            max={max}
                            onChange={(event) => {
                              setInitValue(event.target.value);
                            }}
                            track={['>', '>='].includes(operator) ? "inverted" : ""}
                            onChangeCommitted={(e) => onChange(initValue)}
                            disabled={disabled}
                          />
                        </div>
                        <Input
                          value={initValue}
                          size="small"
                          onChange={(event) => {
                            onChange(event.target.value);
                          }}
                          inputProps={{
                            min: min,
                            max: max,
                            type: 'number',
                          }}
                          disabled={disabled}
                        />
                      </div>
                    )
              )
          )
        : ""
    }
  </Fragment>
}