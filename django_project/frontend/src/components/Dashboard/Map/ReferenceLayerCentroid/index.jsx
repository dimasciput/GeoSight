/* ==========================================================================
   Geometry Center
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import L from "leaflet";
import Chart from 'chart.js/auto';
import { featurePopupContent } from "../../../../utils/main";

import './style.scss';

/**
 * GeometryCenter.
 */
export default function ReferenceLayerCentroid({ map, pane }) {
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

  const [layer, setLayer] = useState(null);
  const [charts, setCharts] = useState({});

  /** Create layer on load **/
  useEffect(() => {
    const layer = L.geoJson(null, {
      pointToLayer: function (feature, latlng) {
        const properties = feature.properties
        const code = properties.code
        const size = properties.style.size + 'px'
        var icon = L.divIcon({
          html: `<canvas id="${code}-chart" width="${properties.style.size}" height="${properties.style.size}" style="display: block; box-sizing: border-box; height: ${size}; width: ${size};"></canvas>`,
          className: 'LeafletPiechartIcon',
          iconSize: [
            parseFloat(properties.style.size), parseFloat(properties.style.size)
          ]
        });

        // Create charts
        const { labels, data, colors, options } = properties.chartData
        setTimeout(function () {
          const ctx = document.getElementById(`${code}-chart`).getContext('2d');
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
        }, 100);

        return L.marker(latlng, {
          icon: icon
        });
      },
      onEachFeature: function (feature, layer) {
        const properties = JSON.parse(JSON.stringify(feature.properties))
        const maxValue = properties.maxValue
        const cleanProperties = {}
        properties.data.map(data => {
          cleanProperties[data.name] = `
            <div class="PopupMultiDataTable">
              <div class="PopupMultiDataTableGraph" style="background-color: ${data.color}; width: ${(data.value / maxValue) * 100}%"></div>
              <div class="PopupMultiDataTableValue">${data.value}</div>
            </div>`
        })
        const name = properties['name']
        cleanProperties['code'] = properties['code']
        cleanProperties['label'] = properties['label']
        cleanProperties['type'] = properties['type']
        layer.bindPopup(
          featurePopupContent(name, cleanProperties, 'PopupMultiData')
        );
        layer.on('mouseover', function (e) {
          this.openPopup();
        });
        layer.on('mouseout', function (e) {
          this.closePopup();
        });
      }
    })
    layer.options.pane = pane
    layer.addTo(map)
    setLayer(layer)
  }, []);

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
    if (layer && geometries && filteredGeometries) {
      layer.clearLayers()

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
            filteredGeometries.map(geom => {
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
                      "coordinates": geometry.centroid.replace('POINT(', '').replace(')', '').split(' ').map(coord => parseFloat(coord))
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
          layer.addData({
            "type": "FeatureCollection",
            "features": features
          });
        }
      }
    }
  }, [
    geometries, filteredGeometries, indicatorsData,
    indicatorShow, indicatorLayers, selectedIndicatorLayer
  ]);

  return <div></div>
}
