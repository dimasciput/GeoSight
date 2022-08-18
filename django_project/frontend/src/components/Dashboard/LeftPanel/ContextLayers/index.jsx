/* ==========================================================================
   Context Layers SELECTOR
   ========================================================================== */

import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import Switch from '@mui/material/Switch';

import { Actions } from '../../../../store/dashboard'
import { layerInGroup } from '../../../../utils/layers'
import { getLayer } from "./Layer"
import OnOffSwitcher from "../../../Switcher/OnOff";

import './style.scss'

function ContextLayerInput({ data, styles, data_fields }) {
  const dispatch = useDispatch();
  const id = data.id;
  const [checked, setChecked] = useState(false);
  const [layer, setLayer] = useState(null);
  const [error, setError] = useState(null);
  const [legend, setLegend] = useState(null);
  const [showLegend, setShowLegend] = useState(false);

  // Onload for default checked and the layer
  useEffect(() => {
    if (data.visible_by_default) {
      change(true)
    } else {
      change(false)
    }
    rerender()
  }, [data])

  // Rerender
  const rerender = () => {
    setLayer(null)
    dispatch(
      Actions.Map.removeContextLayer(id)
    )
    getLayer(
      data, setLayer, setLegend, setError, dispatch
    );
  }

  useEffect(() => {
    rerender()
  }, [styles, data_fields])

  // When checked changes
  useEffect(() => {
    if (checked) {
      if (layer) {
        dispatch(
          Actions.Map.addContextLayer(id, layer)
        );
      }
    } else {
      if (layer) {
        dispatch(
          Actions.Map.removeContextLayer(id)
        );
      }
    }
  }, [checked, layer])


  const change = (checked) => {
    setChecked(checked);
    if (!checked) {
      showLegendHandler(false);
    } else {
      showLegendHandler(true);
    }
  };
  const showLegendHandler = (show) => {
    setShowLegend(show);
  };

  const className = layer ? 'dashboard__left_side__row' : 'dashboard__left_side__row disabled';
  return (
    <Fragment>
      <table className={className}
             title={error ? error : !layer ? 'Loading' : ''}>
        <tbody>
        <tr className='dashboard__left_side__row__title' onClick={() => {
          if (layer) {
            change(!checked)
          }
        }}>
          <td>
            <Switch
              disabled={!layer}
              size="small"
              checked={checked}
              onChange={() => {
              }}
            />
          </td>
          <td>
            <div className='text title'>
              <div>{data.name}</div>
            </div>
          </td>
          <td>
            {
              checked && legend ? (
                <Fragment>
                  {
                    showLegend ?
                      <span className='toggler' onClick={(e) => {
                        showLegendHandler(false)
                        e.stopPropagation();
                      }}>▴</span> :
                      <span className='toggler' onClick={(e) => {
                        showLegendHandler(true)
                        e.stopPropagation();
                      }}>▾</span>
                  }
                </Fragment>
              ) : ''
            }
          </td>
        </tr>
        {
          legend ?
            <tr className={showLegend ? 'legend showLegend' : 'legend'}>
              <td></td>
              <td>
                {
                  legend && showLegend
                    ? <div dangerouslySetInnerHTML={{ __html: legend }}></div>
                    : ''
                }
              </td>
              <td></td>
            </tr> : ""
        }
        </tbody>
      </table>
    </Fragment>
  )
}


/**
 * Context Layer Row.
 * @param {str} groupNumber Group number.
 * @param {str} groupName Group name.
 * @param {dict} group Group data.
 */
function LayerRow({ groupName, group }) {
  return <div className={'LayerGroup ' + (groupName ? '' : 'Empty')}>
    <div className='LayerGroupName'><b
      className='light'>{groupName}</b></div>
    <div className='LayerGroupList'>
      {
        group.map(
          layer => {
            return <ContextLayerInput
              key={layer.id} data={layer}
              styles={layer.styles}
              data_fields={layer.data_fields}/>
          }
        )
      }
    </div>
  </div>
}

/**
 * Context Layer Accordion.
 * @param {bool} expanded Is the accordion expanded.
 * @param {function} handleChange Function when the accordion show.
 */
export default function ContextLayersAccordion({ expanded, handleChange }) {
  const dispatch = useDispatch();
  const { contextLayers } = useSelector(state => state.dashboard.data);
  const { contextLayersShow } = useSelector(state => state.map);
  const groups = layerInGroup(contextLayers)

  /** Render group and layers
   * @param {str} groupName Name of group.
   * @param {dict} group Data of group.
   */
  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange('contextLayers')}
      className='ContextLayersAccordion'
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
        <div className='Name'>
          Context Layers
        </div>
        <OnOffSwitcher
          checked={contextLayersShow}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onChange={(e) => {
            dispatch(Actions.Map.showHideContextLayer(!contextLayersShow))
            e.stopPropagation();
          }}/>
      </AccordionSummary>
      <AccordionDetails>
        {
          contextLayers !== undefined ?
            (Object.keys(groups)).map(
              groupName => (
                <LayerRow
                  key={groupName} groupName={groupName}
                  group={groups[groupName]}/>
              )
            )
            : <div>Loading</div>
        }
      </AccordionDetails>
    </Accordion>
  )
}