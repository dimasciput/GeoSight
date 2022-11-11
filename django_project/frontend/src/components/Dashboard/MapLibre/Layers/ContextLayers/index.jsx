/* ==========================================================================
   CONTEXT LAYER
   ========================================================================== */

import React, { Fragment, useEffect } from 'react';
import { useSelector } from "react-redux";
import { removeLayer, removeSource } from "../../utils";
import { arcGisLayer, geojsonLayer, rasterTileLayer } from "../../LayerType"
import { dictDeepCopy, featurePopupContent } from "../../../../../utils/main";

const ID = `context-layer`
const markersContextLayers = {}

/**
 * Remove layer
 */
function removeLayers(map, id) {
  const layers = map.getStyle().layers.filter(layer => layer.id.includes(id))
  layers.map(layer => {
    removeLayer(map, layer.id)
  })
  const sources = Object.keys(map.getStyle().sources).filter(source => source.includes(id))
  sources.map(source => {
    removeSource(map, source)
  })
  // Remove marker
  markersContextLayers[id]?.map(marker => {
    marker.remove();
  })
  markersContextLayers[id] = []
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
        properties[field.alias] = featureProperties[field.name]
        if (field.type === 'date') {
          try {
            properties[field.alias] = new Date(featureProperties[field.name]).toString()
          } catch (err) {

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
          arcGisLayer(map, id, layer, (featureProperties, arcgisField) => {
            return popupFeature(
              featureProperties, contextLayerData.name, arcgisField, contextLayerData.data_fields
            )
          })
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
  const contextLayer = useSelector(state => state.map?.contextLayers[contextLayerData.id]);
  const id = ID + '-' + contextLayerData.id

  /** CONTEXT LAYER CHANGED */
  useEffect(() => {
    contextLayerRendering(id, contextLayerData, contextLayer, map)
  }, [map, contextLayer]);
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
