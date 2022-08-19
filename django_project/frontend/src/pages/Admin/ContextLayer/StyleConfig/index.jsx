import React, { Fragment, useEffect, useState } from 'react';
import MapConfig from './Map'
import ArcgisConfig from './Arcgis'
import { useDispatch } from "react-redux";
import {
  getLayer
} from '../../../../components/Dashboard/LeftPanel/ContextLayers/Layer'

import './style.scss';


/**
 * Indicator Form App
 * @param {dict} data Data of context layer.
 * @param {boolean} checkConfig Checking config.
 */
export default function StyleConfig({ data, setData }) {
  const dispatch = useDispatch();
  const [layer, setLayer] = useState(null);
  const [error, setError] = useState(null);
  const [legend, setLegend] = useState(null);

  const [layerData, setLayerData] = useState(null);
  const [layerDataClass, setLayerDataClass] = useState(null);
  const [tab, setTab] = useState(data.layer_type === 'ARCGIS' ? 'FIELDS' : 'MAP');

  useEffect(() => {
    setLayer(null)
    setError(null)
    setLegend(null)
    setLayerDataClass(null)

    if (!layerDataClass || tab === 'MAP') {
      const layerDataOut = getLayer(data, setLayer, setLegend, setError, dispatch);
      if (layerDataOut) {
        setLayerDataClass(layerDataOut)
      }
    }
  }, [data, tab]);

  useEffect(() => {
    if (layerDataClass) {
      setLayerData(layerDataClass)
    }
  }, [layer, error, legend]);


  return (
    <div className={'ContextLayerConfig-Wrapper ' + tab}>
      <div className='form-helptext'>
        Below is for checking the configuration, overriding style and updating
        popup.
      </div>
      {
        error ?
          <div className='error'>{error.toString()}</div>
          : ""
      }

      {/* FOR CONFIG */}
      <div className='ContextLayerConfig-Tab'>
        <div
          onClick={() => {
            setTab('MAP')
          }}
          className={tab === 'MAP' ? 'Selected' : ""}
        >MAP
        </div>
        {
          data.layer_type === 'ARCGIS' ?
            <Fragment>
              <div
                onClick={() => {
                  setTab('FIELDS')
                }}
                className={tab === 'FIELDS' ? 'Selected' : ""}
              >FIELDS & LABELS
              </div>
              <div
                onClick={() => {
                  setTab('STYLES')
                }}
                className={tab === 'STYLES' ? 'Selected' : ""}
              >STYLES
              </div>
            </Fragment> : ""
        }
      </div>
      <div id='ContextLayerConfig' className="BasicFormSection">
        {
          tab === 'MAP' ?
            <div className='MapWrapper MAP'>
              <div className='legend'>
                <div className='title'><b className='light'>Legend</b></div>
                {
                  legend ?
                    <div
                      dangerouslySetInnerHTML={{ __html: legend }}></div> : ""
                }
              </div>
              <MapConfig layerInput={layer}/>
            </div> : ""
        }
        {
          data.layer_type === 'ARCGIS' ?
            <ArcgisConfig originalData={data} setData={setData}
                          ArcgisData={layerData}/> : ""
        }
      </div>
    </div>
  )
}