import React, { useState } from 'react';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import Harvesters from '../../Harvesters'

import './style.scss';


/**
 * ExposedAPI App
 */
export default function ExposedAPI() {
  const [attributes, setAttributes] = useState(attributesData);

  return (
    <Harvesters
      has_indicator={true}
      attributes={attributes}
      setAttributes={setAttributes}/>
  );
}


render(ExposedAPI, store)