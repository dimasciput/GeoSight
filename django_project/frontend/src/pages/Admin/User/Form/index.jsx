import React, { useEffect, useState } from 'react';
import $ from "jquery";

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

  // If role is super admin, show the is_staff
  useEffect(() => {
    $('input[name="role"]').change(function () {
      roleOnChange($(this).val())
    })
    $('input[name="role"]').trigger('change')
  }, [])

  const roleOnChange = (value) => {
    if (value === 'Super Admin') {
      $('input[name="is_staff"]').closest('.BasicFormSection').show()
    } else {
      $('input[name="is_staff"]').closest('.BasicFormSection').hide()
    }
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

      <AdminForm isSubmitted={submitted} onChanges={{
        'role': roleOnChange
      }}/>
    </Admin>
  );
}

render(UserForm, store)