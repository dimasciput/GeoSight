/* ==========================================================================
   Context Layers SELECTOR
   ========================================================================== */

import React from 'react';
import { useSelector } from "react-redux";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Accordion from "@mui/material/Accordion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MDEditor from "@uiw/react-md-editor";

export default function ProjectOverviewSection({ expanded, handleChange }) {
  const { description } = useSelector(state => state.dashboard.data)

  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange('projectOverview')}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
        <div className='MuiAccordionSummary-title'>
          Project Overview
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <MDEditor.Markdown
          source={description}
          linkTarget="_blank"
        />
      </AccordionDetails>
    </Accordion>
  )
}
