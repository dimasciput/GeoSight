/* ==========================================================================
   MAP PLUGIN
   ========================================================================== */

import React from 'react';

export function PluginChild({ title, children, ...props }) {
  return <a href="#" title={title} {...props}>
    {children}
  </a>
}

export function Plugin({ children }) {
  return <div className="leaflet-control-navbar leaflet-bar leaflet-control">
    {children}
  </div>
}