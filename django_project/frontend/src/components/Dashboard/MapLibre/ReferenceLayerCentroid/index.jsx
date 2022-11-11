/* ==========================================================================
   Geometry Center
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import maplibregl from "maplibre-gl";
import Chart from 'chart.js/auto';
import { returnWhere } from "../../../../utils/queryExtraction";
import { featurePopupContent } from "../../../../utils/main";
import { addPopupEl } from "../utils";

import './style.scss';

let centroidMarker = []

/**
 * GeometryCenter.
 */
export default function ReferenceLayerCentroid({ map }) {
  const {
    indicators,
    indicatorLayers
  } = useSelector(state => state.dashboard.data)
  const { indicatorShow } = useSelector(state => state.map)
  const geometries = useSelector(state => state.geometries)
  const filteredGeometries = useSelector(state => state.filteredGeometries)
  const indicatorsData = useSelector(state => state.indicatorsData);
  const selectedIndicatorLayer = useSelector(state => state.selectedIndicatorLayer)
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel)
  const filtersData = useSelector(state => state.filtersData);

  const [charts, setCharts] = useState({});
  const where = returnWhere(filtersData ? filtersData : [])

  /** Create layer on load **/
  const renderCentroid = (features) => {
    features.map(feature => {
      const properties = feature.properties
      const code = properties.code
      const size = properties.style.size;
      var el = document.createElement('div');
      const popup = new maplibregl.Popup({
        closeOnClick: false,
        closeButton: false
      }).setHTML(`<canvas id="${code}-chart" width="${size}" height="${size}" style="display: block; box-sizing: border-box; height: ${size}px; width: ${size}px;"></canvas>`)
      popup.addClassName('ChartPopup')
      const marker = new maplibregl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .setPopup(popup)
        .addTo(map)
        .togglePopup();
      centroidMarker.push(marker)

      // Create charts
      const { labels, data, colors, options } = properties.chartData
      setTimeout(function () {
        const el = document.getElementById(`${code}-chart`)
        const ctx = el.getContext('2d');
        if (charts[code]) {
          charts[code].clear();
        }
        const chart = new Chart(ctx, {
          type: properties.style.chartType ? properties.style.chartType.toLowerCase() : 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colors,
              borderWidth: 1,
              barPercentage: 1.0,
              categoryPercentage: 1.0
            }]
          },
          options: options
        });
        charts[code] = chart
        setCharts({ ...charts })

        // Popup for marker
        addPopupEl(map, el, feature.geometry.coordinates, properties, properties => {
            const markerProperties = JSON.parse(JSON.stringify(properties))
            const maxValue = properties.maxValue
            const cleanProperties = {}
            markerProperties.data.map(data => {
              cleanProperties[data.name] = `
            <div class="PopupMultiDataTable">
              <div class="PopupMultiDataTableGraph" style="background-color: ${data.color}; width: ${(data.value / maxValue) * 100}%"></div>
              <div class="PopupMultiDataTableValue">${data.value}</div>
            </div>`
            })
            const name = markerProperties['name']
            cleanProperties['code'] = markerProperties['code']
            cleanProperties['label'] = markerProperties['label']
            cleanProperties['type'] = markerProperties['type']
            return featurePopupContent(name, cleanProperties, 'PopupMultiData')
          },
          {
            'bottom': [0, -1 * size],
          }
        )
      })
    })
  }

  /** Chart data generator **/
  const chartData = (indicators, style) => {
    const labels = []
    const data = []
    const colors = []
    indicators.map(indicator => {
      labels.push(indicator.name)
      data.push(indicator.value)
      colors.push(indicator.color)
    })
    const options = {
      plugins: {
        legend: {
          display: false,
        },
      },
      tooltips: { enabled: false },
      hover: { mode: null },
      events: [],
      scales: {
        x: {
          display: false,
          grid: {
            drawTicks: false,
          }
        },
        y: {
          display: false,
          grid: {
            drawTicks: false,
          }
        }
      }
    };
    return {
      labels: labels,
      data: data,
      colors: colors,
      options: options
    }
  }

  // When level changed
  useEffect(() => {
    if (geometries && filteredGeometries) {
      centroidMarker.map(marker => marker.remove())
      centroidMarker = []

      // When indicator show
      if (indicatorShow) {
        // Create data
        if (selectedIndicatorLayer?.indicators?.length >= 2) {
          const indicatorsByGeom = {}
          selectedIndicatorLayer.indicators.map(indicatorLayer => {
            const indicator = indicators.find(indicator => indicatorLayer.id === indicator.id)
            if (indicator && indicatorsData[indicator.id] && indicatorsData[indicator.id].fetched) {
              if (indicatorsData[indicator.id].data) {
                indicatorsData[indicator.id].data.forEach(function (data) {
                  if (!indicatorsByGeom[data.geometry_code]) {
                    indicatorsByGeom[data.geometry_code] = []
                  }
                  indicatorsByGeom[data.geometry_code].push(Object.assign({}, data, {
                    color: indicatorLayer.color,
                    name: indicatorLayer.name
                  }));
                })
              }
            }
          })

          // Creating features for center data
          let maxValue = 0
          const features = []
          const geometriesData = geometries[selectedAdminLevel.level]
          if (geometriesData) {
            let theGeometries = Object.keys(geometriesData)
            if (where) {
              theGeometries = filteredGeometries
            }
            theGeometries.map(geom => {
              const geometry = geometriesData[geom]
              if (geometry && indicatorsByGeom[geometry.code]) {
                const properties = Object.assign({}, geometry, {
                  style: JSON.parse(JSON.stringify(selectedIndicatorLayer.style)),
                  name: selectedIndicatorLayer.name
                })
                properties['data'] = indicatorsByGeom[geometry.code]
                properties['chartData'] = chartData(indicatorsByGeom[geometry.code])

                let total = 0
                let maxFeatureValue = 0
                indicatorsByGeom[geometry.code].map(data => {
                  total += data.value
                  if (data.value > maxFeatureValue) {
                    maxFeatureValue = data.value
                  }
                })

                // We save the max value
                if (total > maxValue) {
                  maxValue = total
                }
                properties['total'] = total
                properties['maxValue'] = maxFeatureValue
                if (geometry.centroid) {
                  features.push({
                    "type": "Feature",
                    "properties": properties,
                    "geometry": {
                      "type": "Point",
                      "coordinates": geometry.centroid.replace('POINT (', '').replace(')', '').split(' ').map(coord => parseFloat(coord))
                    }
                  })
                }
              }
            })
            switch (selectedIndicatorLayer.style.sizeType) {
              case "Fixed size":
                break
              default:
                // TODO:
                //  We need to split the data between
                const minSize = selectedIndicatorLayer.style.minSize
                const maxSize = selectedIndicatorLayer.style.maxSize
                const diffSize = maxSize - minSize
                features.map(feature => {
                  const properties = feature.properties
                  const percentageSize = properties.total / maxValue
                  properties.style.size = (percentageSize * diffSize) + minSize
                })
            }
          }
          renderCentroid(features)
        }
      }
    }
  }, [
    geometries, filteredGeometries, indicatorsData,
    indicatorShow, indicatorLayers, selectedIndicatorLayer
  ]);

  return <div></div>
}