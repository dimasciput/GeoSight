import React, { Fragment, useEffect, useState } from 'react';
import $ from "jquery";
import TextField from "@mui/material/TextField";
import DatePicker from "react-datepicker";
import Moment from "moment";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import Admin, { pageNames } from '../../index';
import {
  SaveButton,
  ThemeButton
} from "../../../../components/Elements/Button";
import { SelectWithList } from "../../../../components/Input/SelectWithList";
import InputFile from './InputFile'
import { GeorepoUrls } from '../../../../utils/georepo'
import { jsonToXlsx } from '../../../../utils/main'

import './style.scss';

export function InputForm({ type, placeholder, name, initValue }) {
  const [value, setValue] = useState(initValue)

  useEffect(() => {
    setValue(initValue)
  }, [initValue])
  return <TextField
    value={value} type={type} placeholder={placeholder} name={name}
    onChange={(evt) => {
      setValue(evt.target.value)
    }
    }
  />
}

/**
 * ValueManagementMap Form App
 */
export default function ValueManagement() {
  const [open, setOpen] = useState(false);
  const [references, setReferences] = useState(null)
  const [reference, setReference] = useState(null)
  const [level, setLevel] = useState(null)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [date, setDate] = useState(new Date())

  const fetchData = (level, page) => {
    $.ajax({
      url: preferences.georepo_api.domain + level.url + '/list?page=' + page,
    }).done(function (data) {
      if (!level.layer) {
        level.layer = []
      }
      level.layer = level.layer.concat(data.results)
      page += 1
      if (page > data.total_page) {
        level.finished = true
      }
      level.page = page
      setReferences([...references])
    });
  }

  // When reference changed
  useEffect(() => {
    setError('')
    setData(null)
    if (reference) {
      const referenceLayer = references.filter(row => {
        return row.identifier === reference
      })[0]
      if (!referenceLayer.data) {
        $.ajax({
          url: GeorepoUrls.ReferenceDetail(reference)
        }).done(function (data) {
          referenceLayer.data = data.levels.map(level => {
            level.value = level.level
            level.name = level.level_name
            return level
          });
          setReferences([...references])
          setLevel(referenceLayer.data[0].value)
        });
      } else {
        // Check levels
        const referenceLayerLevel = referenceLayer.data.filter(refLevel => {
          return refLevel.level === level
        })[0]

        if (!referenceLayerLevel.finished) {
          fetchData(referenceLayerLevel, !referenceLayerLevel.page ? 1 : referenceLayerLevel.page)
        } else {
          if (referenceLayerLevel.layer) {
            const featureData = {}
            referenceLayerLevel.layer.map(feature => {
              const identifier = feature?.identifier?.admin;
              featureData[identifier] = {
                name: feature.name,
                lastValue: valueDataList[identifier]
              }
              return feature.name
            })

            let sortedData = Object.keys(featureData).map(function (key) {
              return [key, featureData[key]];
            });
            sortedData.sort(function (a, b) {
              if (b[1].name > a[1].name) {
                return -1;
              } else if (b[1].name < a[1].name) {
                return 1;
              }
              return 0;
            });
            setData(sortedData)
          }
        }
      }
    } else {
      // GET PREFERENCES LIST
      $.ajax({
        url: GeorepoUrls.ReferenceList
      }).done(function (data) {
        const references = data.map(row => {
          row.value = row.identifier
          return row
        })
        setReference(references[0].value)
        setReferences(references)
      });
    }
  }, [reference, references, level])

  // Check reference layer
  let referenceLayer = null
  let levelData = null
  if (references) {
    referenceLayer = references.filter(row => {
      return row.identifier === reference
    })[0]
    if (referenceLayer?.data) {
      levelData = referenceLayer.data.find(row => {
        return row.level === level
      })
    }
  }

  // Download template
  const downloadTemplate = () => {
    if (levelData?.finished && data) {
      const templateData = []
      data.map(row => {
        templateData.push({
          geometry_name: row[1].name,
          geometry_code: row[0],
          value: "",
          extra_name_1: "",
          extra_name_2: ""
        })
      })
      jsonToXlsx(templateData, referenceLayer?.name + "." + levelData?.level_name + ".Template.xls")
    }
  }

  return (
    <form className="BasicForm" method="post" encType="multipart/form-data">
      <input type="hidden" name="csrfmiddlewaretoken"
             value={csrfmiddlewaretoken}/>
      <Admin
        className='Indicator'
        pageName={pageNames.Indicators}
        rightHeader={
          <Fragment>
            <DatePicker
              name='date'
              dateFormat="yyyy-MM-dd"
              selected={date ? new Date(date) : ""}
              onChange={date => {
                setDate(Moment(date).format('YYYY-MM-DD'))
              }}
            />
            <SaveButton
              variant="secondary"
              text="Submit"
              type="submit"
            />
          </Fragment>
        }>

        <div className='ManagementForm'>
          <div className='TopButtons'>

            <ThemeButton
              disabled={!levelData?.finished || !data}
              variant="secondary"
              onClick={() => downloadTemplate()}
            >
              Download XLS template
            </ThemeButton>
            <ThemeButton variant="secondary" onClick={() => setOpen(true)}>
              Use File to Refill Form
            </ThemeButton>
          </div>
          <div className='ReferenceLayerSelection'>
            <b className='light'>Reference Dataset</b>
          </div>
          <div className='ReferenceLayerSelection'>
            <SelectWithList
              name='reference_layer'
              list={references}
              value={reference}
              onChange={evt => {
                setReference(evt.value)
              }}
            />
          </div>
          <div className='ReferenceLayerSelection'>
            <b className='light'>Admin Level</b>
          </div>
          <div className='ReferenceLayerSelection'>
            <SelectWithList
              name='admin_level'
              list={referenceLayer && referenceLayer.data}
              value={level}
              onChange={evt => {
                setLevel(evt.value)
              }}
            />
          </div>
          <div className='ReferenceLayerSelection'>
            {error ? <div className='error'>{error}</div> : ''}
          </div>
          <div className='ReferenceLayerTable'>
            <table>
              <tbody>
              {
                data ?
                  data.map(row => {
                    return (
                      <tr key={row[0]}>
                        <td
                          valign='top'
                          className='ReferenceLayerTable-Name'>{row[1].name}</td>
                        <td>
                          <div>
                            <InputForm
                              initValue={row[1].value}
                              type='number' placeholder='New Value'
                              name={'geometry:' + row[0]}/>
                          </div>
                          <div className='ExtraValue'>
                            <div className='ExtraValueTitle form-helptext'>
                              <div>Extra Value</div>
                              <div className='ExtraValueIcon MuiButtonLike'>
                                <AddCircleOutlineIcon onClick={() => {
                                  if (!row[1].extras) {
                                    row[1].extras = []
                                  }
                                  row[1].extras.push({
                                    name: "",
                                    value: ""
                                  })
                                  setData([...data])
                                }}/>
                              </div>
                            </div>
                            <div className='ExtraValueContent'>
                              {
                                row[1].extras ? row[1].extras.map((extra, idx) => {
                                  return (
                                    <div className='ExtraValueContentRow'
                                         key={idx}>
                                      <InputForm
                                        type='text'
                                        placeholder='Name'
                                        name={'extra_name:' + idx + ':' + row[0]}
                                        initValue={extra.name}
                                      />
                                      <div className='ExtraValueContentEqual'>
                                        =
                                      </div>
                                      <InputForm
                                        type='text'
                                        placeholder='Name'
                                        name={'extra_value:' + idx + ':' + row[0]}
                                        initValue={extra.value}
                                      />
                                      <CancelIcon
                                        className='MuiButtonLike'
                                        onClick={() => {
                                          row[1].extras.splice(idx, 1);
                                          setData([...data])
                                        }}/>
                                    </div>
                                  )
                                }) : ""
                              }
                            </div>
                          </div>
                        </td>
                        <td
                          valign='top'
                          className='ReferenceLayerTable-LastValue'>
                          {
                            row[1].lastValue ?
                              <Fragment>
                                Last value
                                : {row[1].lastValue.value} at {row[1].lastValue.date}
                              </Fragment>
                              : ''
                          }
                        </td>
                      </tr>
                    )
                  }) : <tr>
                    <td>Loading</td>
                  </tr>
              }
              </tbody>
            </table>
          </div>
        </div>
      </Admin>
      <InputFile
        data={data} apply={(newData) => {
        setData([...newData])
      }}
        open={open} setOpen={setOpen}
      />
    </form>
  );
}

render(ValueManagement, store)