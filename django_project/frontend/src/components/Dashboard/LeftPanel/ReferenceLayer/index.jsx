/* ==========================================================================
   Context Layers SELECTOR
   ========================================================================== */

import React from 'react';
import { useSelector } from "react-redux";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Accordion from "@mui/material/Accordion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function ReferenceLayerSection({ expanded, handleChange }) {
  const { referenceLayer } = useSelector(state => state.dashboard.data)
  const referenceLayerData = useSelector(state => state.referenceLayerData)
  const data = referenceLayerData[referenceLayer.identifier]

  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange('referenceLayer')}
      className='reference-dataset'
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
        <div className='MuiAccordionSummary-title'>
          Reference Dataset
          <div className={'MuiAccordionSummary-title-desc'}>
            {
              data && data.fetched ?
                data.error ?
                  <div className='error'>
                    {data.error.toString()}
                  </div> :
                  <div>
                    {
                      data.data.name ?
                        <div>
                          <b>Name :</b> {data.data.name}
                        </div> : ''
                    }
                  </div>
                :
                <div>Loading</div>
            }
          </div>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        {
          data && data.fetched ?
            data.error ?
              <div className='error'>
                {data.error.toString()}
              </div> :
              <div>
                {
                  data.data.description ?
                    <div>
                      <b>Description :</b> {data.data.description}
                    </div> : ''
                }
                {
                  data.data.source ?
                    <div>
                      <b>Source :</b> {data.data.source}
                    </div> : ''
                }
                {
                  data.data.last_update ?
                    <div>
                      <div>
                        <b>Last
                          updates
                        </b>
                      </div>
                      <div> {new Date(data.data.last_update).toString()}</div>
                    </div> : ''
                }
              </div>
            :
            <div>Loading</div>
        }
      </AccordionDetails>
    </Accordion>
  )
}
