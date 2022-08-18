/* ==========================================================================
   MAP CONFIG CONTAINER
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import L from 'leaflet';

/**
 * Map Config component.
 */
export default function MapConfig({ layerInput }) {
  const [map, setMap] = useState(null);
  const [layer, setLayer] = useState(null);

  useEffect(() => {
    if (!map) {
      const newMap = L.map('StyleMapConfig', {
        center: [0, 0],
        zoom: 2,
        zoomControl: false,
        maxZoom: maxZoom,
        noWrap: true
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(newMap);
      setMap(newMap);
    }
  }, [map]);

  // When layer input changed, remove from map
  useEffect(() => {
    if (map) {
      if (layer) {
        map.removeLayer(layer)
      }
      if (layerInput) {
        map.addLayer(layerInput)
      }
      setLayer(layerInput)
    }
  }, [map, layerInput]);

  return <div id="StyleMapConfig"></div>
}

