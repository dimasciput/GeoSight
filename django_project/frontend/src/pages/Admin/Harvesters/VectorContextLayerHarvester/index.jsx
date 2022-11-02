import React, { Fragment, useEffect, useRef, useState } from 'react';
import $ from "jquery";
import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { fetchJSON } from "../../../../Requests";
import Harvesters from '../../Harvesters';

// COMPONENTS
import Filter from "./Filter"
import Aggregation from "./Aggregation"
import SpatialOperator from "./SpatialOperator"
import TestConfiguration from "./TestConfiguration"
import { SaveButton } from "../../../../components/Elements/Button";

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

  const referenceLayerAttr = attributes.find(
    attr => attr.name === 'reference_layer'
  )
  const adminLevelAttr = attributes.find(
    attr => attr.name === 'admin_level'
  )
  const indicatorAttr = attributes.find(
    attr => attr.name === 'indicator'
  )
  const contextLayerIdAttr = attributes.find(
    attr => attr.name === 'context_layer_id'
  )
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

  /**
   * Change form action
   */
  const changeAction = (saveAs = false) => {
    const url = window.location.href.split('?')[0]
    if (saveAs) {
      $('.BasicForm').attr('action', url + '?save-as=true')
    } else {
      $('.BasicForm').attr('action', url)
    }
  }

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
        rightHeader={
          <Fragment>
            {
              harvester.id ?
                <SaveButton
                  variant="secondary"
                  text="Save As New"
                  type="submit"
                  onClick={() => {
                    changeAction(true)
                  }}
                  disabled={
                    referenceLayerAttr?.value === undefined ||
                    adminLevelAttr?.value === undefined ||
                    indicatorAttr?.value === undefined ||
                    contextLayerIdAttr?.value === undefined
                  }
                /> : ""
            }
            <SaveButton
              disabled={
                referenceLayerAttr?.value === undefined ||
                adminLevelAttr?.value === undefined ||
                indicatorAttr?.value === undefined ||
                contextLayerIdAttr?.value === undefined
              }
              variant="secondary"
              text="Submit"
              type="submit"
              onClick={() => {
                changeAction(false)
              }}
            />
          </Fragment>
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