/* ==========================================================================
   MAP PLUGIN
   ========================================================================== */

import React from 'react';

export function PluginChild({ title, disabled, active, children, ...props }) {
  return <div
    className={'ToolbarChild ' + (disabled ? "Disabled " : "") + (active ? "Active " : "")}>
    <a href="#" title={title} {...props}>
      {children}
    </a>
  </div>
}

export function Plugin({ className, children }) {
  return <div
    className={"ToolbarControl " + (className ? className : "")}>
    {children}
  </div>
}