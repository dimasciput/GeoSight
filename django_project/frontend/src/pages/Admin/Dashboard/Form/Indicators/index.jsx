import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../../store/dashboard";
import ListForm from '../ListForm'

import './style.scss';

/**
 * Basemaps dashboard
 */
export default function IndicatorsForm() {
  const dispatch = useDispatch();
  const { indicators } = useSelector(state => state.dashboard.data);
  const indicatorList = indicators.sort((a, b) => {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  })
  const indicatorByCategories = {}
  indicatorList.map(indicator => {
    if (!indicatorByCategories[indicator.group]) {
      indicatorByCategories[indicator.group] = []
    }
    indicatorByCategories[indicator.group].push(indicator)
  })

  let orderedIndicators = []
  Object.keys(indicatorByCategories).sort().map(key => {
    orderedIndicators = orderedIndicators.concat(indicatorByCategories[key])
  })

  return <ListForm
    pageName={'Indicators'}
    data={orderedIndicators}
    listUrl={urls.api.indicatorListAPI}
    addLayerAction={(layer) => {
      dispatch(Actions.Indicators.add(layer))
    }}
    removeLayerAction={(layer) => {
      dispatch(Actions.Indicators.remove(layer))
    }}
    changeLayerAction={(layer) => {
      dispatch(Actions.Indicators.update(layer))
    }}
    rearrangeLayersAction={(payload) => {
      dispatch(Actions.Indicators.rearrange(payload))
    }}
    groupLabel={'Category'}
  />
}