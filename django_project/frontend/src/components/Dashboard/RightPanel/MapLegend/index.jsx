/* ==========================================================================
   BASEMAPS SELECTOR
   ========================================================================== */

import React from 'react';
import './style.scss'
import { useSelector } from "react-redux";

/** Map Legend.
 */
export default function MapLegend() {
  const { compareMode } = useSelector(state => state.mapMode)
  const { indicators } = useSelector(state => state.dashboard.data)
  const selectedIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);
  const selectedIndicatorSecondLayer = useSelector(state => state.selectedIndicatorSecondLayer);

  /**
   * Get rules of data.
   * @param {dict} layer Layer that will be checked
   * @returns {Array}
   */
  const rulesLayer = (layer) => {
    // Get rules
    let rules = null
    if (layer.id) {
      rules = layer.rules
      // Use layer rules
      // If not, use first indicator rules
      if (!rules || !rules.length) {
        const indicator = indicators.find(
          data => layer?.indicators[0]?.id === data.id
        )
        if (indicator) {
          rules = indicator.rules
        }
      }
    }
    return rules
  }
  /**
   * Render indicator legend
   * @param {dict} layer Layer that will be checked
   * @param {str} name Name of layer
   */
  const RenderIndicatorLegend = ({ layer, name }) => {
    const rules = rulesLayer(layer)
    return (
      <div className='MapLegendSection'>
        <div className='MapLegendSectionTitle'>{name}</div>
        {
          rules && rules.length ?
            <div className='IndicatorLegendSection'>
              {
                rules.map(rule => {
                  const border = `1px solid ${rule.outline_color === '#FFFFFF' ? '#DDDDDD' : rule.outline_color}`
                  return <div
                    key={rule.name}
                    className='IndicatorLegendRow'
                    style={{ backgroundColor: rule.color, border: border }}>
                    {rule.name}
                  </div>
                })
              }
            </div> : ""
        }
      </div>
    )
  }

  return <div className='MapLegend'>
    {
      selectedIndicatorLayer.id ?
        <RenderIndicatorLegend
          layer={selectedIndicatorLayer}
          name={
            selectedIndicatorLayer.name + (compareMode ? " (Outline)" : "")
          }
        />
        : ""
    }
    {
      selectedIndicatorSecondLayer.id ?
        <RenderIndicatorLegend
          layer={selectedIndicatorSecondLayer}
          name={selectedIndicatorSecondLayer.name + " (Inner)"}
        />
        : ""
    }
  </div>
}
