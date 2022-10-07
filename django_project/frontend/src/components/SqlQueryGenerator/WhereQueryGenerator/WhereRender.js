/** --------------------------------------------------
 ** Render filter group.
 ** -------------------------------------------------- **/
import React from "react";
import { TYPE } from "../../../utils/queryExtraction";
import WhereGroup from "./WhereGroup"
import WhereInput from "./WhereInput"

export default function WhereRender(
  { where, upperWhere, updateWhere, fields }) {


  switch (where.type) {
    case TYPE.GROUP:
      return <WhereGroup
        where={where} upperWhere={upperWhere} updateWhere={updateWhere}
        fields={fields}/>
    case TYPE.EXPRESSION:
      return <WhereInput
        where={where} upperWhere={upperWhere} updateWhere={updateWhere}
        fields={fields}/>
    default:
      return ''
  }
}