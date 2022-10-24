/* ==========================================================================
   WIDGET
   ========================================================================== */

import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import InfoIcon from "@mui/icons-material/Info";

import SummaryWidget from "./SummaryWidget"
import SummaryGroupWidget from "./SummaryGroupWidget"
import { cleanLayerData } from "../../utils/indicators"
import { returnWhere } from "../../utils/queryExtraction";
import { fetchingData } from "../../Requests";

import './style.scss';

export const DEFINITION = {
  "WidgetType": {
    "SUMMARY_WIDGET": "SummaryWidget",
    "SUMMARY_GROUP_WIDGET": "SummaryGroupWidget"
  },
  "WidgetOperation": {
    "SUM": "Sum"
  }
}

/**
 * Base widget that handler widget rendering.
 * @param {int} idx Index of widget
 * @param {string} data Data of widget
 */
export function Widget({ idx, data }) {
  const {
    name, description, type,
    layer_id, layer_used, property,
    date_filter_type, date_filter_value
  } = data
  const { indicators } = useSelector(state => state.dashboard.data);
  const indicatorLayerData = useSelector(state => state.indicatorsData[layer_id]);
  const filteredGeometries = useSelector(state => state.filteredGeometries);
  const filtersData = useSelector(state => state.filtersData);
  const [showInfo, setShowInfo] = useState(false);
  const [layerData, setLayerData] = useState({});

  // Fetch the data if it is using global filter
  useEffect(() => {
    if (date_filter_type === 'Global datetime filter') {
      setLayerData(indicatorLayerData)
    }
  }, [indicatorLayerData])


  const layer = indicators.find((layer) => {
    return layer.id === layer_id;
  })
  // Fetch the data if it is using no filter or custom
  useEffect(() => {
    setLayerData({
      fetching: true,
      fetched: false,
      data: {},
      error: null
    })
    let params = {}
    if (date_filter_type === 'Custom filter') {
      if (date_filter_value) {
        let [minDateFilter, maxDateFilter] = date_filter_value.split(';')
        params = {
          'time__gte': minDateFilter,
        }
        if (maxDateFilter) {
          params['time__lte'] = maxDateFilter
        }
      }
    }

    fetchingData(
      layer.url, params, {}, function (response, error) {
        let newState = {
          fetching: false,
          fetched: true,
          receivedAt: Date.now(),
          data: null,
          error: null
        };

        if (error) {
          newState.error = error;
        } else {
          newState.data = response;
        }
        setLayerData(newState);
      }
    )
  }, [data])

  const where = returnWhere(filtersData ? filtersData : [])
  let indicatorData = null
  if (layer) {
    indicatorData = Object.assign({}, layerData)
    if (indicatorData.fetched && indicatorData.data) {
      indicatorData.data = indicatorData.data.filter(indicator => {
        return !filteredGeometries || !where || filteredGeometries.includes(indicator.geometry_code)
      })
    }
  }


  const showInfoHandler = () => {
    setShowInfo(!showInfo)
  };

  /**
   * Render widget by type
   * **/
  function renderWidgetByType() {
    // get layers by layer used
    let layers = null
    switch (layer_used) {
      case definition.WidgetLayerUsed.INDICATOR:
        layers = indicators
        break;
    }

    // render widget by the type
    switch (type) {
      case DEFINITION.WidgetType.SUMMARY_WIDGET:
        return <SummaryWidget
          idx={idx}
          data={
            cleanLayerData(
              layer_id, layer_used, indicatorData, property
            )
          }
          widgetData={data}
        />;
      case DEFINITION.WidgetType.SUMMARY_GROUP_WIDGET:
        return <SummaryGroupWidget
          idx={idx}
          data={
            cleanLayerData(
              layer_id, layer_used, indicatorData, property
            )
          }
          widgetData={data}
        />;
      default:
        throw new Error("Widget type does not recognized.");
    }
  }

  // Render widget based on the type and raise error
  const renderWidget = () => {
    try {
      return renderWidgetByType()
    } catch (error) {
      return <div className='widget__error'>{'' + error}</div>
    }
  }

  return (
    <div className='widget'>
      <InfoIcon className="info__button" onClick={() => {
        showInfoHandler()
      }}/>
      <div className='widget__fill'>
        {renderWidget()}
      </div>
      {
        showInfo ?
          <div className='widget__info'>
            <div className='widget__info__title'><b
              className='light'>{name}</b></div>
            <div className='widget__info__content'>{description}</div>
          </div> : ''
      }
    </div>
  )
}

/**
 * Widget List rendering
 */
export default function WidgetList({ widgets }) {
  return <Fragment>
    {
      widgets ?
        widgets.map(
          (widget, idx) => {
            return widget.visible_by_default ?
              <Widget key={idx} data={widget} idx={idx}/> : ''
          }
        ) : <div className='dashboard__right_side__loading'>Loading</div>
    }
  </Fragment>
}