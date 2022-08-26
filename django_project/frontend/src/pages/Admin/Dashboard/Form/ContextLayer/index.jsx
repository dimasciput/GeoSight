import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import ColorLensIcon from '@mui/icons-material/ColorLens';

import { Actions } from "../../../../../store/dashboard";
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../../components/Modal";
import {
  SaveButton,
  ThemeButton
} from "../../../../../components/Elements/Button";
import ListForm from '../ListForm'
import StyleConfig from '../../../ContextLayer/StyleConfig'

import './style.scss';

/**
 * Context Layer Style
 */
function ContextLayerStyle({ contextLayer }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(false);

  useEffect(() => {
    setData(JSON.parse(JSON.stringify(contextLayer)))
  }, [open])

  /** Apply the data **/
  const apply = () => {
    dispatch(Actions.ContextLayers.updateStyle(data))
    setOpen(false)
  }

  /** Update data **/
  const updateData = (newData) => {
    if (JSON.stringify(newData) !== JSON.stringify(data)) {
      setData(newData)
    }
  }

  return (
    <Fragment>
      <Modal
        className='BasicForm ContextLayerStyleModal MuiBox-Large'
        open={open}
        onClosed={() => {
          setOpen(false)
        }}
      >
        <ModalHeader onClosed={() => {
          setOpen(false)
        }}>
          Style for {contextLayer.name}
        </ModalHeader>
        <ModalContent>
          <div className='Header'>
            <SaveButton
              variant="secondary"
              text={"Apply Changes"}
              disabled={
                JSON.stringify(contextLayer) === JSON.stringify(data)
              }
              onClick={apply}/>
          </div>
          {
            open ? <StyleConfig data={data} setData={updateData}/> : ""

          }
        </ModalContent>
      </Modal>
      <ThemeButton className='ContextLayerStyleButton' onClick={() => {
        setOpen(true)
      }}>
        <ColorLensIcon/> Style
      </ThemeButton>
    </Fragment>
  )
}

/**
 * Context Layer dashboard
 */
export default function ContextLayerForm() {
  const dispatch = useDispatch()
  const { contextLayers } = useSelector(state => state.dashboard.data);
  return <ListForm
    pageName={'Context Layers'}
    data={contextLayers}
    listUrl={urls.api.contextLayerListAPI}
    addLayerAction={(layer) => {
      dispatch(Actions.ContextLayers.add(layer))
    }}
    removeLayerAction={(layer) => {
      dispatch(Actions.ContextLayers.remove(layer))
    }}
    changeLayerAction={(layer) => {
      dispatch(Actions.ContextLayers.update(layer))
    }}
    rearrangeLayersAction={(payload) => {
      dispatch(Actions.ContextLayers.rearrange(payload))
    }}
    otherActionsFunction={(contextLayer) => {
      return <ContextLayerStyle contextLayer={contextLayer}/>
    }}
  />
}