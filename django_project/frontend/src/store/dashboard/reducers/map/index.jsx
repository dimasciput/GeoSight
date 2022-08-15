/** MAP reducer */

export const MAP_ACTION_NAME = `MAP`;
export const MAP_CHANGE_BASEMAP = `MAP/CHANGE_BASEMAP`;
export const MAP_REFERENCE_LAYER_CHANGED = `MAP/REFERENCE_LAYER_CHANGED`;
export const MAP_ADD_CONTEXTLAYERS = `MAP/ADD_CONTEXTLAYERS`;
export const MAP_CENTER = `MAP/CENTER`;
export const MAP_EXTENT = `MAP/EXTENT`;
export const MAP_REMOVE_CONTEXTLAYERS = `MAP/REMOVE_CONTEXTLAYERS`;
export const MAP_REMOVE_CONTEXTLAYERS_ALL = `MAP/REMOVE_CONTEXTLAYERS_ALL`;

const mapInitialState = {
  referenceLayer: null,
  basemapLayer: null,
  contextLayers: {},
  center: null,
  extent: null
};

export default function mapReducer(state = mapInitialState, action) {
  if (action.name === MAP_ACTION_NAME) {
    switch (action.type) {
      case MAP_CHANGE_BASEMAP: {
        return {
          ...state,
          basemapLayer: action.payload
        }
      }
      case MAP_ADD_CONTEXTLAYERS: {
        const contextLayers = Object.assign({}, state.contextLayers);
        contextLayers[action.id] = {
          'render': true,
          'layer': action.payload
        }
        return {
          ...state,
          contextLayers: contextLayers
        }
      }
      case MAP_REMOVE_CONTEXTLAYERS: {
        const contextLayers = Object.assign({}, state.contextLayers);
        if (contextLayers[action.id]) {
          delete contextLayers[action.id]
        }
        return {
          ...state,
          contextLayers: contextLayers
        }
      }
      case MAP_REMOVE_CONTEXTLAYERS_ALL: {
        return {
          ...state,
          contextLayers: {}
        }
      }
      case MAP_REFERENCE_LAYER_CHANGED: {
        return {
          ...state,
          referenceLayer: action.payload
        }
      }
      case MAP_CENTER: {
        return {
          ...state,
          center: action.payload
        }
      }
      case MAP_EXTENT: {
        return {
          ...state,
          extent: action.payload
        }
      }
    }
  }
  return state
}
