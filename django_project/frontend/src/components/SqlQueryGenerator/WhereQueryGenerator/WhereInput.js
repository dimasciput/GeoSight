/** --------------------------------------------------
 ** Render filter group.
 ** -------------------------------------------------- **/
import React, { Fragment } from "react";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { SelectPlaceholder } from "../../Input";
import {
  IS_IN,
  IS_NOT_NULL,
  IS_NULL,
  OPERATOR
} from "../../../utils/queryExtraction";
import { Input } from "@mui/material";
import { capitalize, dictDeepCopy } from "../../../utils/main";

// VARIABLES
export const INTERVAL = ['minutes', 'hours', 'days', 'months', 'years']
const OPERATOR_WITH_INTERVAL = 'last x (time)'
const INTERVAL_IDENTIFIER = '::interval'

export default function WhereInput(
  { where, upperWhere, updateWhere, fields }) {
  // UPDATE THE OPERATOR
  // If has :interval, it is last x (time)
  const value = where.value
  const field = where.field
  const UPDATED_OPERATOR = dictDeepCopy(OPERATOR)
  UPDATED_OPERATOR[OPERATOR_WITH_INTERVAL] = OPERATOR_WITH_INTERVAL
  let operator = value?.includes(INTERVAL_IDENTIFIER) ? OPERATOR_WITH_INTERVAL : where.operator;

  // Check the input type
  const currentField = fields.find(fieldDef => fieldDef.name === field)
  let fieldType = 'text'
  switch (currentField?.type) {
    case "esriFieldTypeDate":
      fieldType = 'date'
      break
    case 'esriFieldTypeOID':
    case 'esriFieldTypeInteger':
    case 'esriFieldTypeDouble':
      fieldType = 'number'
  }

  // Check the fields
  if (operator === OPERATOR_WITH_INTERVAL) {
    fields = dictDeepCopy(fields)
    fields = fields.filter(fieldDef => fieldDef.type === "esriFieldTypeDate")
  }

  const renderInput = () => {
    if ([IS_NULL, IS_NOT_NULL].includes(operator)) {
      return ""
    } else if (operator === OPERATOR_WITH_INTERVAL) {
      const [timeValue, timeType] = value.replace(INTERVAL_IDENTIFIER, '').split(' ')
      return <Fragment>
        <Input
          type="number"
          className={'WhereConfigurationOperatorValue'}
          value={timeValue ? timeValue : ""}
          onChange={(evt) => {
            where.value = `${evt.target.value ? evt.target.value : 0} ${timeType}${INTERVAL_IDENTIFIER}`
            updateWhere()
          }}
        />
        <SelectPlaceholder
          placeholder='Pick a time'
          className={'TimeConfigurationOperator'}
          list={
            INTERVAL.map((key, idx) => {
              return { id: key, name: capitalize(key) }
            })
          }
          initValue={timeType ? timeType : ""}
          onChangeFn={(value) => {
            where.value = `${timeValue} ${value}${INTERVAL_IDENTIFIER}`
            updateWhere()
          }}/>
      </Fragment>
    } else {
      return <Input
        type={fieldType}
        className={'WhereConfigurationOperatorValue'}
        value={value ? value : ""}
        onChange={(evt) => {
          if (operator === IS_IN) {
            where.value = evt.target.value.split(',')
          } else {
            where.value = evt.target.value
          }
          updateWhere()
        }}
      />
    }
  }
  return <div className='WhereConfigurationQuery'>
    <SelectPlaceholder
      placeholder='Pick the field'
      className={'WhereConfigurationField'}
      list={
        fields.map(
          field => field.name ? {
            id: field.name,
            name: field.name,
          } : {
            id: field,
            name: field
          }
        )
      }
      initValue={field ? field : ""}
      onChangeFn={(value) => {
        where.field = value
        updateWhere()
      }}/>
    <SelectPlaceholder
      placeholder='Pick an operation'
      className={'WhereConfigurationOperator'}
      list={
        Object.keys(UPDATED_OPERATOR).map((key, idx) => {
          return { id: key, name: UPDATED_OPERATOR[key] }
        })
      }
      initValue={operator ? operator : ""}
      onChangeFn={(value) => {
        if (value === OPERATOR_WITH_INTERVAL) {
          where.operator = '>'
          where.value = "now() - interval '1 days'"
        } else if (value === IS_IN) {
          where.operator = value
          where.value = [where.value]
        } else {
          where.operator = value
          if (Array.isArray(where.value)) {
            where.value = where.value.join(',')
          }
          where.value = where?.value?.replace(INTERVAL_IDENTIFIER, '')
        }
        updateWhere()
      }}/>
    {renderInput()}
    <RemoveCircleIcon className='RemoveIcon' onClick={
      () => {
        const index = upperWhere.queries.indexOf(where);
        if (index > -1) {
          upperWhere.queries.splice(index, 1)
        }
        updateWhere()
      }
    }/>
  </div>
}