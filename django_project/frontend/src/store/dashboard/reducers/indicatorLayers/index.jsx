/**
 * INDICATOR_LAYERS LAYERS reducer
 */

export const INDICATOR_LAYERS_ACTION_NAME = 'INDICATOR_LAYERS';
export const INDICATOR_LAYERS_ACTION_TYPE_ADD = 'INDICATOR_LAYERS/ADD';
export const INDICATOR_LAYERS_ACTION_TYPE_REMOVE = 'INDICATOR_LAYERS/REMOVE';
export const INDICATOR_LAYERS_ACTION_TYPE_UPDATE = 'INDICATOR_LAYERS/UPDATE';
export const INDICATOR_LAYERS_ACTION_TYPE_REARRANGE = 'INDICATOR_LAYERS/REARRANGE';

const initialState = []
export default function indicatorLayersReducer(state = initialState, action) {
  switch (action.type) {
    case INDICATOR_LAYERS_ACTION_TYPE_ADD: {
      action.payload.id = state.length === 0 ? 1 : Math.max(...state.map(layer => layer.id)) + 1
      if (state.length === 0) {
        action.payload.visible_by_default = true
      }
      return [
        ...state,
        action.payload
      ]
    }

    case INDICATOR_LAYERS_ACTION_TYPE_REMOVE: {
      const newState = []
      let noVisiblePayload = action.payload.visible_by_default;
      state.forEach(function (indicator) {
        if (indicator.id !== action.payload.id) {
          if (noVisiblePayload) {
            indicator.visible_by_default = true
            noVisiblePayload = false;
          }
          newState.push(indicator)
        }
      })
      return newState
    }
    case INDICATOR_LAYERS_ACTION_TYPE_UPDATE: {
      const newState = []
      state.forEach(function (indicator) {
        if (indicator.id === action.payload.id) {
          newState.push(action.payload)
        } else if (indicator.id !== action.payload.id) {
          if (action.payload.visible_by_default) {
            indicator.visible_by_default = false
          }
          newState.push(indicator)
        }
      })
      return newState
    }
    case INDICATOR_LAYERS_ACTION_TYPE_REARRANGE: {
      const newState = []
      let order = 0
      for (const [groupName, groupValue] of Object.entries(action.payload)) {
        groupValue.map(id => {
          const layer = state.filter(layerState => {
            return layerState.id === id
          })[0]
          if (layer) {
            layer.order = order
            layer.group = groupName
            newState.push(layer)
            order += 1;
          }
        })
      }
      return newState
    }
    default:
      return state
  }
}