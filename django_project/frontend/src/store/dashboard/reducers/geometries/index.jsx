/**
 * INDICATOR reducer
 */

export const GEOMETRIES_ACTION_NAME = 'GEOMETRIES';
export const GEOMETRIES_ACTION_TYPE_ADD = 'GEOMETRIES/ADD';

const initialState = {}
export default function geometriesReducer(state = initialState, action) {
  if (action.name === GEOMETRIES_ACTION_NAME) {
    switch (action.type) {
      case GEOMETRIES_ACTION_TYPE_ADD: {
        const { key, value } = action
        const level = value.level
        if (!state[level] || !state[level][key]) {
          const newState = Object.assign({}, state)
          if (!state[level]) {
            newState[level] = {}
          }
          newState[level][key] = value
          return newState
        }
      }
    }
  }
  return state
}