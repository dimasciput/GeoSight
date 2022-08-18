import React, { Fragment, useEffect, useState } from 'react';
import $ from 'jquery';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import {
  SaveButton,
  ThemeButton
} from "../../../../components/Elements/Button";
import Admin, { pageNames } from '../../index';
import AdminForm from '../../Components/Form'
import StyleConfig from '../StyleConfig'

import './style.scss';

export function ContextLayerConfig() {
  const [data, setData] = useState({});

  const setDataFn = () => {
    const formData = data
    $('.BasicForm').find('input').each(function () {
      const name = $(this).attr('name');
      if (name) {
        formData[name] = $(this).val()
      }
    })
    if (formData['data_fields']) {
      formData['data_fields'] = JSON.parse(formData['data_fields'])
    }
    if (formData['styles']) {
      formData['styles'] = JSON.parse(formData['styles'])
    }
    formData['parameters'] = formData['parameters'] ? formData['parameters'] : {}
    setData(JSON.parse(JSON.stringify(formData)))
  }

  useEffect(() => {
    setDataFn()
    $('.BasicForm').find('input').each(function () {
      $(this).change(() => {
        setDataFn()
      })
    })
  }, [])

  const updateData = (newData) => {
    if (JSON.stringify(newData) !== JSON.stringify(data)) {
      setData(newData)
      $('*[name="data_fields"]').val(JSON.stringify(newData['data_fields']))
      $('*[name="styles"]').val(JSON.stringify(newData['styles']))
    }
  }

  return <Fragment>
    <StyleConfig data={data} setData={updateData}/>
  </Fragment>
}

/**
 * Indicator Form App
 */
export default function ContextLayerForm() {
  const [submitted, setSubmitted] = useState(false);

  /** Render **/
  const submit = () => {
    setSubmitted(true)
  }
  return (
    <Admin
      pageName={pageNames.ContextLayer}
      rightHeader={
        <SaveButton
          variant="secondary"
          text="Submit"
          onClick={submit}
          disabled={submitted ? true : false}
        />
      }>

      <AdminForm isSubmitted={submitted}>
        <ContextLayerConfig/>
      </AdminForm>
    </Admin>
  );
}

render(ContextLayerForm, store)