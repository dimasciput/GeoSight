/* ==========================================================================
   Where Query Generator
   ========================================================================== */

import React from 'react';
import sqlParser from "js-sql-parser";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {
  INIT_DATA,
  returnWhere,
  returnWhereToDict
} from "../../../utils/queryExtraction";
import WhereRender from "./WhereRender"
import './style.scss';
import { Input } from "@mui/material";

export default function WhereQueryGenerator(
  { whereQuery, setWhereQuery, fields }
) {
  let whereDict = INIT_DATA.GROUP()
  let error = null
  try {
    const parsed = sqlParser.parse(
      `SELECT *
       FROM test
       WHERE ${whereQuery}`)
    const queries = returnWhereToDict(parsed.value.where)
    whereDict.queries = Array.isArray(queries) ? queries : [queries]
  } catch (err) {
    error = err.toString()
  }

  const onLoading = fields === undefined || fields === null
  if (onLoading) {
    return <div>Loading</div>
  }
  const updateWhere = () => {
    let newQuery = returnWhere(whereDict, true, null, false);
    newQuery = newQuery.substring(1)
    newQuery = newQuery.slice(0, -1);
    setWhereQuery(newQuery)
  }
  return <div className='WhereConfiguration'>
    <div className='WhereConfigurationResult'>
      <AddCircleIcon className='AddButton' onClick={() => {
        const newWhere = INIT_DATA.WHERE()
        newWhere.field = fields[0].name
        whereDict.queries.push(newWhere)
        updateWhere()
      }}/>
      <div className='WhereConfigurationQuery'>
        <Input
          className='WhereConfigurationResultIndicator'
          placeholder={'Put where SQL'}
          value={whereQuery}
          onChange={(evt) => {
            setWhereQuery(evt.target.value)
          }}
        />
      </div>
    </div>
    {
      whereQuery ?
        error ? <div className='error'>{error}</div> :
          <div style={{ marginBottom: '1rem' }}>
            <WhereRender
              where={whereDict}
              upperWhere={null}
              updateWhere={updateWhere}
              fields={fields}/>
          </div>
        : ""
    }
  </div>
}
