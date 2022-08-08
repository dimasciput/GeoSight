import React, { Fragment, useState, useEffect } from 'react';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import Harvesters from '../../Harvesters'
import JsonSelector from "../../../../components/JsonSelector";

import './style.scss';


/**
 * ExposedAPI App
 */
export default function HarvesterApiGeographyAndDate() {
  const [attributes, setAttributes] = useState(
    JSON.parse(JSON.stringify(attributesData))
  )
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState(null)
  const [onload, setOnload] = useState(true)

  // Update url when the attributes changed
  useEffect(() => {
    const newUrl = attributes.filter(attr => {
      return attr.name === "api_url"
    })[0]?.value

    setUrl(newUrl)
  }, [attributes])

  // Show api response modal when url changed
  useEffect(() => {
    if (!onload) {
      if (url) {
        setOpen(true)
      }
    }
    setOnload(false)
  }, [url])

  const setInputAttributes = (attributes) => {
    setAttributes(attributes)
    setOpen(false)
  }

  return (
    <Fragment>
      <Harvesters
        has_indicator={true}
        is_harvester={true}
        attributes={attributes}
        setAttributes={setAttributes}/>
      <JsonSelector
        open={open} setOpen={setOpen} url={url}
        inputAttributes={JSON.parse(JSON.stringify(attributes))}
        setInputAttributes={setInputAttributes}/>
    </Fragment>
  );
}


render(HarvesterApiGeographyAndDate, store)