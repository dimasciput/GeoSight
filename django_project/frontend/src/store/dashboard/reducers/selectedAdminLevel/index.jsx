/**
 * SELECTED_ADMIN_LEVEL reducer
 */

export const SELECTED_ADMIN_LEVEL_NAME = 'SELECTED_ADMIN_LEVEL';
export const SELECTED_ADMIN_LEVEL_ACTION_TYPE_CHANGE = 'SELECTED_ADMIN_LEVEL/ADD';

const initialState = {}
export default function selectedAdminLevelReducer(state = initialState, action) {
  if (action.name === SELECTED_ADMIN_LEVEL_NAME) {
    switch (action.type) {
      case SELECTED_ADMIN_LEVEL_ACTION_TYPE_CHANGE: {
        return {
          ...action.payload
        }
      }
    }
  }
  return state
}