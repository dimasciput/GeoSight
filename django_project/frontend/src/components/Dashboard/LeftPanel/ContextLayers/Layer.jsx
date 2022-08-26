/* ==========================================================================
   Return layer
   ========================================================================== */

import React from 'react';
import L from "leaflet";

import EsriLeafletLayer from "../../../../utils/esri/leaflet-esri-layer";
import { dictDeepCopy, featurePopupContent } from "../../../../utils/main";
import { Actions } from "../../../../store/dashboard";
import { fetchingData } from "../../../../Requests";

/** Raster tile layer **/
export function RasterTileLayer(
  layerData, layerFn, legendFn, errorFn, onEachFeature
) {
  if (layerData.url_legend) {
    legendFn(`<img src="${layerData.url_legend}"/>`)
  }
  layerData.parameters['maxNativeZoom'] = 19;
  layerData.parameters['maxZoom'] = maxZoom;
  layerFn(L.tileLayer.wms(layerData.url, layerData.parameters))
}

/** Arcgis layer **/
export function ArcgisLayer(
  layerData, layerFn, legendFn, errorFn, onEachFeature
) {
  const options = {
    token: layerData.token
  };
  const argisLayer = new EsriLeafletLayer(
    layerData.name, layerData.url,
    layerData.parameters, options,
    layerData.styles, onEachFeature
  );
  argisLayer.load().then(output => {
    if (output.layer) {
      layerFn(output.layer);
      const legend = argisLayer.getLegend();
      legendFn(legend);
    } else {
      errorFn(output.error);
    }
  });
  return argisLayer
}

/** Geojson layer **/
export function GeojsonLayer(
  layerData, layerFn, legendFn, errorFn, onEachFeature
) {
  fetchingData(
    layerData.url, layerData.params, {}, (data) => {
      const layer = L.geoJson(data, {
        style: function (feature) {
          switch (feature.geometry.type) {
            default:
              return {
                "color": "#ff7800",
                "weight": 1,
                "opacity": 1
              }
          }
        },
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
          var icon = L.icon({
            iconSize: [25, 30],
            iconAnchor: [10, 30],
            popupAnchor: [2, -31],
            iconUrl: feature.properties.icon
          });
          return L.marker(
            latlng, { icon: icon }
          );
        }
      });
      layerFn(layer);
    }
  )
}

/**
 * Initiate layer from the data.
 * @param {dict} layerData Data of layer.
 * @param {Function} setLayer Set the layer.
 * @param {Function} setLegend Set the legend.
 * @param {Function} setError Set the error.
 * @param dispatch Dispatcher.
 */
export const getLayer = function (
  layerData, setLayer,
  setLegend, setError, dispatch
) {
  const layerType = layerData.layer_type;

  // this is for each feature
  const onEachFeature = (feature, layer, fields) => {
    let properties = dictDeepCopy(feature.properties)
    if (layerData.data_fields.length) {
      fields = layerData.data_fields
    }
    if (fields) {
      properties = []
      const tooltip = []
      fields.map(field => {
        if (field.visible !== false) {
          properties[field.alias] = feature.properties[field.name]
          if (field.type === 'date') {
            try {
              properties[field.alias] = new Date(feature.properties[field.name]).toString()
            } catch (err) {

            }
          }
        }

        if (field.as_label) {
          tooltip.push(`<div>${feature.properties[field.name]}</div>`)
        }
      })

      if (tooltip.length) {
        const style = Object.assign({}, {
          minZoom: 0,
          maxZoom: 24,
          fontFamily: '"Rubik", sans-serif',
          fontSize: 14,
          fontColor: '#000000',
          fontWeight: 300,
          strokeColor: '#FFFFFF',
          strokeWeight: 0
        }, layerData.label_styles);

        const styles = [
          'font-size: ' + style.fontSize + 'px',
          'font-weight: ' + style.fontWeight,
          'font-family: ' + style.fontFamily + '!important',
          '-webkit-text-fill-color: ' + style.fontColor,
          '-webkit-text-stroke-color: ' + style.strokeColor,
          '-webkit-text-stroke-width: ' + style.strokeWeight + 'px',
        ]
        console.log(style)
        if (style.haloWeight) {
          styles.push(`text-shadow : 0px 0px ${style.haloWeight}px ${style.haloColor}, 0px 0px ${style.haloWeight}px ${style.haloColor}`)
        }
        console.log(styles)
        layer.bindTooltip(
          `<div style='${styles.join(';')}'>
            ${tooltip.join('')}
            </div>`,
          {
            permanent: true,
            className: `Leaflet-Label ${layerData.id}`,
            direction: "top",
            offset: [0, 0],
            minZoom: style.minZoom,
            maxZoom: style.maxZoom
          }
        );
      }
    }

    layer.bindPopup(
      featurePopupContent(layerData.name, properties)
    );

    if (dispatch) {
      layer.on('click', function (event) {
        dispatch(
          Actions.Map.updateCenter(event.latlng)
        )
      }, this);
    }
  }

  switch (layerType) {
    case 'Raster Tile': {
      return RasterTileLayer(
        layerData,
        (layer) => setLayer(layer),
        (legend) => setLegend(legend),
        (error) => setError(error),
        onEachFeature
      )
    }
    case 'ARCGIS': {
      const ArcGisData = ArcgisLayer(
        layerData,
        (layer) => setLayer(layer),
        (legend) => setLegend(legend),
        (error) => setError(error),
        (feature, layer) => {
          return onEachFeature(feature, layer, ArcGisData?.data?.fields)
        }
      )
      return ArcGisData
    }
    case 'Geojson': {
      return GeojsonLayer(
        layerData,
        (layer) => setLayer(layer),
        (legend) => setLegend(legend),
        (error) => setError(error),
        onEachFeature
      )
    }
  }
}