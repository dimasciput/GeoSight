import React, { useState } from 'react';

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
  const submit = () => {
    setSubmitted(true)
  }

  return (
    <Admin
      className='Indicator'
      pageName={pageNames.Indicators}
      rightHeader={
        <SaveButton
          variant="secondary"
          text="Submit"
          onClick={submit}
          disabled={submitted ? true : false}
        />
      }>

      <AdminForm isSubmitted={submitted}>
        <div className='RuleTable-Title'>Color Rule</div>
        <IndicatorRules indicatorRules={indicatorRules}/>
      </AdminForm>
    </Admin>
  );
}

render(IndicatorForm, store)