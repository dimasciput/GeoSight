import React, { Fragment, useState } from 'react';
import $ from 'jquery';
import Select from "react-select";

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { SaveButton } from "../../../../components/Elements/Button";
import Admin, { pageNames } from '../../index';
import AdminForm from '../../Components/Form'
import IndicatorRules from './IndicatorRule'


/**
 * Indicator Form App
 */
export default function IndicatorForm() {
  const [submitted, setSubmitted] = useState(false);
  const [indicatorData, setIndicatorData] = useState(indicator);

  /** Render **/
  const submit = (saveAs = false) => {
    const url = window.location.href.split('?')[0]
    if (saveAs) {
      $('.BasicForm').attr('action', url + '?save-as=true')
    } else {
      $('.BasicForm').attr('action', url)
    }
    setSubmitted(true)
  }

  // Format type choices
  const typeChoices = types.map(type => {
    return {
      value: type[0],
      label: type[1]
    }
  })
  const codelistOptions = codelists.map(codelist => {
    return {
      label: codelist.name,
      value: codelist.id
    }
  })
  console.log(indicatorData)
  return (
    <Admin
      className='Indicator'
      pageName={pageNames.Indicators}
      rightHeader={
        <Fragment>
          {
            indicatorId ?
              <SaveButton
                variant="secondary"
                text="Save As New"
                onClick={() => {
                  submit(true)
                }}
                disabled={submitted ? true : false}
              /> : ""
          }
          <SaveButton
            variant="secondary"
            text="Submit"
            onClick={() => {
              submit()
            }}
            disabled={submitted ? true : false}
          />
        </Fragment>
      }>

      <AdminForm isSubmitted={submitted}>
        <div className="BasicFormSection">
          <div>
            <label className="form-label required">Indicator type</label>
          </div>
          <Select
            options={typeChoices}
            value={typeChoices.find(type => type.value === indicatorData.type)}
            name='type'
            onChange={evt => {
              indicatorData.type = evt.value
              setIndicatorData({ ...indicatorData })
            }}
          />
        </div>
        {
          indicatorData.type === 'String' ?
            <div className="BasicFormSection">
              <label className="form-label">Codelist</label>
              <Select
                options={codelistOptions}
                value={codelistOptions.find(option => option.value === indicatorData.codelist)}
                onChange={evt => {
                  indicatorData.codelist = evt.value
                  setIndicatorData({ ...indicatorData })
                }}
              />
              <input
                type="text"
                name="codelist"
                value={indicatorData.codelist}
                hidden={true}
              />
              <div>
                <span className="form-helptext">
                  Code list that being used as code of value. The code is in bracket.
                  Example: Male (m), the value that expected for indicator is 'm'.
                </span>
              </div>
            </div> : (
              <Fragment>
                <div className="BasicFormSection">
                  <div>
                    <label className="form-label">Min value</label>
                  </div>
                  <span className="form-input">
                  <input
                    type="number" name="min_value"
                    value={indicatorData.min_value}
                    onChange={evt => {
                      indicatorData.min_value = evt.target.value
                      const min = parseFloat(indicatorData.min_value)
                      const max = parseFloat(indicatorData.max_value)
                      if (!isNaN(min) && !isNaN(min)) {
                        if (min > max) {
                          indicatorData.max_value = indicatorData.min_value
                        }
                      }
                      setIndicatorData({ ...indicatorData })
                    }}
                  />
                </span>
                </div>
                <div className="BasicFormSection">
                  <div>
                    <label className="form-label">Max value</label>
                  </div>
                  <span className="form-input">
                  <input
                    type="number" name="max_value"
                    value={indicatorData.max_value}
                    onChange={evt => {
                      indicatorData.max_value = evt.target.value
                      const min = parseFloat(indicatorData.min_value)
                      const max = parseFloat(indicatorData.max_value)
                      if (!isNaN(min) && !isNaN(min)) {
                        if (min > max) {
                          indicatorData.min_value = indicatorData.max_value
                        }
                      }
                      setIndicatorData({ ...indicatorData })
                    }}/>
                </span>
                </div>
              </Fragment>
            )
        }
        <div className='RuleTable-Title'>Color Rule</div>
        <IndicatorRules
          indicatorRules={indicatorRules} indicatorData={indicatorData}/>
      </AdminForm>
    </Admin>
  );
}

render(IndicatorForm, store)