/** --------------------------------------------------
 ** Render filter group.
 ** -------------------------------------------------- **/
import React from "react";
import { SelectPlaceholder } from "../../Input";
import {
  IS_NOT_NULL,
  IS_NULL,
  OPERATOR
} from "../../../utils/queryExtraction";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { Input } from "@mui/material";

export default function WhereInput(
  { where, upperWhere, updateWhere, fields }) {
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
      initValue={where.field ? where.field : ""}
      onChangeFn={(value) => {
        where.field = value
        updateWhere()
      }}/>
    <SelectPlaceholder
      placeholder='Pick an operation'
      className={'WhereConfigurationOperator'}
      list={
        Object.keys(OPERATOR).map((key, idx) => {
          return { id: key, name: OPERATOR[key] }
        })
      }
      initValue={where.operator ? where.operator : ""}
      onChangeFn={(value) => {
        where.operator = value
        updateWhere()
      }}/>
    {
      [IS_NULL, IS_NOT_NULL].includes(
        where.operator
      ) ? "" :
        <Input
          type="text"
          className={'WhereConfigurationOperatorValue'}
          value={where.value ? where.value : ""}
          onChange={(evt) => {
            where.value = evt.target.value
            updateWhere()
          }}
        />
    }
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