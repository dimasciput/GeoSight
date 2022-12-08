/* ==========================================================================
   INDICATOR LAYER
   ========================================================================== */

import React, {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import { useDispatch, useSelector } from "react-redux";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from '@mui/material/AccordionDetails';
import Accordion from "@mui/material/Accordion";
import InfoIcon from '@mui/icons-material/Info';
import CircularProgress from '@mui/material/CircularProgress';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {Button, Checkbox, Collapse, Radio} from "@mui/material";

import { Actions } from '../../../../store/dashboard'
import { layerInGroup } from "../../../../utils/layers";
import OnOffSwitcher from "../../../Switcher/OnOff";
import CustomPopover from "../../../CustomPopover";


/**
 * Indicator selector.
 * @param {dict} layer Layer dictionary.
 * @param {int} containerWidth width of the container
 * @param {bool} checked Is indicator checked.
 * @param {function} onChange Function when on changed
 * @param {bool} checkedAsSecond Is indicator checked as second.
 * @param {function} onChangeAsSecond Function when on changed as second
 */
export function IndicatorLayer(
  { layer, containerWidth,
    checked, onChange, checkedAsSecond, onChangeAsSecond }
) {
  const { indicators } = useSelector(state => state.dashboard.data)
  const indicatorsData = useSelector(state => state.indicatorsData)
  const { compareMode } = useSelector(state => state.mapMode)
  const active = checked | checkedAsSecond
  const [showLegend, setShowLegend] = useState(active)

  const showLegendHandler = (show) => {
    setShowLegend(show);
  };

  // --------------------------------------------
  // Check loading and errors
  let errors = []
  let loading = false
  layer.indicators.map(indicator => {
    if (!indicatorsData[indicator.id]?.fetched) {
      loading = true
    }
    const errorData = indicatorsData[indicator.id]?.error
    if (errorData) {
      try {
        errors.push(errorData.data.detail)
      } catch (e) {
        console.error(e)
      }
    }
  })
  // --------------------------------------------
  const changed = (id) => {
    if (compareMode) {
      onChangeAsSecond(id)
    } else {
      onChange(id)
    }
  }

  const maxWordLength = parseInt(containerWidth / 15)
  const maxWordRegex = new RegExp(`(\\w{${maxWordLength}})(?=\\w)`)

  const disabled = errors.length !== 0 || (compareMode && checked)
  return (
    <table
      className={'dashboard__left_side__row ' + (compareMode ? "CompareMode" : "")}
      key={layer.id}>
      <tbody>
      <tr className='dashboard__left_side__row__title'
          onClick={() => {
            if (!errors.length && !active) {
              changed(layer.id)
            }
          }}
      >
        <td valign="top">
          <div className='RadioButtonSection'>
            {
              !compareMode ?
                <Radio
                  checked={active}
                  disabled={disabled}
                  onChange={() => {

                  }}/>
                :
                <Checkbox
                  checked={active}
                  disabled={disabled}
                  onChange={() => {

                  }}
                />
            }
            {
              loading ? <CircularProgress/> : ""
            }
          </div>

        </td>
        <td valign="top">
          <div className='text title'>
            <div>{layer.name.replace(maxWordRegex, '$1 ')}</div>
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
      </tr>
      </tbody>
    </table>
  )
}

/**
 * Indicators selector.
 */
export function IndicatorLayers() {
  const dispatch = useDispatch()
  const { indicatorLayers } = useSelector(state => state.dashboard.data)
  const [currentIndicatorLayer, setCurrentIndicatorLayer] = useState(0)
  const { compareMode } = useSelector(state => state.mapMode)
  const [currentIndicatorSecondLayer, setCurrentIndicatorSecondLayer] = useState(0)

  /**
   * Change selected indicator layer
   */
  useEffect(() => {
    const indicator = indicatorLayers.filter(indicator => {
      return indicator.id === currentIndicatorLayer
    })[0]
    if (indicator) {
      const indicatorData = JSON.parse(JSON.stringify(indicator))
      dispatch(Actions.SelectedIndicatorLayer.change(indicatorData))
    }
  }, [currentIndicatorLayer]);

  /**
   * Change selected indicator layer
   */
  useEffect(() => {
    const indicator = indicatorLayers.filter(indicator => {
      return indicator.id === currentIndicatorSecondLayer
    })[0]
    if (indicator) {
      const indicatorData = JSON.parse(JSON.stringify(indicator))
      dispatch(Actions.SelectedIndicatorSecondLayer.change(indicatorData))
    }
  }, [currentIndicatorSecondLayer]);

  /**
   * Change selected indicator layer
   */
  useEffect(() => {
    if (!compareMode) {
      setCurrentIndicatorSecondLayer(0)
      dispatch(Actions.SelectedIndicatorSecondLayer.change({}))
    }
  }, [compareMode]);

  /**
   * Init the current indicator layer
   */
  useEffect(() => {
    if (indicatorLayers) {
      // Change current indicator if indicators changed
      const indicatorsEnabled = indicatorLayers.find(indicator => {
        return indicator.visible_by_default
      })

      if (indicatorsEnabled) {
        setCurrentIndicatorLayer(indicatorsEnabled.id)
      }
    }
  }, [indicatorLayers]);

  /**
   * Context Layer Row.
   * @param {str} groupNumber Group number.
   * @param {str} groupName Group name.
   * @param {dict} group Group data.
   */
  const LayerRow = ({ groupName, group }) => {
    const layerGroupListRef = useRef(null);
    const [isCollapsed, setIsCollapsed] = React.useState(true);

    const handleCollapseClick = () => {
      setIsCollapsed(!isCollapsed);
    };

    const [width, setWidth] = useState(0);

    useLayoutEffect(() => {
      if (layerGroupListRef?.current) {
        setWidth(layerGroupListRef.current.offsetWidth);
      }
    }, []);

    return <div className={'LayerGroup ' + (groupName ? '' : 'Empty')}>
      <div className='LayerGroupName' onClick={handleCollapseClick}>
        <Button className='CollapseButton'
                variant={'text'} size={'small'} startIcon={isCollapsed ? <KeyboardArrowDownIcon/> : <KeyboardArrowRightIcon/>} />
        <b className='light'>{groupName}</b>
      </div>
      <Collapse in={isCollapsed}>
        <div className='LayerGroupList' ref={layerGroupListRef}>
          {
            group.map(layer => {
                return <IndicatorLayer
                  key={layer.id}
                  layer={layer}
                  containerWidth={width}
                  checked={currentIndicatorLayer === layer.id}
                  onChange={setCurrentIndicatorLayer}
                  checkedAsSecond={currentIndicatorSecondLayer === layer.id}
                  onChangeAsSecond={setCurrentIndicatorSecondLayer}
                />
              }
            )
          }
        </div>
      </Collapse>
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
  const indicatorShow = useSelector(state => state.map.indicatorShow);
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