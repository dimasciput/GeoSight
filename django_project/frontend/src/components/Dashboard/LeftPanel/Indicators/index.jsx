/* ==========================================================================
   REFERENCE LAYER
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
import ReferenceLayer from '../../Map/ReferenceLayer'
import OnOffSwitcher from "../../../Switcher/OnOff";
import CustomPopover from "../../../CustomPopover";


/**
 * Indicator selector.
 * @param {bool} checked Is indicator checked.
 * @param {dict} layer Layer dictionary.
 * @param {function} onChange Function when on changed
 */
export function Indicator({ checked, layer, onChange }) {
  const [showLegend, setShowLegend] = useState(checked);
  const showLegendHandler = (show) => {
    setShowLegend(show);
  };

  return (
    <table className='dashboard__left_side__row'
           key={layer.id}>
      <tbody>
      <tr className='dashboard__left_side__row__title' onClick={() => {
        if (!checked) {
          onChange(!checked, layer.id)
        }
      }}>
        <td>
          <Radio
            checked={checked}
            onChange={() => {

            }}/>
        </td>
        <td>
          <div className='text title'>
            <div>{layer.name}</div>
          </div>
        </td>
        <td className='InfoIcon'>
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
        </td>
        <td>
          {
            checked ? (
              <Fragment>
                {
                  showLegend ?
                    <span className='toggler' onClick={(e) => {
                      e.stopPropagation()
                      showLegendHandler(false)
                    }}>▴</span> :
                    <span className='toggler' onClick={(e) => {
                      e.stopPropagation()
                      showLegendHandler(true)
                    }}>▾</span>
                }
              </Fragment>
            ) : ''
          }
        </td>
      </tr>
      <tr className={showLegend ? 'legend showLegend' : 'legend'}>
        <td></td>
        <td>
          <div>
            <table>
              <tbody>
              {
                layer.rules.filter(rule => rule.active).map(rule => (
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
          </div>
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
export function Indicators() {
  const dispatch = useDispatch();
  const { indicators } = useSelector(state => state.dashboard.data);
  const indicatorsData = useSelector(state => state.indicatorsData);
  const geometries = useSelector(state => state.geometries);

  const [currentIndicator, setCurrentIndicator] = useState(0);

  const change = (checked, id) => {
    if (checked) {
      setCurrentIndicator(id);
    } else {
      setCurrentIndicator(null);
    }
  };

  /**
   * Fetch indicator data
   */
  useEffect(() => {
    const indicator = indicators.filter(indicator => {
      return indicator.id === currentIndicator
    })[0]
    if (indicator) {
      const indicatorData = JSON.parse(JSON.stringify(indicator))
      dispatch(Actions.SelectedIndicator.change(indicatorData))
    }
  }, [currentIndicator, indicatorsData]);

  /**
   * Fetch indicator data
   */
  useEffect(() => {
    if (indicators) {
      indicators.map(indicator => {
        const { id } = indicator
        if (!indicatorsData[id]?.data) {
          dispatch(
            Actions.IndicatorsData.fetch(
              dispatch, id, indicator.url, indicator.reporting_level
            )
          );
        }
      })

      // Change current indicator if indicators changed
      const indicatorsEnabled = indicators.find(indicator => {
        return indicator.visible_by_default
      })

      if (indicatorsEnabled) {
        setCurrentIndicator(indicatorsEnabled.id)
      }
    }
  }, [indicators]);

  // Get selected indicator data
  let selectedIndicator = null;
  if (indicators) {
    selectedIndicator = indicators.filter(indicator => {
      return indicator.id === currentIndicator
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
          group.map(layer =>
            <Indicator
              key={layer.id} onChange={change} layer={layer}
              checked={currentIndicator === layer.id}/>
          )
        }
      </div>
    </div>
  }

  const groups = layerInGroup(indicators)
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
      <ReferenceLayer currentIndicator={selectedIndicator}/>
    </Fragment>
  )
}

/**
 * Indicators selector
 * @param {bool} expanded Is the accordion expanded
 * @param {function} handleChange Function when the accordion show
 */
export default function IndicatorsAccordion({ expanded, handleChange }) {
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
        <Indicators/>
      </AccordionDetails>
    </Accordion>
  )
}