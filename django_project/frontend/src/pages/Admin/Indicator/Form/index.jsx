import React, { Fragment, useState } from 'react';
import $ from 'jquery';

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
        <div className='RuleTable-Title'>Color Rule</div>
        <IndicatorRules indicatorRules={indicatorRules}/>
      </AdminForm>
    </Admin>
  );
}

render(IndicatorForm, store)