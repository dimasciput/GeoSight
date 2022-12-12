import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../../store/dashboard";
import ListForm from "../ListForm";
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../../components/Modal";
import IndicatorStyle from './IndicatorStyle'
import MultiIndicatorConfig from "./MultiIndicator";

import './style.scss';

const SingleIndicator = 'Single Indicator'
const MultiIndicator = 'Multi Indicator'

/**
 * Indicator Layer Type Selection
 * @param {boolean} open Is open or close.
 * @param {Function} setOpen Set Parent Open.
 * @param {Function} onSelected On selected data.
 */
export function IndicatorLayerConfig(
  { open, setOpen, onSelected }) {

  const onClosed = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <Modal
        open={open}
        onClosed={onClosed}
        className="ModalSelection"
      >
        <ModalHeader onClosed={onClosed}>
          Add new widget
        </ModalHeader>
        <ModalContent>
          <div
            className='ModalSelection-Option'
            onClick={() => {
              onSelected(SingleIndicator)
              onClosed()
            }}>
            <b className='light'>Single Indicator Layer</b>
            <div className='helptext'>
              Select multiple indicator on the list and turn each of it as
              single indicator layer.
            </div>
          </div>
          <div
            className='ModalSelection-Option'
            onClick={() => {
              onSelected(MultiIndicator)
              onClosed()
            }}>
            <b className='light'>Multi Indicators Layer</b>
            <div className='helptext'>
              Select 2 or more indicators and turn all of it as single
              indicator layer.
            </div>
          </div>
        </ModalContent>
      </Modal>
    </Fragment>
  )
}

/**
 * Indicator Layers Tab dashboard
 */
export default function IndicatorLayersForm() {
  const dispatch = useDispatch();
  const {
    indicators: dashboardIndicators, indicatorLayers
  } = useSelector(state => state.dashboard.data);
  const indicators = JSON.parse(JSON.stringify(dashboardIndicators))

  // Handling for create layer
  const [groupName, setGroupName] = useState(false)
  const [indicatorLayerConfigOpen, setIndicatorLayerConfigOpen] = useState(false)
  const [indicatorDataSelectionOpen, setIndicatorDataSelectionOpen] = useState(false)
  const [multiIndicatorStyleOpen, setMultiIndicatorStyleOpen] = useState(false)

  // When the indicator layer type selected
  const IndicatorLayerTypeSelection = (type) => {
    switch (type) {
      case SingleIndicator: {
        setIndicatorDataSelectionOpen(true)
        break
      }
      case MultiIndicator: {
        setMultiIndicatorStyleOpen(true)
        break
      }
    }
  }

  // Remove layer if the indicator is removed
  useEffect(() => {
    // const indicatorIds = indicators.map(indicator => indicator.id)
    // indicatorLayers.map(layer => {
    //   const indicators = layer.indicators.filter(
    //     indicator => indicatorIds.includes(indicator.id)
    //   )
    //   // If it is multi indicator and just remaining 1 indicator, remove it
    //   if (indicators.length === 1 && layer.indicators.length >= 2) {
    //     dispatch(Actions.IndicatorLayers.remove(layer))
    //   }
    //   if (indicators.length !== layer.indicators) {
    //     layer.indicators = indicators
    //   }
    //
    //   // delete or update
    //   if (layer.indicators.length === 0) {
    //     dispatch(Actions.IndicatorLayers.remove(layer))
    //   } else {
    //     dispatch(Actions.IndicatorLayers.update(layer))
    //   }
    // })
  }, [dashboardIndicators])

  /** Change indicator data format to indicator layer data. **/
  const indicatorToSingleIndicatorLayer = (layer) => {
    return {
      name: layer.name,
      visible_by_default: false,
      group: groupName,
      description: layer.description,
      rules: layer.rules,
      indicators: [{
        id: layer.id,
        name: layer.name,
        color: null
      }]
    }
  }

  const indicatorLayersData = indicatorLayers.map(layer => {
    if (layer.indicators.length === 1) {
      layer.trueId = layer.indicators[0].id
    } else {
      layer.trueId = -1
    }
    return layer
  })

  return <Fragment>
    <MultiIndicatorConfig
      multiIndicatorStyleOpen={multiIndicatorStyleOpen}
      setMultiIndicatorStyleOpen={setMultiIndicatorStyleOpen}
      indicators={indicators}
      onUpdate={
        (layer) => {
          layer.group = groupName
          dispatch(
            Actions.IndicatorLayers.add(
              JSON.parse(JSON.stringify(layer))
            )
          )
        }
      }/>
    <IndicatorLayerConfig
      open={indicatorLayerConfigOpen}
      setOpen={setIndicatorLayerConfigOpen}
      onSelected={IndicatorLayerTypeSelection}
    />
    <ListForm
      pageName={'Indicator Layers'}
      data={indicatorLayersData}
      defaultListData={indicators}
      addLayerAction={(layer) => {
        const layerFound = indicatorLayers.find(layerData => {
          return layerData.indicators.length === 1 && layerData.indicators[0].id === layer.id
        })
        if (!layerFound) {
          dispatch(
            Actions.IndicatorLayers.add(
              indicatorToSingleIndicatorLayer(layer)
            )
          )
        }
      }}
      removeLayerAction={(layer) => {
        if (layer.url === undefined) {
          dispatch(Actions.IndicatorLayers.remove(layer))
        } else {
          const layerFound = indicatorLayers.find(layerData => {
            return layerData.indicators.length === 1 && layerData.indicators[0].id === layer.id
          })
          if (layerFound) {
            dispatch(
              Actions.IndicatorLayers.remove(layerFound)
            )
          }
        }
      }}
      changeLayerAction={(layer) => {
        dispatch(Actions.IndicatorLayers.update(layer))
      }}
      rearrangeLayersAction={(payload) => {
        dispatch(Actions.IndicatorLayers.rearrange(payload))
      }}
      addLayerInGroupAction={(groupName) => {
        setGroupName(groupName)
        setIndicatorLayerConfigOpen(true)
      }}

      /* For data selection */
      openDataSelection={indicatorDataSelectionOpen}
      setOpenDataSelection={setIndicatorDataSelectionOpen}
      otherActionsFunction={(layer) => {
        if (layer.indicators.length === 1) {
          // If it is single indicator
          const indicator = indicators.find(indicatorData => {
            return indicatorData.id === layer.indicators[0].id
          })
          if (indicator) {
            return <div className='OtherActionFunctionsWrapper'>
              <div className='LayerCountIndicatorWrapper'>
                <div className='Separator'></div>
                <div className='LayerCountIndicator'>Single</div>
              </div>
              <IndicatorStyle indicator={indicator}/>
            </div>
          }
        } else {
          // If it is multi indicator
          return <div className='OtherActionFunctionsWrapper'>
            <div className='LayerCountIndicatorWrapper'>
              <div className='Separator'></div>
              <div className='LayerCountIndicator'>
                {layer.indicators.length + ' Layers'}
              </div>
            </div>
            <MultiIndicatorConfig
              indicators={indicators} indicatorLayer={layer} onUpdate={
              (layer) => {
                dispatch(Actions.IndicatorLayers.update(layer))
              }
            }/>
          </div>
        }
        return ""
      }}
    />
  </Fragment>
}