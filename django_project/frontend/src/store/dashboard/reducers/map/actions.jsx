import {
  MAP_ACTION_NAME,
  MAP_ADD_CONTEXTLAYERS,
  MAP_CENTER,
  MAP_CHANGE_BASEMAP,
  MAP_CONTEXTLAYERS_SHOW,
  MAP_EXTENT,
  MAP_INDICATOR_SHOW,
  MAP_REFERENCE_LAYER_CHANGED,
  MAP_REMOVE_CONTEXTLAYERS,
  MAP_ZOOM
} from '../map'


/**
 * Change basemap.
 * @param {object} payload Basemap data.
 */
function changeBasemap(payload) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_CHANGE_BASEMAP,
    payload: payload
  };
}

/**
 * Change reference layer.
 * @param {object} payload Reference layer data.
 */
function changeReferenceLayer(payload) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_REFERENCE_LAYER_CHANGED,
    payload: payload
  };
}

/**
 * Add context layer.
 * @param {int} id ID of Context Layer.
 * @param {object} payload Context Layer data.
 */
function addContextLayer(id, payload) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_ADD_CONTEXTLAYERS,
    id: id,
    payload: payload,
  };
}

/**
 * Remove context layer.
 * @param {int} id ID of Context Layer.
 */
function removeContextLayer(id) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_REMOVE_CONTEXTLAYERS,
    id: id
  };
}

/**
 * Update center of map.
 */
function updateCenter(center) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_CENTER,
    payload: center
  };
}

/**
 * Update extent of map.
 */
function updateExtent(center) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_EXTENT,
    payload: center
  };
}

/**
 * Show/Hide Indicator
 */
function showHideIndicator(payload) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_INDICATOR_SHOW,
    payload: payload
  };
}

/**
 * Show/Hide ContextLayer
 */
function showHideContextLayer(payload) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_CONTEXTLAYERS_SHOW,
    payload: payload
  };
}

/**
 * Show/Hide ContextLayer
 */
function changeZoom(payload) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_ZOOM,
    payload: payload
  };
}

export default {
  updateCenter,
  changeBasemap,
  addContextLayer,
  removeContextLayer,
  changeReferenceLayer,
  updateExtent,
  showHideIndicator,
  showHideContextLayer,
  changeZoom,
}