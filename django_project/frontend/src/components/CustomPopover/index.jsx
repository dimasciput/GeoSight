/* ==========================================================================
   POPOVER
   ========================================================================== */

import React, { Fragment, useState } from 'react';
import Popover from '@mui/material/Popover';

import './style.scss';

/**
 * Popover component
 * @param {dict} anchorOrigin anchorOrigin prop.
 * @param {dict} transformOrigin transformOrigin prop.
 * @param {React.Component} Button The button that will be used as the anchor.
 * @param {React.Component} children React component to be rendered
 */
export default function CustomPopover(
  { anchorOrigin, transformOrigin, Button, children }
) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <Fragment>
      {React.cloneElement(Button, {
        "aria-describedby": id,
        onClick: handleClick
      })}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        className={anchorOrigin.horizontal}
      >
        {children}
      </Popover>
    </Fragment>
  );
}

