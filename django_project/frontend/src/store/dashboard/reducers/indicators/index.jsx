/**
 * INDICATOR reducer
 */

export const INDICATOR_ACTION_NAME = 'INDICATOR';
export const INDICATOR_ACTION_TYPE_ADD = 'INDICATOR/ADD';
export const INDICATOR_ACTION_TYPE_REMOVE = 'INDICATOR/REMOVE';
export const INDICATOR_ACTION_TYPE_UPDATE = 'INDICATOR/UPDATE';
export const INDICATOR_ACTION_TYPE_REARRANGE = 'INDICATOR/REARRANGE';
// export const INDICATOR_ACTION_TYPE_REARRANGE_TREE = 'INDICATOR/REARRANGE_UPDATE_TREE';

const initialState = []
export default function indicatorReducer(state = initialState, action) {
  switch (action.type) {
    case INDICATOR_ACTION_TYPE_ADD: {
      if (state.length === 0) {
        action.payload.visible_by_default = true
      }
      return [
        ...state,
        action.payload
      ]
    }

    case INDICATOR_ACTION_TYPE_REMOVE: {
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
    case INDICATOR_ACTION_TYPE_UPDATE: {
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
    case INDICATOR_ACTION_TYPE_REARRANGE: {
      let newState = []
      for (const [groupName, groupValue] of Object.entries(action.payload)) {
        for (const value of groupValue) {
          state.forEach(function (indicator) {
            if (indicator.id === value.data.id) {
              indicator.order = value.data.order;
              newState.push(indicator)
            }
          })
        }
      }
      return newState
    }
    default:
      return state
  }
}