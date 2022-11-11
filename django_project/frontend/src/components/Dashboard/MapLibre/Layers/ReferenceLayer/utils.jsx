/**
 * Return value by geometry
 */
export function returnValueByGeometry(layer, indicators, indicatorsData) {
  const byGeometry = {}
  if (Object.keys(layer).length) {
    layer.indicators.map(indicatorLayer => {
      const indicator = indicators.find(indicator => indicatorLayer.id === indicator.id)
      if (indicatorsData[indicator.id] && indicatorsData[indicator.id].fetched) {
        if (indicatorsData[indicator.id].data) {
          indicatorsData[indicator.id].data.forEach(function (data) {
            if (!byGeometry[data.geometry_code]) {
              byGeometry[data.geometry_code] = []
            }
            byGeometry[data.geometry_code].push(data);
          })
        }
      }
    })
  }
  return byGeometry
}

/**
 * Return no data style
 */
export function returnNoDataStyle(layer) {
  let noDataRule = null
  if (layer?.rules) {
    noDataRule = layer.rules.filter(
      rule => rule.active
    ).find(rule => rule.rule.toLowerCase() === 'no data')
  }
  return noDataRule
}

/**
 * Return style
 */
export function returnStyle(layer, values, noDataStyle) {
  let style = null
  if (layer?.indicators?.length === 1) {
    if (values) {
      const indicatorData = values[0];
      if (indicatorData) {
        style = indicatorData.style
      } else {
        style = noDataStyle;
      }
    } else {
      style = noDataStyle;
    }
  }
  return style
}
