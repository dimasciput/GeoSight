/** --------------------------------------------------
 ** Render filter group.
 ** -------------------------------------------------- **/
import React, { Fragment } from "react";
import WhereRender from "./WhereRender"
import { TYPE, WHERE_OPERATOR } from "../../../utils/queryExtraction";

export default function WhereGroup(
  { where, upperWhere, updateWhere, fields }) {
  return <div className='WhereConfigurationQueryGroup'>
    {
      where.queries.length > 0 ?
        where.queries.map(
          (query, idx) => {
            return <Fragment key={idx}>
              {
                idx === 0 ? "" :
                  <Fragment>
                    <div
                      className={'WhereConfigurationOrAndWrapper'}
                      onClick={() => {
                        if (query.type === TYPE.GROUP) {
                          query.operator = query.operator === WHERE_OPERATOR.AND ? WHERE_OPERATOR.OR : WHERE_OPERATOR.AND;
                        } else {
                          query.whereOperator = query.whereOperator === WHERE_OPERATOR.AND ? WHERE_OPERATOR.OR : WHERE_OPERATOR.AND;
                        }
                        updateWhere()
                      }}>
                      <div className='WhereConfigurationOrAndInnerWrapper'>
                        <div
                          className={'WhereConfigurationOrAnd ' + (query.whereOperator ? query.whereOperator : query.operator)}>
                          <div className='AND'>{WHERE_OPERATOR.AND}</div>
                          <div className='OR'>{WHERE_OPERATOR.OR}</div>
                        </div>
                      </div>
                    </div>
                  </Fragment>
              }
              <WhereRender
                where={query} upperWhere={where}
                updateWhere={updateWhere} fields={fields}
              />
            </Fragment>
          }
        )
        :
        <div className='WhereConfigurationNote'>No filter</div>
    }
  </div>
}