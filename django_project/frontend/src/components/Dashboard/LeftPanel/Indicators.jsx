/* ==========================================================================
   REFERENCE LAYER
   ========================================================================== */

import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Checkbox } from "@mui/material";
import Actions from '../../../redux/actions/actions'
import ReferenceLayer from '../Map/ReferenceLayer'
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from '@mui/material/AccordionDetails';
import Accordion from "@mui/material/Accordion";

/**
 * Indicators selector
 */
export function Indicators() {
  const dispatch = useDispatch();
  const [currentIndicator, setCurrentIndicator] = useState(null);
  const {
    indicators,
    referenceLayer
  } = useSelector(state => state.dashboard.data);

  const change = (checked, id) => {
    if (checked) {
      setCurrentIndicator(id);
    } else {
      setCurrentIndicator(null);
    }
  };

  // Get indicator data
  useEffect(() => {
    if (indicators && referenceLayer && referenceLayer.data) {
      indicators.forEach(function (indicator, idx) {
        if (!indicator.data) {
          Actions.Indicator.fetch(dispatch, idx, indicator.url)
        }
      })
    }
  }, [indicators, referenceLayer]);

  // Get celected indicator data
  let selectedIndicatorData = null;
  if (indicators && indicators[currentIndicator]) {
    selectedIndicatorData = indicators[currentIndicator].data;
  }

  return (
    <Fragment>
      {
        indicators !== undefined ?
          indicators.map(
            (layer, idx) => (
              <div className='dashboard__left_side__row'
                   key={idx}>
                <Checkbox
                  checked={currentIndicator === idx}
                  onChange={() => {
                    change(event.target.checked, idx)
                  }}/>
                <div className='text title'>
                  <div>{layer.name}</div>
                </div>
              </div>
            )
          )
          : <div>Loading</div>
      }
      <ReferenceLayer indicatorData={selectedIndicatorData}/>
    </Fragment>
  )
}

/**
 * Indicators selector
 * @param {bool} expanded Is the accordion expanded
 * @param {function} handleChange Function when the accordion show
 */
export default function IndicatorsAccordion({ expanded, handleChange }) {
  const { indicators } = useSelector(state => state.dashboard.data);
  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange('indicators')}
    >

      <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
        <div>
          Indicators
          {
            indicators !== undefined ?
              <span>&nbsp;({indicators.length}) </span> :
              <i>&nbsp;(Loading)</i>
          }
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <Indicators/>
      </AccordionDetails>
    </Accordion>
  )
}