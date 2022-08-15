/* ==========================================================================
   ON OFF SWITCHER
   ========================================================================== */

import React from 'react';
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

import './style.scss';

const Switcher = styled(Switch)(({ theme }) => ({}));

export default function OnOffSwitcher({ ...props }) {
  return <FormControlLabel
    className='OnOffSwitcher'
    control={<Switcher/>}
    {...props}
  />
}