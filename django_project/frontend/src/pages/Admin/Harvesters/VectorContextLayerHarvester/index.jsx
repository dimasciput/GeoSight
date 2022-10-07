import React, { Fragment, useEffect, useRef, useState } from 'react';
import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import Harvesters from '../../Harvesters';
import { fetchJSON } from "../../../../Requests";

// COMPONENTS
import Filter from "./Filter"
import Aggregation from "./Aggregation"
import SpatialOperator from "./SpatialOperator"
import TestConfiguration from "./TestConfiguration"

import './style.scss';

/**
 * VectorContextLayer App
 */
export default function VectorContextLayerHarvester() {
  const originalAttributes = JSON.parse(JSON.stringify(attributesData))
  originalAttributes.map(attr => {
    if (attr.name === "spatial_operator" && !attr.value) {
      attr.value = formDefinitions.spatial_method[0].value
    }
    if (attr.name === "aggregation" && !attr.value) {
      attr.value = formDefinitions.aggregation_count
    }
    if (attr.name === "context_layer_id") {
      if (!attr.value) {
        attr.value = attr.options[0].value
      } else {
        attr.value = parseInt(attr.value)
      }
    }
  })

  const [attributes, setAttributes] = useState(originalAttributes)

  const [contextLayer, setContextLayer] = useState(null)
  const [contextLayerFields, setContextLayerFields] = useState(null)
  const prevState = useRef();
  prevState.attributes = '';

  const filterAttr = attributes.find(
    attr => attr.name === 'filter'
  )
  const spatialAttr = attributes.find(
    attr => attr.name === 'spatial_operator'
  )
  const aggregationAttr = attributes.find(
    attr => attr.name === 'aggregation'
  )

  useEffect(() => {
    const contextLayerInput = attributes.find(attr => attr.name === "context_layer_id")
    let contextLayerSelected = contextLayerInput.options.find(
      input => input.id === contextLayerInput.value
    )
    if (contextLayerSelected === undefined) {
      contextLayerSelected = contextLayerInput.options[0]
    }
    setContextLayer(contextLayerSelected)
    prevState.attributes = attributes
  }, [attributes]);

  useEffect(() => {
    setContextLayerFields(null);
    if (contextLayer) {
      (
        async () => {
          const contextLayerData = await fetchJSON(
            contextLayer.url + '?f=json'
          )
          setContextLayerFields(contextLayerData.fields)
        }
      )()
    }
  }, [contextLayer]);

  return (
    <Fragment>
      <Harvesters
        has_indicator={true}
        is_harvester={true}
        attributes={attributes}
        setAttributes={setAttributes}
        excludedAttributes={
          ['aggregation', 'spatial_operator', 'filter']
        }
      >
        <Fragment>
          <Filter
            attribute={filterAttr} attributes={attributes}
            setAttributes={setAttributes}
            fields={contextLayerFields}
          />
          <SpatialOperator
            attribute={spatialAttr} attributes={attributes}
            setAttributes={setAttributes}
          />
          <Aggregation
            attribute={aggregationAttr} attributes={attributes}
            setAttributes={setAttributes}
            fields={contextLayerFields}
          />
          <TestConfiguration attributes={attributes}/>
        </Fragment>
      </Harvesters>
    </Fragment>
  );
}


render(VectorContextLayerHarvester, store)