/* ==========================================================================
   REFERENCE LAYER
   ========================================================================== */

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Actions } from '../../../../../store/dashboard'
import { GeorepoUrls } from '../../../../../utils/georepo'
import { allDataIsReady } from "../../../../../utils/indicators";
import { returnWhere } from "../../../../../utils/queryExtraction";
import { featurePopupContent } from '../../../../../utils/main'
import { addPopup, hasLayer, removeLayer, removeSource } from "../../utils"
import { returnNoDataStyle, returnStyle, returnValueByGeometry } from './utils'

const NOCOLOR = `rgba(0, 0, 0, 0)`
const BEFORE_LAYER = 'gl-draw-polygon-fill-inactive.cold'
const CONTEXT_LAYER_ID = `context-layer`
const REFERENCE_LAYER_ID = `reference-layer`
const FILL_LAYER_ID = REFERENCE_LAYER_ID + '-fill'
const OUTLINE_LAYER_ID = REFERENCE_LAYER_ID + '-outline'

/**
 * ReferenceLayer selector.
 */
export default function ReferenceLayer({ map }) {
  const prevState = useRef()
  const dispatch = useDispatch()
  const {
    referenceLayer,
    indicators
  } = useSelector(state => state.dashboard.data);
  const { indicatorShow } = useSelector(state => state.map);
  const { compareMode } = useSelector(state => state.mapMode)
  const referenceLayerData = useSelector(state => state.referenceLayerData);
  const indicatorsData = useSelector(state => state.indicatorsData);
  const filtersData = useSelector(state => state.filtersData);
  const filteredGeometries = useSelector(state => state.filteredGeometries);
  const currentIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);
  const currentIndicatorSecondLayer = useSelector(state => state.selectedIndicatorSecondLayer);
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel);

  const [layerCreated, setLayerCreated] = useState(false);

  const where = returnWhere(filtersData ? filtersData : [])
  const isReady = () => {
    return map && hasLayer(map, FILL_LAYER_ID) && hasLayer(map, OUTLINE_LAYER_ID)
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

  // When indicator data, current layer, second layer and compare mode changed
  // Update the style
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
      updateStyle()
    }
  }, [
    indicatorsData, currentIndicatorLayer,
    currentIndicatorSecondLayer, compareMode,
    layerCreated
  ]);

  // When reference layer, it's data, admin and show/hide changed.
  // Change the source
  useEffect(() => {
    if (referenceLayerData[referenceLayer.identifier]) {
      createLayer()
    }
  }, [referenceLayer, referenceLayerData, selectedAdminLevel]);


  // Rerender if filter changed.
  useEffect(() => {
    const whereStr = JSON.stringify(where)
    const filteredGeometriesStr = JSON.stringify(filteredGeometries)
    if (prevState.where !== whereStr || prevState.filteredGeometries !== filteredGeometriesStr) {
      updateFilter()
      prevState.where = whereStr
      prevState.filteredGeometries = filteredGeometriesStr
    }
  }, [filteredGeometries, layerCreated]);

  // Rerender when map changed.
  useEffect(() => {
    createLayer()
  }, [map]);

  // Rerender when map changed.
  useEffect(() => {
    if (map) {
      if (indicatorShow) {
        createLayer()
      } else {
        removeAllLayers()
      }
    }
  }, [indicatorShow]);

  /**
   * Remove all layer
   */
  const removeAllLayers = () => {
    removeLayer(map, FILL_LAYER_ID)
    removeLayer(map, OUTLINE_LAYER_ID)
    removeSource(map, REFERENCE_LAYER_ID)
  }
  /***
   * CREATE LAYER
   */
  const createLayer = () => {
    let currentLevel = selectedAdminLevel ? selectedAdminLevel.level : referenceLayerData[referenceLayer.identifier]?.levels[0]?.level
    const vectorTiles = referenceLayerData[referenceLayer.identifier]?.data?.vector_tiles
    let levels = referenceLayerData[referenceLayer.identifier]?.data?.levels
    if (vectorTiles && levels && map && currentLevel !== undefined) {
      const url = GeorepoUrls.WithDomain(vectorTiles)
      const referenceLayer = {
        tiles: [url],
        "source-layer": 'Level-' + currentLevel
      }

      const source = {
        ...referenceLayer,
        type: 'vector',
      }
      removeAllLayers()
      map.addSource(REFERENCE_LAYER_ID, source);

      // Fill layer
      const contextLayerIds = map.getStyle().layers.filter(
        layer => layer.id.includes(CONTEXT_LAYER_ID) || layer.id === BEFORE_LAYER
      )
      map.addLayer(
        {
          id: OUTLINE_LAYER_ID,
          source: REFERENCE_LAYER_ID,
          type: 'line',
          "source-layer": referenceLayer["source-layer"],
          paint: {
            'line-color': NOCOLOR,
            'line-offset': 1,
            'line-width': 1,
          }
        },
        contextLayerIds[0]?.id
      )
      map.addLayer(
        {
          id: FILL_LAYER_ID,
          source: REFERENCE_LAYER_ID,
          type: 'fill',
          "source-layer": referenceLayer["source-layer"],
          paint: {
            'fill-color': NOCOLOR,
            'fill-outline-color': '#000000'
          }
        },
        OUTLINE_LAYER_ID
      )
      updateStyle()
      updateFilter()
      setLayerCreated(true)
    }
  }

  /***
   * UPDATE FILTER OF LAYER
   */
  const updateFilter = () => {
    let whereStr = null
    if (where) {
      whereStr = JSON.stringify(where)
    }
    if (isReady()) {
      if (whereStr && filteredGeometries && filteredGeometries.length) {
        map.setFilter(FILL_LAYER_ID, ['in', 'code'].concat(filteredGeometries));
        map.setFilter(OUTLINE_LAYER_ID, ['in', 'code'].concat(filteredGeometries));
      } else {
        map.setFilter(FILL_LAYER_ID, null);
        map.setFilter(OUTLINE_LAYER_ID, null);
      }
    }
  }
  /***
   * UPDATE STYLE LAYER
   */
  const updateStyle = () => {
    // Filter geometry_code based on indicators layer
    // Also filter by levels that found on indicators
    if (isReady()) {

      // Get style for no data style
      let noDataStyle = returnNoDataStyle(currentIndicatorLayer)
      if (!noDataStyle) {
        noDataStyle = {
          color: NOCOLOR,
          outline_color: '#000000'
        }
      }
      let noDataStyleSecondLayer = returnNoDataStyle(currentIndicatorSecondLayer)

      // Save indicator data per geom
      // This is needed for popup and rendering
      const indicatorValueByGeometry = returnValueByGeometry(
        currentIndicatorLayer, indicators, indicatorsData
      )
      const indicatorSecondValueByGeometry = returnValueByGeometry(
        currentIndicatorSecondLayer, indicators, indicatorsData
      )

      // Create colors
      const fillColorsAndGeom = {}
      const outlineColorsAndGeom = {}
      if (!compareMode) {
        // If not compare mode
        // Fill and color is from first indicator
        for (const [key, value] of Object.entries(indicatorValueByGeometry)) {
          // Check outline color
          {
            const style = returnStyle(
              currentIndicatorLayer, value, noDataStyle
            )
            const color = style?.outline_color
            if (color && color !== '#000000') {
              if (!outlineColorsAndGeom[color]) {
                outlineColorsAndGeom[color] = []
              }
              outlineColorsAndGeom[color].push(key)
            }
          }
          // Check fill color
          {
            const style = returnStyle(currentIndicatorLayer, value, noDataStyle)
            const color = style?.color
            if (color) {
              if (!fillColorsAndGeom[color]) {
                fillColorsAndGeom[color] = []
              }
              fillColorsAndGeom[color].push(key)
            }
          }
        }
      } else {
        // If compare mode
        // Outline is first indicator color
        // Fill is second color
        for (const [key, value] of Object.entries(indicatorValueByGeometry)) {
          // Check outline color
          {
            const style = returnStyle(
              currentIndicatorLayer, value, noDataStyle
            )
            const color = style?.color
            if (color) {
              if (!outlineColorsAndGeom[color]) {
                outlineColorsAndGeom[color] = []
              }
              outlineColorsAndGeom[color].push(key)
            }
          }
        }
        for (const [key, value] of Object.entries(indicatorSecondValueByGeometry)) {
          // Check fill color
          {
            const style = returnStyle(currentIndicatorSecondLayer, value, noDataStyleSecondLayer)
            const color = style?.color
            if (color) {
              if (!fillColorsAndGeom[color]) {
                fillColorsAndGeom[color] = []
              }
              fillColorsAndGeom[color].push(key)
            }
          }
        }
      }

      // Change colors
      {
        // OUTLINE
        const cases = []
        for (const [color, codes] of Object.entries(outlineColorsAndGeom)) {
          cases.push(
            ["in", ["get", "code"], ["literal", codes]]
          )
          cases.push(color)
        }
        if (cases.length) {
          const paintFilters = ["case"].concat(cases).concat(NOCOLOR)
          map.setPaintProperty(OUTLINE_LAYER_ID, 'line-color', paintFilters);
        } else {
          map.setPaintProperty(OUTLINE_LAYER_ID, 'line-color', NOCOLOR);
        }
        map.setPaintProperty(OUTLINE_LAYER_ID, 'line-width', compareMode ? 4 : 1);
        map.setPaintProperty(OUTLINE_LAYER_ID, 'line-offset', compareMode ? 2 : 1);
      }
      {
        // FILL
        const cases = []
        for (const [color, codes] of Object.entries(fillColorsAndGeom)) {
          cases.push(
            ["in", ["get", "code"], ["literal", codes]]
          )
          cases.push(color)
        }
        if (cases.length) {
          const paintFilters = ["case"].concat(cases).concat(noDataStyle.color)
          map.setPaintProperty(FILL_LAYER_ID, 'fill-color', paintFilters);
        } else {
          map.setPaintProperty(FILL_LAYER_ID, 'fill-color', noDataStyle.color);
        }
      }

      /***
       * Create popup
       */
      addPopup(map, FILL_LAYER_ID, featureProperties => {
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
      })
    }
  }

  return ""
}
