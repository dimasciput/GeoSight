import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import ColorLensIcon from '@mui/icons-material/ColorLens';

import {
  SaveButton,
  ThemeButton
} from "../../../../../components/Elements/Button";
import { Actions } from "../../../../../store/dashboard";
import Modal, { ModalHeader } from "../../../../../components/Modal";
import IndicatorRules from '../../../Indicator/Form/IndicatorRule'
import ListForm from '../ListForm'

import './style.scss';

function IndicatorStyle({ indicator }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [indicatorRules, setIndicatorRules] = useState([]);

  useEffect(() => {
    if (open) {
      setIndicatorRules(JSON.parse(JSON.stringify(indicator.rules)))
    }
  }, [open])

  const onRulesChanged = (rules) => {
    if (JSON.stringify(rules) !== JSON.stringify(indicatorRules)) {
      setIndicatorRules(JSON.parse(JSON.stringify(rules)))
    }
  }

  const apply = () => {
    indicator.rules = indicatorRules
    dispatch(Actions.Indicators.update(indicator))
    setOpen(false)
  }

  return (
    <Fragment>
      <Modal
        className='IndicatorRuleForm'
        open={open}
        onClosed={() => {
          setOpen(false)
        }}
      >
        <ModalHeader onClosed={() => {
          setOpen(false)
        }}>
          Style for {indicator.name}
        </ModalHeader>
        <div className='RuleModal'>
          <div className='RuleModalApply'>
            <div className='Separator'/>
            <SaveButton
              variant="secondary"
              text={"Apply Changes"}
              disabled={
                JSON.stringify(indicator.rules) === JSON.stringify(indicatorRules)
              }
              onClick={apply}/>
          </div>
          <IndicatorRules
            indicatorRules={JSON.parse(JSON.stringify(indicatorRules))}
            onRulesChanged={onRulesChanged}/>
        </div>
      </Modal>
      <ThemeButton className='IndicatorStyleButton' onClick={() => {
        setOpen(true)
      }}>
        <ColorLensIcon/> Style
      </ThemeButton>
    </Fragment>
  )
}

/**
 * Basemaps dashboard
 */
export default function IndicatorsForm() {
  const dispatch = useDispatch();
  const { indicators } = useSelector(state => state.dashboard.data);
  return <ListForm
    pageName={'Indicators'}
    data={indicators}
    listUrl={urls.api.indicatorListAPI}
    addLayerAction={(layer) => {
      dispatch(Actions.Indicators.add(layer))
    }}
    removeLayerAction={(layer) => {
      dispatch(Actions.Indicators.remove(layer))
    }}
    changeLayerAction={(layer) => {
      dispatch(Actions.Indicators.update(layer))
    }}
    rearrangeLayersAction={(payload) => {
      dispatch(Actions.Indicators.rearrange(payload))
    }}
    otherActionsFunction={(indicator) => {
      return <IndicatorStyle indicator={indicator}/>
    }}
  />
}