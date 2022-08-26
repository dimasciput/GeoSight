import React, { Fragment, useEffect, useState } from 'react';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowLeftIcon
  from '@mui/icons-material/KeyboardDoubleArrowLeft';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import {
  SaveButton,
  ThemeButton
} from "../../../../../../components/Elements/Button";
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../../../components/Modal";
import MultiIndicatorStyle from './Style'

import './style.scss';

const FixedSize = "Fixed size"
const sizeTypes = [
  FixedSize,
  "Vary size using sum of values",
  // "Vary size using indicator",
]

const defaultChartType = "Pie"
const chartTypes = [
  defaultChartType,
  "Bar"
]

/**
 * MultiIndicatorConfig
 * @param {boolean} multiIndicatorStyleOpen Is open or close.
 * @param {Function} setMultiIndicatorStyleOpen Set Parent Open.
 * @param {Array} indicators List of indicators of selected data.
 * @param {dict} indicatorLayer Data of layer.
 * @param {Function} onUpdate Function when data updated.
 */
export default function MultiIndicatorConfig(
  {
    multiIndicatorStyleOpen,
    setMultiIndicatorStyleOpen,
    indicators,
    indicatorLayer,
    onUpdate
  }
) {
  const defaultMinSize = 20
  const defaultMaxSize = 50

  /** Default data **/
  const defaultData = () => {
    return {
      name: "",
      description: "",
      indicators: [],
      style: {
        sizeType: FixedSize,
        chartType: defaultChartType,
        size: 50
      }
    }
  }
  const defaultIndicatorStyle = (indicator) => {
    return {
      id: indicator.id,
      name: indicator.name,
      color: '#000000'
    }
  }

  const [data, setData] = useState(defaultData());
  const [open, setOpen] = useState(false);
  const [indicatorsSelected, setIndicatorsSelected] = useState([]);

  const indicatorIds = data.indicators.map(indicator => indicator.id)
  const indicatorList = indicators.sort((a, b) => {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  }).filter(indicator => !indicatorIds.includes(indicator.id));

  // Open data selection when the props true
  useEffect(() => {
    if (multiIndicatorStyleOpen) {
      setOpen(true)
    }
  }, [multiIndicatorStyleOpen])

  // Open data selection when the props true
  useEffect(() => {
    if (setMultiIndicatorStyleOpen) {
      setMultiIndicatorStyleOpen(open)
    }
    if (!indicatorLayer) {
      setData(defaultData())
    } else {
      setData(indicatorLayer)
    }
  }, [open])

  /** Update data **/
  const updateData = () => {
    setData(JSON.parse(JSON.stringify(data)))
  }

  /** Apply data **/
  const apply = () => {
    onUpdate(data)
    setOpen(false)
  }

  if (indicatorLayer && !indicators.length) {
    return ""
  }

  if (!data.style) {
    data.style = {
      sizeType: FixedSize,
      size: defaultMinSize,
      chartType: defaultChartType
    }
  }

  return (
    <Fragment>
      <Modal
        className='MultiIndicatorConfig MuiBox-Large'
        open={open}
        onClosed={() => {
          setOpen(false)
        }}
      >
        <ModalHeader onClosed={() => {
          setOpen(false)
        }}>
          {
            !indicatorLayer ?
              'Create Multi Indicator Layer' :
              'Change Layer ' + indicatorLayer.name
          }
        </ModalHeader>
        <ModalContent>
          <div className='Header'>
            <SaveButton
              variant="secondary"
              text={"Apply Changes"}
              disabled={data.indicators.length < 2 || !data.name}
              onClick={apply}/>
          </div>
          <div className='BasicForm'>
            <div className="BasicFormSection">
              <div>
                <label className="form-label">Name</label>
              </div>
              <div className='ContextLayerConfig-IconSize'>
                <input
                  type="text" spellCheck="false"
                  value={data.name}
                  onChange={evt => {
                    data.name = evt.target.value
                    updateData()
                  }}/>
              </div>
            </div>
            <div className="BasicFormSection">
              <div>
                <label className="form-label">Description</label>
              </div>
              <div className='ContextLayerConfig-IconSize'>
                <textarea
                  value={data.description}
                  onChange={evt => {
                    data.description = evt.target.value
                    updateData()
                  }}/>
              </div>
            </div>
            <div className='IndicatorStyleSection'>
              <div className='IndicatorsSelection'>
                <Select
                  multiple
                  native
                  label="Native"
                  value={indicatorsSelected}
                  onChange={(evt) => {
                    const { options } = event.target;
                    const value = [];
                    for (let i = 0, l = options.length; i < l; i += 1) {
                      if (options[i].selected) {
                        value.push(parseInt(options[i].value));
                      }
                    }
                    setIndicatorsSelected(value)
                  }}
                >
                  {
                    indicatorList.map((indicator) => (
                      <option key={indicator.id} value={indicator.id}>
                        {indicator.name}
                      </option>
                    ))
                  }
                </Select>
              </div>

              {/* Add selected indicators to styles */}
              <div className='IndicatorsListButtons'>
                <div>
                  <ThemeButton
                    variant="secondary Basic" className='IndicatorStyleButton'
                    onClick={() => {
                      indicatorsSelected.map(id => {
                        const indicator = indicators.find(indicator => indicator.id === id)
                        data.indicators.push(defaultIndicatorStyle(indicator))
                        setIndicatorsSelected([])
                      })
                      updateData()
                    }}>
                    <KeyboardArrowRightIcon/>
                  </ThemeButton>
                </div>
                <div>
                  <ThemeButton
                    variant="secondary Basic" className='IndicatorStyleButton'
                    onClick={() => {
                      data.indicators = []
                      updateData()
                    }}>
                    <KeyboardDoubleArrowLeftIcon/>
                  </ThemeButton>
                </div>
              </div>
              <div className='IndicatorsSelected'>
                <MultiIndicatorStyle
                  data={data} indicators={indicators}
                  updateData={updateData}/>
              </div>
            </div>
            <div className='IndicatorsStyle'>
              <div>
                <FormControl>
                  <div>
                    <b className='light'>Chart Type</b>
                  </div>
                  <RadioGroup
                    value={data.style.chartType}
                    className='IndicatorsStyle-Size'
                    onChange={(evt) => {
                      data.style.chartType = evt.target.value
                      updateData()
                    }}
                  >
                    {
                      chartTypes.map(type => {
                        return <FormControlLabel
                          key={type} value={type} control={<Radio/>}
                          label={type}/>
                      })
                    }
                  </RadioGroup>
                </FormControl>
              </div>
              <div>
                <FormControl>
                  <div>
                    <b className='light'>Size</b>
                  </div>
                  <RadioGroup
                    value={data.style.sizeType}
                    className='IndicatorsStyle-Size'
                    onChange={(evt) => {
                      switch (evt.target.value) {
                        case FixedSize:
                          data.style = {
                            ...data.style,
                            sizeType: evt.target.value,
                            size: data.style.size ? data.style.size : 10
                          }
                          break
                        default:
                          data.style = {
                            ...data.style,
                            sizeType: evt.target.value,
                            minSize: data.style.minSize ? data.style.minSize : defaultMinSize,
                            maxSize: data.style.maxSize ? data.style.maxSize : defaultMaxSize,
                          }
                      }
                      updateData()
                    }}
                  >
                    {
                      sizeTypes.map(type => {
                        return <FormControlLabel
                          key={type} value={type} control={<Radio/>}
                          label={type}/>
                      })
                    }
                  </RadioGroup>
                </FormControl>
              </div>
              <div>
                <div><b className='light'>Symbol Size</b></div>
                {
                  data.style.sizeType === FixedSize ? <Fragment>
                    <table>
                      <tbody>
                      <tr>
                        <td>Size :</td>
                        <td>
                          <input
                            min={defaultMinSize}
                            type="number" value={data.style.size}
                            onChange={evt => {
                              data.style.size = parseFloat(evt.target.value)
                              updateData()
                            }}/>
                        </td>
                        <td>px</td>
                      </tr>
                      </tbody>
                    </table>
                  </Fragment> : <Fragment>
                    <table>
                      <tbody>
                      <tr>
                        <td>Min :</td>
                        <td>
                          <input
                            min={defaultMinSize}
                            type="number" value={data.style.minSize}
                            onChange={evt => {
                              data.style.minSize = parseFloat(evt.target.value)
                              if (data.style.maxSize < data.style.minSize) {
                                data.style.maxSize = parseFloat(data.style.minSize)
                              }
                              updateData()
                            }}/>
                        </td>
                        <td>px</td>
                      </tr>
                      <tr>
                        <td>Max :</td>
                        <td>
                          <input
                            min={defaultMinSize}
                            type="number" value={data.style.maxSize}
                            onChange={evt => {
                              data.style.maxSize = parseFloat(evt.target.value)
                              if (data.style.maxSize < data.style.minSize) {
                                data.style.minSize = parseFloat(data.style.maxSize)
                              }
                              updateData()
                            }}/>
                        </td>
                        <td>px</td>
                      </tr>
                      </tbody>
                    </table>
                  </Fragment>
                }
              </div>
            </div>
          </div>
        </ModalContent>
      </Modal>
      {
        indicatorLayer ?
          <ThemeButton className='IndicatorStyleButton' onClick={() => {
            setOpen(true)
          }}>
            <ColorLensIcon/> Style
          </ThemeButton>
          : ""
      }
    </Fragment>
  )
}