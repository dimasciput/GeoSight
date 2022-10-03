import { APIReducer } from "../../../reducers_api";

/**
 * INDICATORS_DATA reducer
 */

export const INDICATORS_DATA_ACTION_NAME = 'INDICATORS_DATA';
export const INDICATORS_DATA_ACTION_TYPE_STYLE = 'INDICATORS_DATA/UPDATE_STYLE';

const initialState = {}
export default function IndicatorsDataReducer(state = initialState, action) {
  if (action.name === INDICATORS_DATA_ACTION_NAME) {
    switch (action.type) {
      case INDICATORS_DATA_ACTION_TYPE_STYLE: {
        const { id, rules } = action
        const data = state[id]?.data
        if (data && Object.keys(data).length !== 0) {
          // Update the style and label
          let otherDataRule = null
          if (rules) {
            otherDataRule = rules.filter(
              rule => rule.active
            ).find(rule => rule.rule.toLowerCase() === 'other data')
          }
          data.forEach(function (data) {
            const filteredRules = rules.filter(rule => {
              const ruleStr = rule.rule.replaceAll('x', data.value).replaceAll('and', '&&').replaceAll('or', '||')
              try {
                return eval(ruleStr)
              } catch (err) {
                return false
              }
            })
            let style = filteredRules[0]
            style = style ? style : otherDataRule;
            data.style = style
            data.label = style?.name
          })

          const newState = {
            ...state,
          }
          newState[id].data = data
          return newState
        }
        return state
      }
      default: {
        const data = APIReducer(state, action, INDICATORS_DATA_ACTION_NAME)
        const { id, reporting_levels } = action
        data.reporting_levels = reporting_levels
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