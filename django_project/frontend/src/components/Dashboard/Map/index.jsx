/* ==========================================================================
   MAP CONTAINER
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import L from 'leaflet';
import $ from 'jquery';
import Navbar from 'leaflet-navbar';
import StarIcon from '@mui/icons-material/Star';

import ReferenceLayerCentroid from './ReferenceLayerCentroid'
import { Plugin, PluginChild } from './Plugin'
import CustomPopover from '../../CustomPopover'
import Bookmark from '../Bookmark'
import { Actions } from '../../../store/dashboard/index'

import './style.scss';

/**
 * Map component.
 */
export default function Map() {
  const dispatch = useDispatch();
  const {
    basemapLayer,
    referenceLayer,
    contextLayers,
    center
  } = useSelector(state => state.map);
  const { contextLayersShow } = useSelector(state => state.map);

  const { extent } = useSelector(state => state.dashboard.data);
  const [map, setMap] = useState(null);
  const [basemapLayerGroup, setBasemapLayerGroup] = useState(null);
  const [referenceLayerGroup, setReferenceLayerGroup] = useState(null);
  const [contextLayerGroup, setContextLayerGroup] = useState(null);
  const [navControl, setNavControl] = useState(null);

  // Pane identifier
  const basemapPane = 'basemapPane';
  const referenceLayerPane = 'referenceLayerPane';
  const contextLayerPane = 'contextLayerPane';
  const referenceLayerCenterPane = 'referenceLayerCenterPane';

  /** Check tooltip zoom **/
  const checkTooltipZoom = (map) => {
    var zoom = map.getZoom();
    map.eachLayer(function (l) {
      if (l.getTooltip) {
        var toolTip = l.getTooltip();
        if (toolTip) {
          const className = toolTip.options.className.split(' ').map(cls => {
            if (cls) {
              return `.${cls}`
            } else {
              return ''
            }
          }).join('')
          if (className) {
            if (zoom >= toolTip.options.minZoom && zoom <= toolTip.options.maxZoom) {
              $(className).show()
            } else {
              $(className).hide()
            }
          }
        }
      }
    });
  }

  useEffect(() => {
    if (!map && basemapLayer) {
      const basemapLayerGroup = L.layerGroup([]);
      const referenceLayerGroup = L.layerGroup([]);
      const contextLayerGroup = L.layerGroup([]);
      setBasemapLayerGroup(basemapLayerGroup);
      setReferenceLayerGroup(referenceLayerGroup);
      setContextLayerGroup(contextLayerGroup);

      const newMap = L.map('map', {
        center: [0, 0],
        zoom: 2,
        layers: [basemapLayerGroup, contextLayerGroup, referenceLayerGroup],
        zoomControl: false,
        maxZoom: maxZoom
      });
      newMap.createPane(basemapPane);
      newMap.createPane(referenceLayerPane);
      newMap.createPane(contextLayerPane);
      newMap.createPane(referenceLayerCenterPane);
      setMap(newMap);

      // Save extent
      newMap.on("moveend", function () {
        const bounds = newMap.getBounds()
        const newExtent = [
          bounds._southWest.lng, bounds._southWest.lat,
          bounds._northEast.lng, bounds._northEast.lat
        ]
        dispatch(Actions.Map.updateExtent(newExtent))
      });

      newMap.on('zoomend', function () {
        checkTooltipZoom(newMap)
      })
    }
  }, [basemapLayer]);

  /** EXTENT CHANGED */
  useEffect(() => {
    if (map && extent) {
      map.fitBounds([
        [extent[1], extent[0]],
        [extent[3], extent[2]]
      ])

      // TODO:
      //  Nav control initiate before fit bounds done
      setTimeout(function () {
        if (!navControl) {
          setNavControl(
            L.control.navbar({
              position: 'topleft'
            }).addTo(map)
          )
        }
      }, 300);
    }
  }, [map, extent]);

  /** EXTENT CHANGED */
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [center]);

  /** BASEMAP CHANGED */
  useEffect(() => {
    if (basemapLayerGroup && basemapLayer) {
      basemapLayerGroup.eachLayer(function (layer) {
        basemapLayerGroup.removeLayer(layer);
      });
      basemapLayer.options.pane = basemapPane;
      basemapLayerGroup.addLayer(basemapLayer);
    }
  }, [basemapLayerGroup, basemapLayer]);

  /** CONTEXT LAYERS CHANGED */
  useEffect(() => {
    if (contextLayerGroup && contextLayers) {
      if (contextLayersShow) {
        const ids = []
        const idsKeep = []
        for (const [key, contextLayer] of Object.entries(contextLayers)) {
          if (contextLayer.layer) {
            ids.push(contextLayer.layer._leaflet_id);
          }
        }
        contextLayerGroup.eachLayer(function (layer) {
          if (!ids.includes(layer._leaflet_id)) {
            contextLayerGroup.removeLayer(layer);
          } else {
            idsKeep.push(layer._leaflet_id)
          }
        });
        for (const [key, contextLayer] of Object.entries(contextLayers)) {
          if (contextLayer.layer && !idsKeep.includes(contextLayer.layer._leaflet_id)) {
            const layer = contextLayer.layer;
            layer.options.pane = contextLayerPane;
            contextLayerGroup.addLayer(contextLayer.layer);
          }
        }
        checkTooltipZoom(map)
      } else {
        // remove all layer
        contextLayerGroup.eachLayer(function (layer) {
          contextLayerGroup.removeLayer(layer);
        });
      }
    }
  }, [contextLayerGroup, contextLayers, contextLayersShow]);

  /** REFERENCE LAYER CHANGED */
  useEffect(() => {
    if (referenceLayerGroup && referenceLayer) {
      referenceLayerGroup.eachLayer(function (layer) {
        referenceLayerGroup.removeLayer(layer);
      });
      referenceLayer.options.pane = referenceLayerPane;
      referenceLayerGroup.addLayer(referenceLayer);
    }
  }, [referenceLayerGroup, referenceLayer]);

  return <section className='dashboard__map'>
    <div id="map"></div>
    {
      !editMode ?
        <div className='leaflet-left leaflet-touch leaflet-custom-plugins'>
          <Plugin>

            <CustomPopover
              anchorOrigin={{
                vertical: 'center',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'center',
                horizontal: 'left',
              }}
              Button={
                <PluginChild title={'Bookmark'}>
                  <StarIcon/>
                </PluginChild>
              }>
              <Bookmark/>
            </CustomPopover>
          </Plugin>
        </div> : ""
    }
    {map ? <ReferenceLayerCentroid map={map} pane={referenceLayerCenterPane}/> : ""}
  </section>
}

