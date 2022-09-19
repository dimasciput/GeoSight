import React, { useState } from 'react';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { SaveButton } from "../../../../components/Elements/Button";
import Admin, { pageNames } from '../../index';
import AdminForm from '../../Components/Form'

import './style.scss';


/**
 * Indicator Form App
 */
export default function UserForm() {
  const [submitted, setSubmitted] = useState(false);

  /** Render **/
  const submit = () => {
    setSubmitted(true)
  }

  return (
    <Admin
      pageName={pageNames.Users}
      rightHeader={
        <SaveButton
          variant="secondary"
          text="Submit"
          onClick={submit}
          disabled={submitted ? true : false}
        />
      }>

      <AdminForm isSubmitted={submitted}/>
    </Admin>
  );
}

render(UserForm, store)