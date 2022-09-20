import {
  SELECTED_ADMIN_LEVEL_ACTION_TYPE_CHANGE,
  SELECTED_ADMIN_LEVEL_NAME,
} from './index'

/**
 * Change admin level.
 * @param {object} payload Admin level data.
 */
export function change(payload) {
  return {
    name: SELECTED_ADMIN_LEVEL_NAME,
    type: SELECTED_ADMIN_LEVEL_ACTION_TYPE_CHANGE,
    payload: payload
  };
}

export default {
  change
}