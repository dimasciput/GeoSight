import React, { Fragment, useEffect, useState } from 'react';
import $ from "jquery";
import DatePicker from "react-datepicker";
import Moment from 'moment';
import Admin, { pageNames } from '../index';
import { SaveButton } from "../../../components/Elements/Button";
import { SelectWithList } from "../../../components/Input/SelectWithList";
import { GeorepoUrls } from '../../../utils/georepo'

import './style.scss';


/** Harvesters App
 * @param {bool} is_harvester Is it a harvester.
 * @param {bool} has_indicator Is the harvester has indicator.
 * @param {bool} geom_mapping Is the harvester has geom mapping.
 * @param {Array} attributes Attributes of data.
 * @param {Function} setAttributes Set Attribute Functions.
 * @param {Array} excludedAttributes Excluded attributes that will be rendered.
 * @param {React.Component} children React component to be rendered
 */
export default function Harvesters(
  {
    is_harvester,
    has_indicator,
    attributes, setAttributes,
    excludedAttributes = [],
    children
  }
) {

  let help = harvestersData.filter(harvester => {
    return harvesterClass === harvester.value
  })[0].description

  const [references, setReferences] = useState(null)
  const [reference, setReference] = useState(harvester.reference_layer)
  const [level, setLevel] = useState(harvester.admin_level)

  const [indicators, setIndicators] = useState(null)
  const [indicator, setIndicator] = useState(harvester.indicator_id)


  /** Input function */
  const input = (attribute) => {
    const name = 'attribute_' + attribute.name
    const required = attribute.required
    switch (attribute.type) {
      case "number":
        return (
          <input
            type='number'
            required={required}
            name={name}
            value={attribute.value}
            onChange={
              evt => {
                if (attribute.onChange) {
                  attribute.onChange(attribute, evt)
                } else {
                  attribute.value = evt.target.value
                  setAttributes([...attributes])
                }
              }
            }/>
        )
      case "date":
        return (
          <DatePicker
            name={name}
            required={required}
            dateFormat="yyyy-MM-dd"
            selected={attribute.value ? new Date(attribute.value) : ""}
            onChange={date => {
              attribute.value = Moment(date).format('YYYY-MM-DD')
              setAttributes([...attributes])
            }
            }
          />
        )
      case "select": {
        return (
          <SelectWithList
            name={name}
            list={attribute.options}
            value={attribute.value}
            required={required}
            onChange={evt => {
              evt = {
                target: {
                  value: evt.value
                }
              }
              if (attribute.onChange) {
                attribute.onChange(attribute, evt)
              } else {
                attribute.value = evt.target.value
                setAttributes([...attributes])
              }
            }}/>
        )
      }
      case "file": {
        return (
          <input
            type="file"
            name={name}
            accept={attribute.file_accept}
            onChange={evt => {
              if (attribute.onChange) {
                attribute.onChange(attribute, evt)
              }
            }}/>
        )
      }
      default:
        return (
          <input
            name={name}
            required={required}
            disabled={attribute.read_only}
            type='text'
            value={attribute.value}
            onChange={
              evt => {
                if (attribute.onChange) {
                  attribute.onChange(attribute, evt)
                } else {
                  attribute.value = evt.target.value
                  setAttributes([...attributes])
                }
              }
            }/>
        )
    }
  }
  `
  /** Function to update attribute **/`
  const updateAttribute = (name, value) => {
    const ref_attr = attributes.find(attr => attr.name === name)
    if (!ref_attr) {
      attributes.push({
        name: name,
        value: value
      })
    } else {
      ref_attr.value = value
    }
  }

  // Indicator list
  useEffect(() => {
      updateAttribute('reference_layer', reference)
      updateAttribute('admin_level', level)
      updateAttribute('indicator', indicator)
      setAttributes([...attributes])
    }, [reference, level, indicator]
  )

  // When reference changed
  useEffect(() => {
      if (references) {
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
            const levels = referenceLayer.data.map(level => {
              return level.value
            });
            if (!levels.includes(level)) {
              setLevel(referenceLayer.data[0].value)
            }
          });
        } else {
          const levels = referenceLayer.data.map(level => {
            return level.value
          });
          if (!levels.includes(level)) {
            setLevel(referenceLayer.data[0].value)
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
          if (!reference) {
            setReference(references[0].value)
          }
          setReferences(references)
        });
      }
    }, [reference, references, level]
  )

  // Indicator list
  useEffect(() => {
      // GET PREFERENCES LIST
      $.ajax({
        url: indicatorListAPI
      }).done(function (data) {
        const indicators = data.map(row => {
          row.value = row.id
          return row
        })
        setIndicators(indicators)
        if (!indicator) {
          setIndicator(indicators[0].value)
        }
      });
    }, []
  )

  // Check reference layer
  let referenceLayer = null
  if (references) {
    referenceLayer = references.filter(row => {
      return row.identifier === reference
    })[0]
  }

  return (
    <form className="BasicForm" method="post" encType="multipart/form-data">
      <Admin
        pageName={pageNames.Harvester}
        rightHeader={
          <SaveButton
            variant="secondary"
            text="Submit"
            type="submit"
          />
        }
      >
        <div className='HarvesterForm'>
          <div className="BasicFormSection">
            <span className="form-input">
              <input type="hidden" name="csrfmiddlewaretoken"
                     value={csrfmiddlewaretoken}/>
            </span>
          </div>

          <div className="BasicFormSection">
            <label className="form-label required" htmlFor="group">
              Harvester
            </label>
            <SelectWithList
              list={harvestersData}
              value={harvesterClass}
              name='harvester'
              onChange={evt => {
                // Redirect to harvester form
                window.location = harvestersData.filter(harvester => {
                  return harvester.value === evt.value
                })[0].url
              }}/>
            <div>
              <span className='form-helptext'
                    dangerouslySetInnerHTML={{ __html: help }}/>
            </div>
          </div>

          <div className="BasicFormSection">
            <label className="form-label required" htmlFor="group">
              Reference Layer
            </label>
            <SelectWithList
              name='reference_layer'
              list={references}
              value={reference}
              onChange={evt => {
                setReference(evt.value)
              }}
            />
          </div>

          <div className="BasicFormSection">
            <label className="form-label required" htmlFor="group">
              Admin Level
            </label>
            <SelectWithList
              name='admin_level'
              list={referenceLayer && referenceLayer.data}
              value={level}
              onChange={evt => {
                setLevel(evt.value)
              }}
            />
          </div>

          {
            has_indicator ?
              <Fragment>
                <div className="BasicFormSection">
                  <label className="form-label required" htmlFor="group">
                    Indicator
                  </label>
                  <SelectWithList
                    name='indicator'
                    list={indicators}
                    value={indicator}
                    onChange={evt => {
                      setIndicator(evt.value)
                    }}
                  />
                </div>
              </Fragment> : ""
          }

          {
            is_harvester ?
              <Fragment>
                <div className="BasicFormSection">
                  <label className="form-label required" htmlFor="group">
                    Frequency
                  </label>
                  <input
                    type='number'
                    required={true}
                    name={'frequency'}
                    defaultValue={harvester.frequency ? harvester.frequency : 30}
                  />
                  <div>
                    <span className='form-helptext'>The frequency in days that the harvester will be run.</span>
                  </div>
                </div>
              </Fragment> : ""
          }

          {
            attributes.map(attribute => {
              if ([
                'reference_layer', 'admin_level', 'indicator'
              ].concat(excludedAttributes).includes(attribute.name)) {
                return ""
              }
              return (
                <div key={attribute.name} className="BasicFormSection">
                  <label
                    className={"form-label " + (attribute.required ? 'required' : '')}>
                    {attribute.title}
                  </label>
                  {input(attribute)}
                  <span className='form-helptext'
                        dangerouslySetInnerHTML={{ __html: attribute.description }}/>
                </div>
              )
            })
          }

          {children ? children : ''}

          {/*TODO: We park this */}
          {/*<table id="mapping-table" className="content-table">*/}
          {/*  <tr>*/}
          {/*    <th>From (Remote Name)</th>*/}
          {/*    <th>To (Server Name)</th>*/}
          {/*  </tr>*/}
          {/*  <tbody id="mapping-table-body"></tbody>*/}
          {/*</table>*/}

        </div>
      </Admin>
    </form>
  );
}