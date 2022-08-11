import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import Checkbox from "@mui/material/Checkbox";
import FilterSection
  from "../../../../../components/Dashboard/LeftPanel/Filters/Control";
import { Actions } from "../../../../../store/dashboard/index";

import './style.scss';

/**
 * Widget dashboard
 */
export default function FiltersForm() {
  const dispatch = useDispatch();
  const {
    filtersAllowModify
  } = useSelector(state => state.dashboard.data);

  return <div className={'Filters'}>
    <Checkbox checked={filtersAllowModify} onChange={(evt) => {
      dispatch(Actions.Dashboard.updateFiltersAllowModify())
    }}/> Allow users to modify filters in dashboard
    <FilterSection/>
  </div>
}