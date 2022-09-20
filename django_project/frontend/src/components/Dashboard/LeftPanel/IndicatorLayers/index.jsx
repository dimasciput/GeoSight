/* ==========================================================================
   INDICATOR LAYER
   ========================================================================== */

import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Radio } from "@mui/material";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from '@mui/material/AccordionDetails';
import Accordion from "@mui/material/Accordion";
import InfoIcon from '@mui/icons-material/Info';

import { Actions } from '../../../../store/dashboard'
import { layerInGroup } from "../../../../utils/layers";
import OnOffSwitcher from "../../../Switcher/OnOff";
import CustomPopover from "../../../CustomPopover";


/**
 * Indicator selector.
 * @param {bool} checked Is indicator checked.
 * @param {dict} layer Layer dictionary.
 * @param {Array} rules Array of rules.
 * @param {function} onChange Function when on changed
 * @param {Array} errors Error list indicator.
 * @param {bool} loaded If data is loaded.
 */
export function IndicatorLayer(
  { checked, layer, rules, onChange, errors, loaded }
) {
  const [showLegend, setShowLegend] = useState(checked);
  const showLegendHandler = (show) => {
    setShowLegend(show);
  };

  return (
    <table className='dashboard__left_side__row'
           key={layer.id}>
      <tbody>
      <tr className='dashboard__left_side__row__title' onClick={() => {
        if (!errors.length) {
          if (!checked) {
            onChange(!checked, layer.id)
          }
        }
      }}>
        <td valign="top">
          <div className='RadioButtonSection'>
            <Radio
              checked={checked}
              disabled={errors.length === 0 ? false : true}
              onChange={() => {

              }}/>
          </div>
        </td>
        <td valign="top">
          <div className='text title'>
            <div>{layer.name}</div>
          </div>
        </td>
        {/* If not error */}
        {
          !errors.length ?
            <td className='InfoIcon' valign="top">
              <div className='InfoIcon'>
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
                    <InfoIcon/>
                  }
                  showOnHover={true}
                >
                  <div className='LayerInfoPopover'>
                    <div className='title'>
                      <b className='light'>{layer.name}
                      </b>
                    </div>
                    <div>
                      <b className='light'>Last Update: </b>{layer.last_update}
                    </div>
                    <div>
                      <b className='light'>Description: </b>
                      {
                        layer.description ? layer.description : '-'
                      }
                    </div>
                  </div>
                </CustomPopover>
              </div>
            </td> :
            <td className='InfoIcon Error' valign="top">
              <div className='InfoIcon'>
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
                    <InfoIcon/>
                  }
                  showOnHover={true}
                >
                  <div className='LayerInfoPopover'>
                    {
                      errors.join('<br>')
                    }
                  </div>
                </CustomPopover>
              </div>
            </td>
        }
        <td valign="top">
          {
            checked ? (
              <Fragment>
                {
                  showLegend ?
                    <div className='toggler' onClick={(e) => {
                      e.stopPropagation()
                      showLegendHandler(false)
                    }}>
                      <div>▴</div>
                    </div> :
                    <div className='toggler' onClick={(e) => {
                      e.stopPropagation()
                      showLegendHandler(true)
                    }}>
                      <div>▾</div>
                    </div>
                }
              </Fragment>
            ) : ''
          }
        </td>
      </tr>
      <tr className={showLegend ? 'legend showLegend' : 'legend'} valign="top">
        <td></td>
        <td>
          {
            rules ?
              <div>
                <table>
                  <tbody>
                  {
                    rules.filter(rule => rule.active).map(rule => (
                        <tr key={rule.id} className='IndicatorLegendRow'>
                          <td>
                            <div className='IndicatorLegendRow-Color'
                                 style={{ backgroundColor: rule.color }}></div>
                          </td>
                          <td>{rule.name}</td>
                        </tr>
                      )
                    )
                  }
                  </tbody>
                </table>
              </div> : ""
          }
        </td>
        <td></td>
      </tr>
      </tbody>
    </table>
  )
}

/**
 * Indicators selector.
 */
export function IndicatorLayers() {
  const dispatch = useDispatch();
  const indicatorsData = useSelector(state => state.indicatorsData);
  const {
    indicatorLayers,
    indicators
  } = useSelector(state => state.dashboard.data);
  const [currentIndicatorLayer, setCurrentIndicatorLayer] = useState(0);

  const change = (checked, id) => {
    if (checked) {
      setCurrentIndicatorLayer(id);
    } else {
      setCurrentIndicatorLayer(null);
    }
  };

  /**
   * Fetch indicator data
   */
  useEffect(() => {
    const indicator = indicatorLayers.filter(indicator => {
      return indicator.id === currentIndicatorLayer
    })[0]
    if (indicator) {
      const indicatorData = JSON.parse(JSON.stringify(indicator))
      dispatch(Actions.SelectedIndicatorLayer.change(indicatorData))
    }
  }, [currentIndicatorLayer, indicatorsData]);

  /**
   * Fetch indicator data
   */
  useEffect(() => {
    if (indicatorLayers) {
      indicatorLayers.map(layer => {
        layer.indicators.map(indicatorData => {
          const indicator = indicators.find(row => row.id === indicatorData.id)
          const { id } = indicator
          if (!indicatorsData[id]?.data) {
            dispatch(
              Actions.IndicatorsData.fetch(
                dispatch, id, indicator.url, indicator.reporting_level
              )
            );
          }
        })
      })

      // Change current indicator if indicators changed
      const indicatorsEnabled = indicatorLayers.find(indicator => {
        return indicator.visible_by_default
      })

      if (indicatorsEnabled) {
        setCurrentIndicatorLayer(indicatorsEnabled.id)
      }
    }
  }, [indicatorLayers]);

  // Get selected indicator data
  let selectedIndicatorLayer = null;
  if (indicatorLayers) {
    selectedIndicatorLayer = indicatorLayers.filter(indicatorLayer => {
      return indicatorLayer.id === currentIndicatorLayer
    })[0]
  }

  /**
   * Context Layer Row.
   * @param {str} groupNumber Group number.
   * @param {str} groupName Group name.
   * @param {dict} group Group data.
   */
  const LayerRow = ({ groupName, group }) => {
    return <div className={'LayerGroup ' + (groupName ? '' : 'Empty')}>
      <div className='LayerGroupName'><b
        className='light'>{groupName}</b></div>
      <div className='LayerGroupList'>
        {
          group.map(layer => {
              let rules = layer.rules
              let errors = []
              let loading = false
              if (layer.indicators.length === 1) {
                const indicator = indicators.find(
                  data => layer.indicators[0]?.id === data.id)
                if (indicator) {
                  rules = indicator.rules
                }
                layer.indicators.map(indicator => {
                  if (!indicatorsData[indicator.id]?.fetched) {
                    loading = true
                  }
                  const errorData = indicatorsData[indicator.id]?.error
                  if (errorData) {
                    errors.push(errorData.data.detail)
                  }
                })
              }
              return <IndicatorLayer
                key={layer.id}
                layer={layer}
                rules={rules}
                onChange={change}
                checked={currentIndicatorLayer === layer.id}
                errors={errors}
                loaded={!loading}
              />
            }
          )
        }
      </div>
    </div>
  }

  const groups = layerInGroup(indicatorLayers)
  return (
    <Fragment>
      {
        Object.keys(groups).map(
          groupName => (
            <LayerRow
              key={groupName} groupName={groupName}
              group={groups[groupName]}/>
          )
        )
      }
    </Fragment>
  )
}

/**
 * Indicators selector
 * @param {bool} expanded Is the accordion expanded
 * @param {function} handleChange Function when the accordion show
 */
export default function IndicatorLayersAccordion({ expanded, handleChange }) {
  const dispatch = useDispatch();
  const { indicatorShow } = useSelector(state => state.map);

  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange('indicators')}
    >

      <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
        <div className='Name'>
          Indicators
        </div>
        <OnOffSwitcher
          checked={indicatorShow}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onChange={(e) => {
            dispatch(Actions.Map.showHideIndicator(!indicatorShow))
            e.stopPropagation();
          }}/>
      </AccordionSummary>
      <AccordionDetails>
        <IndicatorLayers/>
      </AccordionDetails>
    </Accordion>
  )
}