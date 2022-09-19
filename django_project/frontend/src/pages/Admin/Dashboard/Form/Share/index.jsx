import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { PermissionForm } from "../../../Permission";

import { Actions } from "../../../../../store/dashboard";

/**
 * Permission dashboard
 */
export default function ShareForm() {
  const dispatch = useDispatch();
  const { permission } = useSelector(state => state.dashboard.data);

  const setPermission = (permission) => {
    dispatch(Actions.Dashboard.updatePermission(permission));
  }

  return <div className='Share'>
    <PermissionForm data={permission} setData={setPermission}/>
  </div>
}