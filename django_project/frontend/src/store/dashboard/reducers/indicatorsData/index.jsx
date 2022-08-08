import { APIReducer } from "../../../reducers_api";

/**
 * INDICATORS_DATA reducer
 */

export const INDICATORS_DATA_ACTION_NAME = 'INDICATORS_DATA';

const initialState = {}
export default function IndicatorsDataReducer(state = initialState, action) {
  if (action.name === INDICATORS_DATA_ACTION_NAME) {
    switch (action.type) {
      default: {
        const data = APIReducer(state, action, INDICATORS_DATA_ACTION_NAME)
        const { id, reporting_level } = action
        data.reporting_level = reporting_level
        if (Object.keys(data).length !== 0) {
          data.id = id;
          const newState = {
            ...state,
          }
          newState[id] = data
          return newState
        }
      }
    }
  }
  return state
}