/* ==========================================================================
   REFERENCE LAYER
   ========================================================================== */

import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import $ from 'jquery';
import vectorTileLayer from 'leaflet-vector-tile-layer';

import { Actions } from '../../../store/dashboard'
import { featurePopupContent } from '../../../utils/main'
import Modal, { ModalContent, ModalHeader } from "../../Modal";
import { fetchingData } from "../../../Requests";
import { allDataIsReady } from "../../../utils/indicators";
import { returnWhere } from "../../../utils/queryExtraction";
import { GeorepoUrls } from '../../../utils/georepo'

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
 * ReferenceLayer selector.
 */
export default function ReferenceLayer() {
  const dispatch = useDispatch();
  const {
    referenceLayer,
    indicators
  } = useSelector(state => state.dashboard.data);
  const referenceLayerData = useSelector(state => state.referenceLayerData);
  const indicatorsData = useSelector(state => state.indicatorsData);
  const filtersData = useSelector(state => state.filtersData);
  const filteredGeometries = useSelector(state => state.filteredGeometries);
  const currentIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel);
  const { indicatorShow } = useSelector(state => state.map);

  const [clickedFeature, setClickedFeature] = useState(null);

  const where = returnWhere(filtersData ? filtersData : [])
  const [prevWhere, setPrevWhere] = useState(JSON.stringify(where));

  // Filter geometry_code based on indicators layer
  // Also filter by levels that found on indicators
  let geometryCodes = filteredGeometries;

  // If there is currentIndicatorLayer that selected
  // Use level from that
  let noDataRule = null
  let otherDataRule = null
  if (currentIndicatorLayer?.rules) {
    noDataRule = currentIndicatorLayer.rules.filter(
      rule => rule.active
    ).find(rule => rule.rule.toLowerCase() === 'no data')
    otherDataRule = currentIndicatorLayer.rules.filter(
      rule => rule.active
    ).find(rule => rule.rule.toLowerCase() === 'other data')
  }

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

  // Current level
  let currentLevel = selectedAdminLevel ? selectedAdminLevel.level : referenceLayerData[referenceLayer.identifier]?.levels[0]?.level
  const updateLayer = () => {
    const vectorTiles = referenceLayerData[referenceLayer.identifier]?.data?.vector_tiles
    if (vectorTiles) {
      // Save indicator data per geom
      // This is needed for popup and rendering
      const valuesByGeometry = {}
      if (Object.keys(currentIndicatorLayer).length) {
        currentIndicatorLayer.indicators.map(indicatorLayer => {
          const indicator = indicators.find(indicator => indicatorLayer.id === indicator.id)
          if (indicatorsData[indicator.id] && indicatorsData[indicator.id].fetched) {
            if (indicatorsData[indicator.id].data) {
              indicatorsData[indicator.id].data.forEach(function (data) {
                if (!valuesByGeometry[data.geometry_code]) {
                  valuesByGeometry[data.geometry_code] = []
                }
                const rules = indicator.rules
                const filteredRules = rules.filter(rule => {
                  const ruleStr = rule.rule.replaceAll('x', data.value).replaceAll('and', '&&').replaceAll('or', '||')
                  try {
                    return eval(ruleStr)
                  } catch (err) {
                    return false
                  }
                })
                let style = filteredRules[0]
                style = style ? style : otherDataRule;
                data.style = style
                valuesByGeometry[data.geometry_code].push(data);
              })
            }
          }
        })
      }
      const options = {
        maxDetailZoom: 8,
        filter: function (feature) {
          if (currentLevel !== feature.properties.level) {
            return false
          }
          return !where || !geometryCodes.length === 0 || geometryCodes.includes(feature.properties.code)
        },
        style: function (feature, layer, test) {
          dispatch(
            Actions.Geometries.add(
              feature.properties.code, feature.properties
            )
          );
          let style = null;
          if (indicatorShow) {
            if (currentIndicatorLayer?.indicators?.length === 1) {
              const values = valuesByGeometry[feature.properties.code]
              if (values) {
                const indicatorData = values[0];
                if (indicatorData) {
                  style = indicatorData.style
                } else {
                  style = noDataRule;
                }
              } else {
                style = noDataRule;
              }
            }
          }
          let fillColor = style ? style.color : null;
          let color = style ? style.outline_color : '#000000';
          let weight = 0.5;
          let fillOpacity = 0;
          if (fillColor) {
            fillOpacity = 0.7;
          }
          return {
            color: color,
            weight: weight,
            fillColor: fillColor,
            opacity: 1,
            fillOpacity: fillOpacity
          }
        },
      };

      const url = GeorepoUrls.WithDomain(vectorTiles)
      const layer = vectorTileLayer(url, options);
      layer.bindPopup(function (feature) {
        // CREATE POPUP
        let properties = {}
        if (currentIndicatorLayer?.indicators?.length === 1) {
          if (valuesByGeometry[feature.properties.code]) {
            properties = Object.assign({}, valuesByGeometry[feature.properties.code][0])
          }
        }
        properties = Object.assign({}, properties, feature.properties)
        delete properties.geometry_code
        delete properties.indicator_id
        delete properties.level
        delete properties.label
        delete properties.type
        delete properties.code
        delete properties.centroid
        delete properties.style
        properties[feature.properties.type] = feature.properties.label
        properties['geometry_code'] = feature.properties.code
        properties['name'] = currentIndicatorLayer.name
        delete properties.parent_code
        return featurePopupContent(properties.name ? properties.name : 'Reference Layer', properties)
      });

      dispatch(
        Actions.Map.changeReferenceLayer(layer)
      )
      // TODO:
      //  Hacky way to show details button
      layer.on('click', function (event) {
        const $detail = $('.popup-details');
        if ($detail.length !== 0) {
          $detail.removeAttr("disabled");
          $detail.click(function () {
            setClickedFeature({
              'name': $detail.data('name'),
              'url': $detail.data('url'),
              'geometry_name': event.layer.feature.properties.label
            });
          })
        }

        dispatch(
          Actions.Map.updateCenter(event.latlng)
        )
      }, this);
    }
  }

  useEffect(() => {
    if (allDataIsReady(indicatorsData)) {
      updateLayer()
    }
  }, [
    indicatorsData, currentIndicatorLayer
  ]);

  useEffect(() => {
    if (referenceLayerData[referenceLayer.identifier]) {
      updateLayer()
    }
  }, [referenceLayer, referenceLayerData, selectedAdminLevel, indicatorShow]);


  // Rerender if filters
  useEffect(() => {
    const whereStr = JSON.stringify(where)
    if (prevWhere !== whereStr) {
      updateLayer()
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
