import React, { Fragment, useState } from 'react';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import Harvesters from '../../Harvesters'

import './style.scss';


/**
 * ExposedAPI App
 */
export default function HarvesterApiGeographyAndDate() {
  const [attributes, setAttributes] = useState(JSON.parse(JSON.stringify(attributesData)))

  return (
    <Fragment>
      <Harvesters
        has_indicator={true}
        is_harvester={true}
        attributes={attributes}
        setAttributes={setAttributes}/>
    </Fragment>
  );
}


render(HarvesterApiGeographyAndDate, store)