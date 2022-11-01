/* ==========================================================================
   REFERENCE LAYER
   ========================================================================== */

import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import L from 'leaflet';
import vectorTileLayer from 'leaflet-vector-tile-layer';
import vectorgrid from 'leaflet.vectorgrid';

import { Actions } from '../../../store/dashboard'
import { dictDeepCopy, featurePopupContent } from '../../../utils/main'
import Modal, { ModalContent, ModalHeader } from "../../Modal";
import { fetchingData } from "../../../Requests";
import { allDataIsReady } from "../../../utils/indicators";
import { returnWhere } from "../../../utils/queryExtraction";
import { GeorepoUrls } from '../../../utils/georepo'

// Temporary fix because fake stop does not work on leaflet 1.8.0
L.Canvas.Tile.include({
  _onClick: function (e) {
    var point = this._map.mouseEventToLayerPoint(e).subtract(this.getOffset()),
      layer, clickedLayer;

    for (var id in this._layers) {
      layer = this._layers[id];
      if (layer.options.interactive && layer._containsPoint(point) && !this._map._draggableMoved(layer)) {
        clickedLayer = layer;
      }
    }
    if (clickedLayer) {
      this._fireEvent([clickedLayer], e);
    }
  },
});

/**
 * Show details of indicator in Modal
 * @param {str} group Group of indicator
 * @param {str} url Url of details
 * @param {Function} onClose Modal onclose
 */
export function IndicatorDetailsModal({ group, feature, onClose }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);

  const fetchData = (url) => {
    fetchingData(url, {}, {}, (data) => {
      if (url === feature.url) {
        setData(data)
      }
    })
  }

  // Show modal when url changed
  useEffect(() => {
    setData(null)
    if (feature?.url) {
      setOpen(true)
      fetchData(feature.url)
    } else {
      setOpen(false)
    }
  }, [feature])

  let columns = [];
  let rows = [];
  if (data?.details && feature?.name && feature?.name.includes('Program Coverage')) {
    columns = [
      { field: 'id', headerName: 'id', hide: true },
      { field: 'title', headerName: 'Title', flex: 1 },
      { field: 'status', headerName: 'Status', width: 70 },
      { field: 'sections', headerName: 'Sections', width: 130 },
      {
        field: 'reference_number',
        headerName: 'Reference Number',
        width: 200
      },
      { field: 'partner_name', headerName: 'Partner Name', width: 200 },
      { field: 'start_date', headerName: 'Start Date', width: 130 },
      { field: 'end_date', headerName: 'End Date', width: 130 },
      { field: 'budget_total', headerName: 'Budget Total', width: 130 }
    ]
    rows = data.details.map((row, idx) => {
      row.id = idx
      return row
    })
  }

  return <Modal
    className='MuiBox-Large'
    open={open}
    onClosed={() => {
      setOpen(false)
      onClose()
    }
    }
  >
    <ModalHeader onClosed={() => {
      setOpen(false)
      onClose()
    }
    }>
      List Data of {feature?.name} in {feature?.geometry_name}
    </ModalHeader>
    <ModalContent>
      {
        !data ? <i>Loading</i> :
          rows.length === 0 ? 'Empty' :
            <div style={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
              />
            </div>
      }
    </ModalContent>
  </Modal>
}

/**
 * Return value by geometry
 */
function returnValueByGeometry(layer, indicators, indicatorsData) {
  const byGeometry = {}
  if (Object.keys(layer).length) {
    layer.indicators.map(indicatorLayer => {
      const indicator = indicators.find(indicator => indicatorLayer.id === indicator.id)
      if (indicatorsData[indicator.id] && indicatorsData[indicator.id].fetched) {
        if (indicatorsData[indicator.id].data) {
          indicatorsData[indicator.id].data.forEach(function (data) {
            if (!byGeometry[data.geometry_code]) {
              byGeometry[data.geometry_code] = []
            }
            byGeometry[data.geometry_code].push(data);
          })
        }
      }
    })
  }
  return byGeometry
}

/**
 * Return no data style
 */
function returnNoDataStyle(layer) {
  let noDataRule = null
  if (layer?.rules) {
    noDataRule = layer.rules.filter(
      rule => rule.active
    ).find(rule => rule.rule.toLowerCase() === 'no data')
  }
  return noDataRule
}

/**
 * Return style
 */
function returnStyle(layer, values, noDataStyle) {
  let style = null
  if (layer?.indicators?.length === 1) {
    if (values) {
      const indicatorData = values[0];
      if (indicatorData) {
        style = indicatorData.style
      } else {
        style = noDataStyle;
      }
    } else {
      style = noDataStyle;
    }
  }
  return style
}

/**
 * ReferenceLayer selector.
 */
export default function ReferenceLayer() {
  const switchVectorTileZoom = 9
  const prevState = useRef()
  const dispatch = useDispatch()
  const {
    referenceLayer,
    indicators
  } = useSelector(state => state.dashboard.data);
  const referenceLayerData = useSelector(state => state.referenceLayerData);
  const indicatorsData = useSelector(state => state.indicatorsData);
  const filtersData = useSelector(state => state.filtersData);
  const filteredGeometries = useSelector(state => state.filteredGeometries);
  const currentIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);
  const currentIndicatorSecondLayer = useSelector(state => state.selectedIndicatorSecondLayer);
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel);
  const { zoom, indicatorShow } = useSelector(state => state.map);
  const { compareMode } = useSelector(state => state.mapMode)
  let popup = L.popup();

  const [clickedFeature, setClickedFeature] = useState(null);
  const [gridLayer, setGridLayer] = useState(null);
  const [VTLayer, setVTLayer] = useState(null);
  const where = returnWhere(filtersData ? filtersData : [])
  const [prevWhere, setPrevWhere] = useState(JSON.stringify(where));

  // When reference layer changed, fetch reference data
  useEffect(() => {
    if (!referenceLayerData[referenceLayer.identifier]) {
      dispatch(
        Actions.ReferenceLayerData.fetch(
          dispatch, referenceLayer.identifier, referenceLayer.detail_url
        )
      )
    }
  }, [referenceLayer]);

  // Filter geometry_code based on indicators layer
  // Also filter by levels that found on indicators
  let geometryCodes = filteredGeometries;

  // Get style for no data style
  let noDataStyle = returnNoDataStyle(currentIndicatorLayer)
  let noDataStyleSecondLayer = returnNoDataStyle(currentIndicatorSecondLayer)

  // Current level
  let currentLevel = selectedAdminLevel ? selectedAdminLevel.level : referenceLayerData[referenceLayer.identifier]?.levels[0]?.level
  const updateLayer = () => {
    const vectorTiles = referenceLayerData[referenceLayer.identifier]?.data?.vector_tiles
    let levels = referenceLayerData[referenceLayer.identifier]?.data?.levels
    if (vectorTiles && levels) {
      // Save indicator data per geom
      // This is needed for popup and rendering
      const indicatorValueByGeometry = returnValueByGeometry(
        currentIndicatorLayer, indicators, indicatorsData
      )
      const indicatorSecondValueByGeometry = returnValueByGeometry(
        currentIndicatorSecondLayer, indicators, indicatorsData
      )
      const options = {
        rendererFactory: L.canvas.tile,
        maxDetailZoom: 8,
        vectorTileLayerStyles: {},
        interactive: true
      };

      /** Styling **/
      const vectorTileLayerStyles = (properties, zoom) => {
        // Filter it first
        let allowed;
        if (currentLevel !== properties.level) {
          allowed = false
        } else {
          allowed = !where || !geometryCodes.length === 0 || geometryCodes.includes(properties.code)
        }
        if (!allowed) {
          return [];
        } else {
          // Generate style
          let style = null;
          let secondStyle = null;
          if (indicatorShow) {
            style = returnStyle(
              currentIndicatorLayer, indicatorValueByGeometry[properties.code], noDataStyle
            )
            secondStyle = returnStyle(
              currentIndicatorSecondLayer, indicatorSecondValueByGeometry[properties.code], noDataStyleSecondLayer
            )
          }
          let weight = 0.5;
          let fillColor = style ? style.color : null;
          let strokeColor = style ? style.outline_color : null;

          // If compare mode
          // Fill color is using second style color and stroke is from first style
          if (compareMode) {
            fillColor = null;
            strokeColor = style ? style.color : null;
            weight = 5;
          }
          if (secondStyle) {
            fillColor = secondStyle.color
          }

          let fillOpacity = 0;
          if (fillColor) {
            fillOpacity = 0.7;
          }
          if (!strokeColor) {
            weight = 0.5;
          }
          return {
            color: strokeColor ? strokeColor : '#000000',
            opacity: 1,
            weight: weight,
            fill: true,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
          }
        }
      }
      levels.map(level => {
        options.vectorTileLayerStyles['Level-' + level.level] = vectorTileLayerStyles
      })
      const url = GeorepoUrls.WithDomain(vectorTiles)
      const newVtLayer = vectorTileLayer(url, options)
      const newGridLayer = L.vectorGrid.protobuf(url, options)
      setVTLayer(newVtLayer)
      setGridLayer(newGridLayer)

      /** Get popup content **/
      const getPopup = (featureProperties) => {
        // CREATE POPUP
        let properties = {}
        if (currentIndicatorLayer?.indicators?.length === 1) {
          if (indicatorValueByGeometry[featureProperties.code]) {
            properties = Object.assign({}, {}, indicatorValueByGeometry[featureProperties.code][0])
          }
        }
        properties[featureProperties.type] = featureProperties.label
        delete featureProperties.label
        properties = Object.assign({}, featureProperties, properties)
        delete properties.geometry_code
        delete properties.indicator_id
        delete properties.level
        delete properties.type
        delete properties.code
        delete properties.centroid
        delete properties.style
        properties['geometry_code'] = featureProperties.code
        properties['name'] = currentIndicatorLayer.name

        delete properties.parent_code

        // IF COMPARE MODE
        if (compareMode) {
          properties[currentIndicatorLayer.name] = properties.value
          if (currentIndicatorSecondLayer?.indicators?.length === 1) {
            if (indicatorSecondValueByGeometry[featureProperties.code]) {
              properties[currentIndicatorSecondLayer.name] = indicatorSecondValueByGeometry[featureProperties.code][0]?.value
            }
          }
          delete properties.value
          delete properties.name
        }
        return featurePopupContent(properties.name ? properties.name : 'Reference Layer', properties)
      }
      newVtLayer.onClick = (e, map) => {
        L.popup()
          .setContent(getPopup(dictDeepCopy(e.layer.properties)))
          .setLatLng(e.latlng)
          .openOn(map)
      }
      newGridLayer.onClick = (e, map) => {
        L.popup()
          .setContent(getPopup(dictDeepCopy(e.layer.properties)))
          .setLatLng(e.latlng)
          .openOn(map)
      }
      changeReferenceLayer(newVtLayer, newGridLayer)
    }
  }

  // Change reference layer
  const changeReferenceLayer = (VTLayer, gridLayer) => {
    const layer = zoom < switchVectorTileZoom ? gridLayer : VTLayer
    dispatch(
      Actions.Map.changeReferenceLayer(layer)
    )
  }

  /** Promise update layer **/
  function promiseUpdateLayer() {
    return new Promise(resolve => {
      setTimeout(() => {
        updateLayer()
        resolve('resolved')
      }, 100);
    });
  }


  /** Call update layer **/
  async function callUpdateLayer() {
    const result = await promiseUpdateLayer();
  }

  useEffect(() => {
    let indicatorLayerData = []
    if (currentIndicatorLayer.indicators) {
      currentIndicatorLayer.indicators.map(indicatorLayer => {
        indicatorLayerData.push(indicatorsData[indicatorLayer.id])
      })
    }
    if (currentIndicatorSecondLayer.indicators) {
      currentIndicatorSecondLayer.indicators.map(indicatorLayer => {
        indicatorLayerData.push(indicatorsData[indicatorLayer.id])
      })
    }
    if (allDataIsReady(indicatorLayerData)) {
      callUpdateLayer()
    }
  }, [
    indicatorsData, currentIndicatorLayer, currentIndicatorSecondLayer, compareMode
  ]);

  useEffect(() => {
    if (referenceLayerData[referenceLayer.identifier]) {
      callUpdateLayer()
    }
  }, [referenceLayer, referenceLayerData, selectedAdminLevel, indicatorShow]);

  useEffect(() => {
    if ((prevState.zoom < switchVectorTileZoom && zoom >= switchVectorTileZoom) || (zoom < switchVectorTileZoom && prevState.zoom >= switchVectorTileZoom)) {
      changeReferenceLayer(VTLayer, gridLayer)
    }
    prevState.zoom = zoom
  }, [zoom]);


  // Rerender if filters
  useEffect(() => {
    const whereStr = JSON.stringify(where)
    if (prevWhere !== whereStr) {
      callUpdateLayer()
      setPrevWhere(whereStr)
    }
  }, [
    filteredGeometries
  ]);

  return (
    <Fragment>
      <IndicatorDetailsModal feature={clickedFeature} onClose={() => {
        setClickedFeature(null)
      }}/>
    </Fragment>
  )
}
