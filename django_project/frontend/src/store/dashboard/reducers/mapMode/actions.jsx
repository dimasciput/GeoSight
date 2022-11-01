import {
  MAP_MODE_ACTION_NAME,
  MAP_MODE_ACTION_TYPE_COMPARE_CHANGE,
} from './index'

/**
 * Change compare mode.
 */
export function changeCompareMode() {
  return {
    name: MAP_MODE_ACTION_NAME,
    type: MAP_MODE_ACTION_TYPE_COMPARE_CHANGE
  };
}

export default {
  changeCompareMode
}