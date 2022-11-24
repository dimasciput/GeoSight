/* ==========================================================================
   CONTEXT LAYER
   ========================================================================== */

import React, { Fragment, useEffect } from 'react';
import { centroid as turfCentroid } from '@turf/turf';
import { useSelector } from "react-redux";
import { hasLayer, hasSource, removeLayer, removeSource } from "../../utils";
import { arcGisLayer, geojsonLayer, rasterTileLayer } from "../../LayerType"
import { dictDeepCopy, featurePopupContent } from "../../../../../utils/main";

const ID = `context-layer`
const markersContextLayers = {}
const onLoadFunctions = {}

/**
 * Remove source and layer
 */
function removeLayers(map, id) {
  const layers = map.getStyle().layers.filter(layer => layer.id.includes(id))
  layers.map(layer => {
    removeLayer(map, layer.id)
  })
  // Remove marker
  markersContextLayers[id]?.map(marker => {
    marker.remove();
  })
  markersContextLayers[id] = []
}

/**
 * Remove source and layer
 */
function removeSourceAndLayers(map, id) {
  removeLayers(map, id)
  const sources = Object.keys(map.getStyle().sources).filter(source => source.includes(id))
  sources.map(source => {
    removeSource(map, source)
  })
}


/*** For popup **/
const popupFeature = (featureProperties, name, fields, defaultField) => {
  let properties = dictDeepCopy(featureProperties)
  if (defaultField?.length) {
    fields = defaultField
  }
  if (fields) {
    fields.map(field => {
      if (field.visible !== false) {
        if (field.name) {
          properties[field.alias] = featureProperties[field.name]
          if (field.type === 'date') {
            try {
              properties[field.alias] = new Date(featureProperties[field.name]).toString()
            } catch (err) {

            }
          }
          if (field.name !== field.alias) {
            delete properties[field.name]
          }
        }
      } else {
        if (properties[field.name] !== undefined) {
          delete properties[field.name]
        }
      }
    })
    return featurePopupContent(name, properties, "")
  }
}

/**
 * Render label of data
 */
export function renderLabel(id, contextLayerData, contextLayer, map) {
  const labels = contextLayerData.data_fields.filter(field => field.as_label)
  if (labels.length && contextLayerData.label_styles) {

    // Add label source
    const idLabel = id + '-label'
    if (!hasSource(map, idLabel)) {
      map.addSource(idLabel, {
        'type': 'geojson',
        'data': {
          type: 'FeatureCollection',
          features: []
        }
      });
    }

    // Add layer
    if (!hasLayer(map, idLabel)) {
      const layout = {
        'text-anchor': 'bottom',
        'text-size': 14,
        'text-offset': [0, -1]
      }
      const paint = {
        'text-halo-blur': 2
      }
      const labels = contextLayerData.data_fields.filter(field => field.as_label)
      if (labels.length && contextLayerData.label_styles) {
        const style = contextLayerData.label_styles
        paint['text-color'] = style.fontColor
        layout['text-size'] = style.fontSize
        paint['text-halo-color'] = style.haloColor
        paint['text-halo-width'] = 1

        const textField = ['format']
        labels.map((label, idx) => {
          textField.push(['get', label.name])
          textField.push({})
          if (idx < labels - 1) {
            textField.push('\n')
            textField.push({})
          }
        })
        layout['text-field'] = textField
      }
      map.addLayer(
        {
          id: idLabel,
          type: 'symbol',
          source: idLabel,
          filter: ['==', '$type', 'Point'],
          layout: layout,
          paint: paint,
        }
      );
    }

    // For onload layer
    if (!onLoadFunctions[id]) {
      onLoadFunctions[id] = (e) => {
        if (e.sourceId === id && e?.source?.data?.features?.length) {
          const features = dictDeepCopy(e?.source?.data?.features)
          features.map(feature => {
            const centroid = turfCentroid({
              type: 'FeatureCollection',
              features: [feature]
            });
            feature.geometry = centroid.geometry
          })

          // Update the source
          map.getSource(idLabel).setData({
            type: 'FeatureCollection',
            features: features
          });
        }
      }
    }
    map.off('sourcedata', onLoadFunctions[id]);
    map.on('sourcedata', onLoadFunctions[id]);
  }
}

/**
 * Context layer rendering data
 */
export function contextLayerRendering(id, contextLayerData, contextLayer, map) {
  if (map) {
    if (contextLayer?.layer) {
      const { layer, layer_type } = contextLayer
      switch (layer_type) {
        case 'Geojson': {
          const markers = geojsonLayer(map, id, layer, featureProperties => {
            return popupFeature(
              featureProperties, contextLayerData.name, [], contextLayerData.data_fields
            )
          })
          markersContextLayers[id] = markers
          break;
        }
        case 'Raster Tile': {
          rasterTileLayer(map, id, layer)
          break;
        }
        case 'ARCGIS': {
          arcGisLayer(map, id, layer, contextLayerData, (featureProperties, arcgisField) => {
            return popupFeature(
              featureProperties, contextLayerData.name, arcgisField, contextLayerData.data_fields
            )
          })
          renderLabel(id, contextLayerData, contextLayer, map)
          break;
        }
      }
    } else {
      removeLayers(map, id)
    }
  }
}

/**
 * ReferenceLayer selector.
 */
export function ContextLayer({ contextLayerData, map }) {
  const { contextLayersShow } = useSelector(state => state.map);
  const contextLayer = useSelector(state => state.map?.contextLayers[contextLayerData.id]);
  const id = ID + '-' + contextLayerData.id

  /** CONTEXT LAYER CHANGED */
  useEffect(() => {
    if (contextLayersShow) {
      contextLayerRendering(id, contextLayerData, contextLayer, map)
    } else {
      removeLayers(map, id)
    }
  }, [map, contextLayer, contextLayersShow]);
  return ""
}

/**
 * ReferenceLayer selector.
 */
export default function ContextLayers({ map }) {
  const { contextLayers } = useSelector(state => state.dashboard.data);
  return <Fragment>{
    contextLayers ?
      contextLayers.map(contextLayer => {
        return <ContextLayer
          key={contextLayer.id}
          contextLayerData={contextLayer}
          map={map}/>
      }) : ""
  }</Fragment>
}
