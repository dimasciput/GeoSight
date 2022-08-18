/* ==========================================================================
   Context Layers SELECTOR
   ========================================================================== */

import React from 'react';
import L from 'leaflet';
import { featureLayer } from 'esri-leaflet';
import parseArcRESTStyle from './leaflet-esri-style'
import { fetchJSON } from '../../Requests'
import { hexToRGB, jsonToUrlParams } from '../../utils/main'

export default class EsriLeafletLayer {
  constructor(name, url, params, options, style, onEachFeature) {
    const urls = url.split('?')
    if (urls[1]) {
      let updatedParams = urls[1].split('&')
      updatedParams.map(param => {
        const split = param.split('=')
        const value = split.splice(1);
        params[split[0]] = value.join('=')
      })
    }

    this.name = name;
    this.url = urls[0];
    this.data = null;
    this.params = params;

    // for the options
    if (!options) {
      options = {}
    }
    this.token = options.token;
    this.username = options.username;
    this.password = options.password;
    this.layer = null;
    this.defaultStyle = style;
    this.onEachFeature = onEachFeature;
  }

  preFetch(url) {
    /**
     * Prepare fetch request headers.
     * Either a key/token or user/pass.
     *
     * TODO currently only tested for ArcREST token. Basic auth for WFS needs work.
     * @param  {string} url URL that will be requested
     * @return {array}     str url and fetch options (including GET method and headers)
     */
    let options = { method: 'GET', mode: "cors" }
    if (this.token) {
      url += `&token=${this.token}`
    } else if (this.username && this.password) {
      options['headers'] = new Headers({
        'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`)
      })
    }
    return [url, options]
  }


  async load() {
    /**
     * Fetch the drawing info from the service before we can load features
     * ESRI Alpha is scaled up tp 255 - use maxTrans ceiling
     * Return Leaflet layer
     */
    const that = this;
    const urls = this.url.split('?')
    const params = JSON.parse(JSON.stringify(this.params))
    params['f'] = 'json'
    const url = urls[0] + '?' + jsonToUrlParams(params)
    return fetchJSON(...this.preFetch(url))
      .then(data => {
        if (data.error) {
          return {
            layer: null,
            error: data.error.message ? data.error.message : data.error.details ? data.error.details : data.error
          }
        }
        if (data.drawingInfo === undefined) {
          if (data.type === "Raster Layer" || (data.layers && data.layers[0] && data.layers[0].type === "Raster Layer")) {
            return {
              layer: null,
              error: 'Drawing info is empty'
            }
          }
        }
        this.data = data;
        return {
          layer: that.toLeafletLayer(data),
          error: null
        }
      })
      .catch(error => {
        return {
          layer: null,
          error: error.details ? error.details : error
        }
      })
  }

  overrideStyle(style) {
    if (this.defaultStyle) {
      return this.defaultStyle
    } else {
      return style
    }
  }

  /**
   * get leaflet layer
   */
  toLeafletLayer(data) {
    this.style = parseArcRESTStyle(data);
    const self = this;
    const style = this.overrideStyle(this.style);
    const params = this.params ? JSON.parse(JSON.stringify(this.params)) : {};
    params.url = this.url;
    if (this.token) {
      params.token = this.token;
    }
    switch (style.geometryType) {
      // This is for polygon
      case "esriGeometryPolygon":
      case "esriGeometryPolyline": {
        params.style = function (geojson) {
          const value = geojson['properties'][style.fieldName];
          let leafletStyle = null;
          switch (style.classificationValueMethod) {
            case "classMaxValue":
              style.classifications.forEach(function (index, classification) {
                if (value <= classification.classMaxValue) {
                  leafletStyle = classification.style;
                  return false;
                }
              });
              if (!leafletStyle) {
                leafletStyle = style.classifications[style.classifications.length - 1].style;
              }
              break
            case "classExactValue":
              const classification = style.classifications.find(
                classification => ("" + value) === ("" + classification.value)
              );
              if (classification) {
                leafletStyle = classification.style;
              }
              break
            case "noClassification":
              leafletStyle = style.style;
              break
          }

          if (leafletStyle) {
            if (!leafletStyle.style.color) {
              leafletStyle.style.color = '#000000'
              leafletStyle.style.weight = 1
            }
            return leafletStyle.style;
          }
        }

        params['onEachFeature'] = self.onEachFeature;
        return featureLayer(params);
      }

      // This is for point
      case 'esriGeometryPoint': {
        params.pointToLayer = function (geojson, latlng) {
          const value = geojson['properties'][style.fieldName];
          let leafletStyle = null;

          switch (style.classificationValueMethod) {
            case "classMaxValue":
              style.classifications.forEach(function (classification, index) {
                if (value <= classification.classMaxValue) {
                  leafletStyle = classification.style;
                  return false;
                }
              });
              if (!leafletStyle) {
                leafletStyle = style.classifications[style.classifications.length - 1].style;
              }
              break
            case "classExactValue":
              style.classifications.forEach(function (classification, index) {
                if ('' + value === '' + classification.value) {
                  leafletStyle = classification.style;
                  return false;
                }
              });
              break
            case "noClassification":
              leafletStyle = style.style;
              break
          }

          if (leafletStyle) {
            switch (leafletStyle.type) {
              case 'circle':
                return L.circleMarker(
                  latlng, leafletStyle.style
                );
              case 'square': {
                const radius = leafletStyle.style.radius * 2;
                const color = leafletStyle.style.color
                const fillColor = leafletStyle.style.fillColor
                const weight = leafletStyle.style.weight
                var icon = L.divIcon({
                  html: `<div style="background-color: ${fillColor}; border: ${weight}px solid ${color}"></div>`,
                  className: 'LeafletSquareIcon',
                  iconSize: [radius, radius]
                });
                return L.marker(latlng, {
                  icon: icon
                });
              }
              case 'icon': {
                const icon = L.icon(leafletStyle.style);
                return L.marker(
                  latlng, {
                    icon: icon
                  }
                );
              }

            }
          }
        };

        params['onEachFeature'] = self.onEachFeature;
        return featureLayer(params);
      }
    }
    return null;
  };

  /**
   * Add Legend
   */

  getLegend() {
    const style = this.overrideStyle(this.style);
    if (!style) {
      return null
    }
    const that = this;
    let legend = '';

    /** CIRCLE LEGEND **/
    const circle = (styleData, label) => {
      const size = parseInt(styleData.radius) + 4;
      const fillColor = hexToRGB(styleData.fillColor, styleData.fillOpacity);
      const outlineColor = styleData.color;
      const weight = styleData.weight;
      return '<tr>' +
        `<td><div class="circle" style="width: ${size}px; height: ${size}px; background-color: ${fillColor};border: ${weight ? weight : 1}px solid ${outlineColor}"></div></td>` +
        `<td>${label ? label : ""}</td>` +
        '</tr>'
    }

    /** SQUARE LEGEND **/
    const square = (styleData, label) => {
      const size = styleData.radius ? parseInt(styleData.radius) + 4 : 10;
      const fillColor = hexToRGB(styleData.fillColor, styleData.fillOpacity);
      const outlineColor = styleData.color;
      const weight = styleData.weight;
      return '<tr>' +
        `<td><div class="square" style="width: ${size}px; height: ${size}px; background-color: ${fillColor};border: ${weight ? weight : 1}px solid ${outlineColor}"></div></td>` +
        `<td>${label ? label : ""}</td>` +
        '</tr>'
    }

    /** ICON LEGEND **/
    const icon = (styleData, label) => {
      const url = styleData.iconUrl
      const size = styleData.iconSize ? styleData.iconSize : [0, 0]

      return '<tr>' +
        `<td><img src="${url}" width="${size[0]}" height="${size[1]}"></td>` +
        `<td>${label ? label : ""}</td>` +
        '</tr>'
    }

    switch (style.geometryType) {
      // This is for polygon
      case "esriGeometryPolygon": {
        if (style.classifications) {
          style.classifications.forEach(function (classification, index) {
            legend += square(classification.style.style, classification.label)
          });
        } else {
          legend += square(style.style.style, that.name)
        }
        break;
      }
      // This is for line
      case "esriGeometryPolyline": {
        if (style.classifications) {
          style.classifications.forEach(function (classification, index) {
            const color = classification.style.style.color;
            const width = classification.style.style.width * 2;
            legend += '' +
              '<tr>' +
              `<td><div class="line" style="height: ${width}px; background-color: ${color}"></div></td>` +
              `<td>${classification.label}</td>` +
              '</tr>'
          });
        }
        break;
      }
      // This is for point
      case 'esriGeometryPoint': {
        if (style.classifications) {
          style.classifications.forEach(function (classification, index) {
            switch (classification.style.type) {
              case 'circle': {
                legend += circle(classification.style.style, classification.label)
                break
              }
              case 'square': {
                legend += square(classification.style.style, classification.label)
                break
              }
              case 'icon':
                legend += icon(classification.style.style, classification.label)
                break
            }
          });
        } else {
          switch (style.style.type) {
            case 'circle': {
              legend += circle(style.style.style, that.name)
              break
            }
            case 'square': {
              legend += square(style.style.style, that.name)
              break
            }
            case 'icon':
              legend += icon(style.style.style, that.name)
              break
          }
        }
        break;
      }
    }

    return `<table>${legend}</table>`;
  }
}