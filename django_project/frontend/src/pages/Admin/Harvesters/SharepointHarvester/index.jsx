import React, { useState } from 'react';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import Harvesters from '../../Harvesters'

import './style.scss';

/**
 * SharepointHarvester App
 */
export default function SharepointHarvester() {
  const [attributes, setAttributes] = useState(attributesData);

  return (
    <Harvesters
      has_indicator={false}
      is_harvester={true}
      attributes={attributes}
      setAttributes={setAttributes}/>
  );
}


render(SharepointHarvester, store)