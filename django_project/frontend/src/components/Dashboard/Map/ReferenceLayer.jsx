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
 * @param {dict} currentIndicator Indicator that will be used.
 */
export default function ReferenceLayer({ currentIndicator }) {
  const dispatch = useDispatch();
  const {
    referenceLayer,
    indicators
  } = useSelector(state => state.dashboard.data);
  const referenceLayerData = useSelector(state => state.referenceLayerData);
  const indicatorsData = useSelector(state => state.indicatorsData);
  const filtersData = useSelector(state => state.filtersData);
  const filteredGeometries = useSelector(state => state.filteredGeometries);

  const [clickedFeature, setClickedFeature] = useState(null);

  const where = returnWhere(filtersData ? filtersData : [])
  const [prevWhere, setPrevWhere] = useState(JSON.stringify(where));

  // Filter geometry_code based on indicators layer
  // Also filter by levels that found on indicators
  let geometryCodes = filteredGeometries;

  // If there is currentIndicator that selected
  // Use level from that
  let nodataRule = null
  if (currentIndicator) {
    nodataRule = currentIndicator.rules.filter(
      rule => rule.active
    ).find(rule => rule.rule.toLowerCase() === 'no data')
  }

  // When level changed
  useEffect(() => {
    if (!referenceLayerData[referenceLayer.identifier]) {
      dispatch(
        Actions.ReferenceLayerData.fetch(
          dispatch, referenceLayer.identifier, referenceLayer.detail_url
        )
      )
    }
  }, [referenceLayer]);

  const updateLayer = () => {
    const vectorTiles = referenceLayerData[referenceLayer.identifier]?.data?.vector_tiles
    const levels = referenceLayerData[referenceLayer.identifier]?.data?.levels
    if (vectorTiles) {

      // Save indicator data per geom
      // This is needed for popup and rendering
      const indicatorsByGeom = {}
      if (currentIndicator && indicatorsData[currentIndicator.id] && indicatorsData[currentIndicator.id].fetched) {
        indicatorsData[currentIndicator.id].data.forEach(function (data) {
          indicatorsByGeom[data.geometry_code] = data;
        })
      }

      // Check current level
      let currentLevel = currentIndicator?.reporting_level
      if (!levels[currentLevel]) {
        currentLevel = levels[0].level
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
          const indicatorData = indicatorsByGeom[feature.properties.code];
          const style = indicatorData ? indicatorData : nodataRule;
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
        const properties = indicatorsByGeom[feature.properties.code]
          ? Object.assign({}, indicatorsByGeom[feature.properties.code]) : Object.assign({}, feature.properties);
        delete properties.geometry_code
        delete properties.indicator_id
        properties[feature.properties.type] = feature.properties.label
        properties['geometry_code'] = feature.properties.code
        properties['name'] = currentIndicator.name
        delete properties.level
        delete properties.label
        delete properties.type
        delete properties.code
        delete properties.centroid
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
    updateLayer()
  }, [
    referenceLayer, referenceLayerData, indicatorsData,
    currentIndicator
  ]);


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
