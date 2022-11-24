/* ==========================================================================
   MAP CONTAINER
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import maplibregl from 'maplibre-gl';

import ReferenceLayerCentroid from './ReferenceLayerCentroid'
import ReferenceLayer from "./Layers/ReferenceLayer";
import ContextLayers from "./Layers/ContextLayers";
import { Plugin } from "./Plugin";
import { removeLayer, removeSource } from "./utils"

// Toolbars
import {
  Bookmark,
  CompareLayer,
  DownloaderData,
  Measurement,
  MovementHistories,
  TiltControl
} from '../Toolbars'

import 'maplibre-gl/dist/maplibre-gl.css';
import './style.scss';

const BASEMAP_ID = `basemap`

/**
 * MapLibre component.
 */
export default function MapLibre() {
  const [map, setMap] = useState(null);
  const { extent } = useSelector(state => state.dashboard.data);
  const { basemapLayer } = useSelector(state => state.map);

  /**
   * FIRST INITIATE
   * */
  useEffect(() => {
    if (!map) {
      const newMap = new maplibregl.Map({
        container: 'map',
        style: {
          version: 8,
          sources: {},
          layers: [],
          glyphs: "https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=get_your_own_OpIi9ZULNHzrESv6T2vL"
        },
        center: [0, 0],
        zoom: 1
      });
      newMap.once("load", () => {
        setMap(newMap)
      })
      newMap.addControl(new maplibregl.NavigationControl(), 'top-left');
    }
  }, []);


  /**
   * EXTENT CHANGED
   * */
  useEffect(() => {
    if (map && extent) {
      map.fitBounds([
        [extent[0], extent[1]],
        [extent[2], extent[3]]
      ])
    }
  }, [map, extent]);

  /***
   * Render layer to maplibre
   * @param {String} id of layer
   * @param {Object} source Layer config options.
   * @param {Object} layer Layer config options.
   * @param {String} before Is the layer after it.
   */
  const renderLayer = (id, source, layer, before = null) => {
    removeLayer(map, id)
    removeSource(map, id)
    map.addSource(id, source)
    return map.addLayer(
      {
        ...layer,
        id: id,
        source: id,
      },
      before
    );
  }

  /** BASEMAP CHANGED */
  useEffect(() => {
    if (map && basemapLayer) {
      const layers = map.getStyle().layers.filter(layer => layer.id !== 'basemap')
      renderLayer(
        BASEMAP_ID, basemapLayer, { type: "raster" }, layers[0]?.id
      )
    }
  }, [map, basemapLayer]);

  return <section className='DashboardMap'>
    <div id="map"></div>
    {/* TOOLBARS */}
    <div className='Toolbar'>
      <MovementHistories map={map}/>
      <TiltControl map={map}/>
      <Measurement map={map}/>
      <Plugin>
        <Bookmark/>
      </Plugin>
      <Plugin>
        <DownloaderData/>
      </Plugin>
      <Plugin>
        <CompareLayer/>
      </Plugin>
    </div>

    <ReferenceLayer map={map}/>
    <ContextLayers map={map}/>
    {
      map ?
        <ReferenceLayerCentroid map={map}/> : ""
    }
  </section>
}

