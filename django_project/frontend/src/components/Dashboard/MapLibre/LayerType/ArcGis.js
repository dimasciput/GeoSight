import FeatureService from 'mapbox-gl-arcgis-featureserver'
import parseArcRESTStyle from "../../../../utils/esri/esri-style";
import { addPopup, hasLayer, loadImageToMap } from "../utils";

const BEFORE_LAYER = 'gl-draw-polygon-fill-inactive.cold'

/*** Arcgis style */
function ArcGisStyle(map, id, layer) {
  const casesByType = {}
  const fillId = id + '-fill'
  const outlineId = id + '-outline'
  const symbolId = id + '-symbol'
  const circleId = id + '-circle'

  const { data, defaultStyle } = layer
  const style = defaultStyle ? defaultStyle : parseArcRESTStyle(data);
  if (!style) {
    return null
  }

  /**
   * Assign Cases
   */
  const assignCases = (styleType, propertyType, cases) => {
    let layerId = null
    switch (styleType) {
      case 'polygon':
        layerId = fillId
        break
      case 'circle':
        layerId = circleId
        break
      case 'icon': {
        layerId = symbolId
        break
      }
    }
    if (layerId) {
      casesByType[layerId] = casesByType[layerId] ? casesByType[layerId] : {}
      casesByType[layerId][propertyType] = casesByType[layerId][propertyType] ? casesByType[layerId][propertyType] : []
      casesByType[layerId][propertyType] = casesByType[layerId][propertyType].concat(cases)
    }
  }

  switch (style.classificationValueMethod) {
    case "noClassification":
      // No classification
    {
      const classStyle = style.style.style
      for (const [key, value] of Object.entries(classStyle)) {
        if (value) {
          const cases = [value]
          assignCases(style.style.type, key, cases)
        }
      }
      break
    }
    case "classExactValue":
      // For class exact value
      style.classifications.map((classification, idx) => {
        const classStyle = classification.style.style
        for (const [key, value] of Object.entries(classStyle)) {
          if (value) {
            const cases = []
            let classValue = classification.value
            cases.push(
              ["==", ["get", style.fieldName], classValue]
            )
            cases.push(value)
            if (!isNaN(classValue)) {
              classValue = parseFloat(classValue)
              cases.push(
                ["==", ["get", style.fieldName], classValue]
              )
              cases.push(value)
            }
            assignCases(classification.style.type, key, cases)
          }
        }
      })
      break
    case "classMaxValue": {
      // For max value type
      style.classifications.map((classification, idx) => {
        const classStyle = classification.style.style
        for (const [key, value] of Object.entries(classStyle)) {
          if (value) {
            const cases = []
            let styleValue = value
            if (!isNaN(styleValue)) {
              styleValue = parseFloat(styleValue)
            }
            cases.push(
              ["<=", ["get", style.fieldName], classification.classMaxValue]
            )
            cases.push(styleValue)
            assignCases(classification.style.type, key, cases)
          }
        }
      })
      break;
    }
  }

  // Let's repaint
  for (const [layerId, values] of Object.entries(casesByType)) {
    for (const [property, cases] of Object.entries(values)) {
      let paintProperty = null
      let defaultValue = 0

      // Check based on layer id and property
      switch (property) {
        case 'iconUrl':
          switch (layerId) {
            case symbolId: {
              paintProperty = 'icon-image'
              break
            }
          }
          defaultValue = ''
          break;
        case 'color':
          switch (layerId) {
            case circleId: {
              paintProperty = 'circle-stroke-color'
              break
            }
            case fillId: {
              paintProperty = 'fill-outline-color'
              break
            }
          }
          defaultValue = `rgba(0, 0, 0, 0)`
          break;
        case 'fillOpacity':
          switch (layerId) {
            case circleId: {
              paintProperty = 'circle-opacity'
              break
            }
            case fillId: {
              paintProperty = 'fill-opacity'
              break
            }
          }
          defaultValue = 0
          break;
        case 'fillColor':
          switch (layerId) {
            case circleId: {
              paintProperty = 'circle-color'
              break
            }
            case fillId: {
              paintProperty = 'fill-color'
              break
            }
          }
          defaultValue = `rgba(255, 255, 255, 0)`
          break;
        case 'radius':
          switch (layerId) {
            case circleId: {
              paintProperty = 'circle-radius'
              break
            }
          }
          defaultValue = 1
          break;
      }

      // Check if paint property found
      if (paintProperty) {
        switch (paintProperty) {
          case 'icon-image': {
            // This is for images
            let paint = defaultValue
            if (cases.length === 1) {
              paint = cases[0]
              loadImageToMap(map, paint, (error, image) => {
                if (!error) {
                  const iconSize = values.iconSize
                  map.setLayoutProperty(layerId, 'icon-image', paint);
                  if (iconSize && iconSize[0]) {
                    const scale = iconSize[0][0] / image.width
                    map.setLayoutProperty(layerId, 'icon-size', scale);
                  }
                }
              })
            } else if (cases.length) {
              paint = ["case"].concat(cases).concat(defaultValue)
              const sizeCases = []
              const finish = () => {
                map.setLayoutProperty(layerId, 'icon-image', paint);
                const sizePaint = ["case"].concat(sizeCases).concat(0)
                map.setLayoutProperty(layerId, 'icon-size', sizePaint)
              }

              const next = (idx) => {
                if (idx <= cases.length) {
                  loadImagesFromCases(idx + 1)
                } else {
                  // Finish
                  finish()
                }
              }
              const loadImagesFromCases = (idx) => {
                if (idx % 2 === 1) {
                  const icon = cases[idx]
                  if (icon) {
                    loadImageToMap(map, icon, (error, image) => {
                      if (!error) {
                        const iconSize = values?.iconSize[idx]
                        if (iconSize && iconSize[0]) {
                          if (cases[idx - 1]) {
                            const scale = iconSize[0] / image.width
                            sizeCases.push(cases[idx - 1])
                            sizeCases.push(scale)
                          }
                        }
                      }
                      next(idx)
                    })
                  } else {
                    next(idx)
                  }
                } else {
                  next(idx)
                }
              }
              loadImagesFromCases(0)
            }
            break
          }
          default: {
            let paint = defaultValue
            if (cases.length === 1) {
              paint = cases[0]
            } else if (cases.length) {
              paint = ["case"].concat(cases).concat(defaultValue)
            }
            console.log(layerId)
            console.log(paintProperty)
            console.log(paint)
            map.setPaintProperty(layerId, paintProperty, paint);
            if (paintProperty === 'circle-stroke-color') {
              map.setPaintProperty(layerId, 'circle-stroke-width', 1);
            }
          }
        }
      }
    }
  }
  return null;
}

/***
 * Render geojson layer
 */
export default function arcGisLayer(map, id, data, popupFeatureFn) {
  // Create the source
  if (typeof map.getSource(id) === 'undefined') {
    const params = Object.assign({}, data.params, {
      url: data.url,
      token: data.token,
      minZoom: 0
    })
    new FeatureService(id, map, params)
  }
  const fillId = id + '-fill'
  const outlineId = id + '-outline'
  const symbolId = id + '-symbol'
  const circleId = id + '-circle'

// And then add it as a layer to your map
  if (!hasLayer(map, fillId)) {
    map.addLayer({
      id: fillId,
      type: 'fill',
      source: id,
      filter: ['==', '$type', 'Polygon']
    })
    map.addLayer({
      id: outlineId,
      type: 'line',
      source: id,
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'line-opacity': 0
      }
    })
    map.addLayer({
      id: circleId,
      type: 'circle',
      source: id,
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-color': `rgba(0, 0, 0, 0)`
      }
    })
    map.addLayer({
      id: symbolId,
      type: 'symbol',
      source: id,
      filter: ['==', '$type', 'Point']
    })
    const popupFeature = (properties) => {
      return popupFeatureFn(properties, data?.data?.fields)
    }
    addPopup(map, fillId, popupFeature)
    addPopup(map, outlineId, popupFeature)
    addPopup(map, circleId, popupFeature)
    addPopup(map, symbolId, popupFeature)
  }
  ArcGisStyle(map, id, data)
}