/* ==========================================================================
   MAP CONFIG CONTAINER
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import {
  removeLayer,
  removeSource
} from "../../../../components/Dashboard/MapLibre/utils";
import {
  contextLayerRendering
} from "../../../../components/Dashboard/MapLibre/Layers/ContextLayers/index";

import 'maplibre-gl/dist/maplibre-gl.css';

/**
 * Map Config component.
 */
export default function MapConfig({ data, layerInput }) {
  const [map, setMap] = useState(null);

  /***
   * Render layer to maplibre
   * @param {String} id of layer
   * @param {Object} source Layer config options.
   * @param {Object} layer Layer config options.
   * @param {String} before Is the layer after it.
   */
  const renderLayer = (map, id, source, layer, before = null) => {
    removeLayer(map, id)
    removeSource(map, id)
    map.addSource(id, source);
    return map.addLayer(
      {
        ...layer,
        id: id,
        source: id,
      },
      before
    );
  }

  useEffect(() => {
    if (!map) {
      const newMap = new maplibregl.Map({
        container: 'StyleMapConfig',
        style: { version: 8, sources: {}, layers: [] },
        center: [0, 0],
        zoom: 1,
        attributionControl: false
      });

      newMap.once("load", () => {
        renderLayer(
          newMap, 'basemap', {
            attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
            maxNativeZoom: 19,
            maxZoom: 24,
            noWrap: "true",
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png?noWrap=true'],
            type: "raster"
          },
          { type: "raster" }
        )
        setMap(newMap);
      })
    }
  }, [map]);

  // When layer input changed, remove from map
  useEffect(() => {
    if (map) {
      const id = 'Context-Layer'
      contextLayerRendering(id, data, layerInput, map)
    }
  }, [map, layerInput]);

  return <div id="StyleMapConfig"></div>
}

