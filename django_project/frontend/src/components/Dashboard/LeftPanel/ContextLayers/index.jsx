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
import InfoIcon from '@mui/icons-material/Info';

import { Actions } from '../../../../store/dashboard'
import { getLayer } from "./Layer"
import OnOffSwitcher from "../../../Switcher/OnOff";
import CustomPopover from "../../../CustomPopover";

import './style.scss'
import {
  createTreeData,
  flattenTree
} from "../../../SortableTreeForm/utilities";
import SidePanelTreeView from "../../../SidePanelTree";

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
    if (!data.permission.read) {
      setError("You don't have permission to access this resource")
    } else {
      if (data.visible_by_default) {
        change(true)
      } else {
        change(false)
      }
      rerender()
    }
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
    if (data.permission.read) {
      rerender()
    }
  }, [styles, data_fields])

  // When checked changes
  useEffect(() => {
    if (checked) {
      if (layer) {
        dispatch(
          Actions.Map.addContextLayer(id, {
            layer: layer,
            layer_type: data.layer_type
          })
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
      <table className={className}>
        <tbody>
        <tr className='dashboard__left_side__row__title' onClick={() => {
          if (layer && !error) {
            change(!checked)
          }
        }}>
          <td valign="top">
            <Switch
              disabled={!layer || error}
              size="small"
              checked={checked}
              onChange={() => {
              }}
            />
          </td>
          <td valign="top">
            <div className='text title'>
              <div>{data.name}</div>
            </div>
          </td>
          {
            !error ?
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
                        <b className='light'>{data.name}
                        </b>
                      </div>
                      <div>
                        <b className='light'>Description: </b>
                        {
                          data.description ? data.description : '-'
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
                      {error}
                    </div>
                  </CustomPopover>
                </div>
              </td>
          }
          <td valign="top">
            {
              checked && legend ? (
                <Fragment>
                  {
                    showLegend ?
                      <div className='toggler' onClick={(e) => {
                        showLegendHandler(false)
                        e.stopPropagation();
                      }}>
                        <div>▴</div>
                      </div> :
                      <div className='toggler' onClick={(e) => {
                        showLegendHandler(true)
                        e.stopPropagation();
                      }}>
                        <div>▾</div>
                      </div>
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

function ContextLayers() {
  const dispatch = useDispatch();
  const { contextLayers } = useSelector(state => state.dashboard.data);
  const [treeData, setTreeData] = useState([])
  const [selectedLayer, setSelectedLayer] = useState([])
  const [layers, setLayers] = useState({})

  useEffect(() => {
    initialize(contextLayers)
  }, [contextLayers])

  const initialize = (_contextLayers) => {
    const _layers = {};

    for (const contextLayer of _contextLayers) {
      getLayer(
        contextLayer,
        (layer) => {_layers[contextLayer.id] = layer},
        (legend) => contextLayer.legend = legend,
        (error) => contextLayer.error = error,
        null
      )
    }
    setLayers(_layers)
    if (_contextLayers) {
      setTreeData([...createTreeData(_contextLayers)])
    }
  }

  const onChange = (selectedData) => {
    const flattenedData = flattenTree(treeData)
    const selectedLayers = flattenedData.reduce((items, item) => {
      if (!item.isGroup && item.data) {
        if (selectedData.indexOf('' + item.data.id) >= 0) {
          items.push(item.data)
        }
      }
      return items;
    }, [])
    for (const item of selectedLayers) {
      if (layers[item.id]) {
         dispatch(
          Actions.Map.addContextLayer(item.id, {
            layer: layers[item.id],
            layer_type: item.layer_type
          })
        );
      }
    }
    for (const layerId of selectedLayer) {
      if (selectedData.indexOf(layerId) === -1) {
        dispatch(
          Actions.Map.removeContextLayer(layerId)
        );
      }
    }
    setSelectedLayer([...selectedData])
  }

  return (
    <SidePanelTreeView
        data={treeData}
        selectable={true}
        groupSelectable={true}
        maxSelect={10}
        onChange={onChange}
    />
  )
}

/**
 * Context Layer Accordion.
 * @param {bool} expanded Is the accordion expanded.
 * @param {function} handleChange Function when the accordion show.
 */
export default function ContextLayersAccordion({ expanded, handleChange }) {
  const dispatch = useDispatch();
  const { contextLayersShow } = useSelector(state => state.map);

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
        <ContextLayers/>
      </AccordionDetails>
    </Accordion>
  )
}