/**
 * SELECTED_INDICATOR reducer
 */

export const SELECTED_BOOKMARK_NAME = 'BOOKMARK';
export const SELECTED_BOOKMARK_TYPE_CHANGE = 'BOOKMARK/ADD';

const initialState = 'Default'
export default function selectedBookmarkReducer(state = initialState, action) {
  if (action.name === SELECTED_BOOKMARK_NAME) {
    switch (action.type) {
      case SELECTED_BOOKMARK_TYPE_CHANGE: {
        return action.payload
      }
    }
  }
  return state
}