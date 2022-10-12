import React, { Fragment, useEffect, useRef, useState } from 'react';
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import Checkbox from '@mui/material/Checkbox';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import SortableItem from '../../../Admin/Dashboard/Form/ListForm/SortableItem'
import { AddButton } from "../../../../components/Elements/Button";
import { arrayMove } from "../../../../utils/Array";

import './style.scss';

/**
 * Indicator Rule
 * @param {dict} rule Rule.
 * @param {int} idx Index.
 * @param {Function} onDelete OnDelete.
 * @param {Function} onChange OnChange.
 */
export function IndicatorRule({ rule, idx, onDelete, onChange }) {
  const ruleNameName = 'rule_name_' + idx;
  const ruleNameRule = 'rule_rule_' + idx;
  const ruleNameColor = 'rule_color_' + idx;
  const ruleNameOutlineColor = 'rule_outline_color_' + idx;

  const deleteRow = () => {
    onDelete(idx)
  }
  const [currentRule, setCurrentRule] = useState(null);
  const [name, setName] = useState(rule.name);
  const [ruleValue, setRuleValue] = useState(rule.rule);
  const [color, setColor] = useState(rule.color);
  const [outlineColor, setOutlineColor] = useState(rule.outline_color);


  const [equal, setEqual] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  // When the rule changed
  useEffect(() => {
    rule.name = name
    rule.rule = ruleValue
    rule.color = color
    rule.outline_color = outlineColor
    onChange()
  }, [name, ruleValue, color, outlineColor])

  // Return rule value
  useEffect(() => {
    setCurrentRule(null)
    const value = rule.rule.replaceAll(' ', '');
    const values = value.split('and');
    let equal = ''
    let min = ''
    let max = ''
    values.forEach(currentValue => {
      if (value.indexOf("==") >= 0) {
        if (value.split('==')[0] === 'x') {
          equal = value.split('==')[1]
        } else {
          equal = value.split('==')[0]
        }
      } else if (currentValue.indexOf("<") >= 0) {
        if (currentValue.split('<')[0] === 'x') {
          max = currentValue.split('<')[1].replace('=', '')
        } else {
          max = currentValue.split('<')[0].replace('=', '')
        }
      } else if (currentValue.indexOf(">") >= 0) {
        if (currentValue.split('>')[0] === 'x') {
          min = currentValue.split('>')[1].replace('=', '')
        } else {
          min = currentValue.split('>')[0].replace('=', '')
        }
      }
    })
    setName(rule.name)
    setColor(rule.color)
    setOutlineColor(rule.outline_color)
    setCurrentRule(rule)

    // set formula
    setEqual(equal)
    setMax(max)
    setMin(min)
  }, [rule])

  // Construct rule
  useEffect(() => {
    if (rule === currentRule) {
      let newRule = '';
      if (equal !== '') {
        newRule = 'x==' + equal;
      } else if (min !== '' || max !== '') {
        const values = []
        if (min) {
          values.push('x>' + min)
        }
        if (max) {
          values.push('x<=' + max)
        }
        newRule = values.join(' and ');
      }
      setRuleValue(newRule);
    }
  }, [currentRule, equal, min, max])

  return (
    <Fragment>
      <td>
        <RemoveCircleIcon
          className='MuiButtonLike RemoveButton' onClick={deleteRow}
        />
      </td>
      <td>
        <input type="text" name={ruleNameName} value={name}
               spellCheck="false"
               onChange={(evt) => {
                 setName(evt.target.value)
               }}/>
      </td>
      <td>
        <div className='RuleSectionCell'>
          <input type="text" className="IndicatorRuleValue"
                 name={ruleNameRule}
                 value={ruleValue}
                 onChange={(evt) => {
                   setRuleValue(evt.target.value)
                 }}/>
          <div className="RuleSection">
            <div className="RuleSectionSymbol">value</div>
            <div className="RuleSectionSymbol">=</div>
            <div>
              <input
                type="number" spellCheck="false"
                value={equal}
                disabled={!!(min !== '' || max !== '')}
                onChange={(evt) => {
                  setEqual(evt.target.value)
                  setMin('')
                  setMax('')
                }}
              />
            </div>
          </div>
          <div className="RuleSection OrSection">
            <div className="RuleSectionSymbol">or</div>
          </div>
          <div className="RuleSection">
            <div>
              <input
                type="number" spellCheck="false" className="RuleSectionMin"
                step="any" value={min}
                disabled={equal !== ''}
                onChange={(evt) => {
                  setMin(evt.target.value)
                  setEqual('')
                }}/>
            </div>
            <div
              className="RuleSectionSymbol RuleSectionSymbolLeft">{'<'}</div>
            <div className="RuleSectionSymbol">value</div>
            <div className="RuleSectionSymbol">{'<='}</div>
            <div>
              <input
                type="number" spellCheck="false" className="RuleSectionMax"
                step="any" value={max}
                disabled={equal !== ''}
                onChange={(evt) => {
                  setMax(evt.target.value)
                  setEqual('')
                }}/>
            </div>
          </div>
        </div>
      </td>
      <td>
        <div className='ColorConfig'>
          <input type="text" name={ruleNameColor} value={color}
                 onChange={evt => setColor(evt.target.value)}
                 spellCheck="false"/>
          <div className='ColorConfigPreview'>
            <input type="color" spellCheck="false" value={color}
                   onChange={evt => setColor(evt.target.value)}/>
          </div>
        </div>
      </td>
      <td>
        <div className='ColorConfig'>
          <input type="text" name={ruleNameOutlineColor} value={outlineColor}
                 onChange={evt => setOutlineColor(evt.target.value)}
                 spellCheck="false"/>
          <div className='ColorConfigPreview'>
            <input type="color" spellCheck="false" value={outlineColor}
                   onChange={evt => setOutlineColor(evt.target.value)}/>
          </div>
        </div>
      </td>
    </Fragment>
  )
}

/**
 * Indicator Other Rule
 * @param {dict} rule Rule.
 * @param {int} idx Index.
 * @param {Function} onChange OnChange.
 */
const NO_DATA_RULE = 'No data'
const OTHER_DATA_RULE = 'Other data'

export function IndicatorOtherRule({ rule, idx, onChange }) {
  const ruleNameName = 'rule_name_' + idx;
  const ruleNameActive = 'rule_active_' + idx;
  const ruleNameRule = 'rule_rule_' + idx;
  const ruleNameColor = 'rule_color_' + idx;
  const ruleNameOutlineColor = 'rule_outline_color_' + idx;

  const [name, setName] = useState(rule.name);
  const [color, setColor] = useState(rule.color);
  const [active, setActive] = useState(rule.active);
  const [outlineColor, setOutlineColor] = useState(rule.outline_color);

  // When the rule changed
  useEffect(() => {
    rule.name = name
    rule.color = color
    rule.outline_color = outlineColor
    rule.active = active
    onChange()
  }, [name, color, outlineColor, active])

  return (
    <tr className='OtherData'>
      <td colSpan={2}>
        <Checkbox
          checked={active}
          onClick={() => {
            setActive(!active)
          }}
        />
        <input
          type="hidden" name={ruleNameActive} value={active}
          onChange={(evt) => {
          }}/>
      </td>
      <td>
        <input
          type="text" name={ruleNameName} value={name}
          spellCheck="false"
          onChange={(evt) => {
            setName(evt.target.value)
          }}/>
      </td>
      <td>
        <input
          type="text" className="IndicatorRuleValue"
          name={ruleNameRule}
          value={rule.rule}
          onChange={() => {
          }}/>
        <div className="RuleSection">
          <div className="RuleSectionSymbol">value</div>
          <div className="RuleSectionSymbol">is</div>
          <div>
            <input
              type="text" spellCheck="false"
              value={rule.rule}
              disabled={true}
              onChange={(evt) => {
              }}
            />
          </div>
        </div>
      </td>
      <td>
        <div className='ColorConfig'>
          <input type="text" name={ruleNameColor} value={color}
                 onChange={evt => setColor(evt.target.value)}
                 spellCheck="false"/>
          <div className='ColorConfigPreview'>
            <input type="color" spellCheck="false" value={color}
                   onChange={evt => setColor(evt.target.value)}/>
          </div>
        </div>
      </td>
      <td>
        <div className='ColorConfig'>
          <input type="text" name={ruleNameOutlineColor} value={outlineColor}
                 onChange={evt => setOutlineColor(evt.target.value)}
                 spellCheck="false"/>
          <div className='ColorConfigPreview'>
            <input type="color" spellCheck="false" value={outlineColor}
                   onChange={evt => setOutlineColor(evt.target.value)}/>
          </div>
        </div>
      </td>
    </tr>
  )
}


/**
 * Indicator Rules
 * @param {Array} indicatorRules Indicator rules.
 * @param {Function} onRulesChanged OnChange.
 */
export default function IndicatorRules({ indicatorRules, onRulesChanged }) {

  /** Adding new rule **/
  const newRule = (theRules, active, defaultValue, defaultName, defaultColor, defaultIdx) => {
    let idx = defaultIdx ? defaultIdx : Math.max(...theRules.map(rule => {
      return rule.id
    }))

    return {
      "id": idx + 1,
      "name": defaultName ? defaultName : "",
      "rule": defaultValue ? defaultValue : "",
      "color": defaultColor ? defaultColor : "#000000",
      "outline_color": "#000000",
      "active": active,
    }
  }

  /** Update rule for adding NO DATA RULE and OTHER RULE **/
  const updateRules = (oldRules) => {
    const theRules = [...oldRules]
    const newRules = []
    theRules.map(rule => {
      if (![NO_DATA_RULE, OTHER_DATA_RULE].includes(rule.rule)) {
        newRules.push(rule)
      }
    })
    const noDataRule = theRules.find(rule => rule.rule === NO_DATA_RULE)
    if (!noDataRule) {
      newRules.push(newRule(theRules, false, NO_DATA_RULE, NO_DATA_RULE, "#FFFFFF", -2))
    } else {
      newRules.push(noDataRule)
    }
    const otherDataRule = theRules.find(rule => rule.rule === OTHER_DATA_RULE)
    if (!otherDataRule) {
      newRules.push(newRule(theRules, false, OTHER_DATA_RULE, OTHER_DATA_RULE, "#FFFFFF", -1))
    } else {
      newRules.push(otherDataRule)
    }
    return newRules
  }

  const [rules, setRules] = useState(updateRules(indicatorRules));
  const [items, setItems] = useState([]);

  const prevState = useRef();
  const id = 'Rules'
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // When the rule changed
  useEffect(() => {
    setRules(updateRules(indicatorRules))
  }, [indicatorRules])

  useEffect(() => {
    if (onRulesChanged) {
      onRulesChanged(rules)
    }
    setItems(
      rules.map((rule, idx) => {
        return idx + 1
      })
    )
  }, [rules])

  /** On delete a row of rule **/
  const onDelete = (idx) => {
    const newRules = []
    items.map(item => {
      if (idx !== item - 1) {
        newRules.push(rules[item - 1])
      }
    })
    setRules([...newRules]);
  }

  const addNewRule = () => {
    const newRules = []
    items.map(item => {
      newRules.push(rules[item - 1])
    })
    setRules(
      updateRules([...newRules, newRule(rules, true)])
    )
  }
  const onChange = () => {
    if (onRulesChanged) {
      onRulesChanged(rules)
    }
  }

  /** When drag event ended **/
  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over.id) {
      const activeIndex = active.data.current.sortable.index;
      const overIndex = over.data.current?.sortable.index || 0;
      let newGroupList = arrayMove(
        items,
        activeIndex,
        overIndex
      )
      setItems(newGroupList)

      if (onRulesChanged) {
        const newRules = []
        newGroupList.map(item => {
          newRules.push(rules[item - 1])
        })
        onRulesChanged(newRules)
      }
    }
  };

  return <DndContext
    sensors={sensors}
    onDragEnd={handleDragEnd}
  >
    <table id="RuleTable" className='BasicForm'>
      <thead>
      <tr className="RuleTable-Header">
        <th colSpan="2"></th>
        <th valign="top">Name</th>
        <th valign="top">Rule</th>
        <th valign="top">Color</th>
        <th valign="top">Outline Color</th>
      </tr>
      <tr className="RuleTable-Help">
        <th valign="top" colSpan="2"></th>
        <th valign="top" colSpan="2">
          <div>
            The values for each rule can either be:
            <ul>
              <li>{
                `Text-based items that map to a number (e.g.
                    'Worsening' maps to value '1'). In this case, you
                    should use the '=' box below to declare one value
                    per rule text option. When harvesting from a
                    datasource, that
                    datasource can contain either numeric or text
                    values for the indicator.`
              }
              </li>
              <li>{
                `Number based items in a range that map to a
                    rule (e.g. '1 to 5' maps to 'Worsening'). In
                    this case, use the upper and lower range options
                    individually or together to define the ranges (e.g.
                    'Worsening' <= 5,
                    'Better' > 5 and <= 10). When harvesting from a
                    datasource, that datasource can contain ONLY
                    numeric values for the indicator.`
              }</li>
            </ul>
          </div>
        </th>
        <th valign="top">
        <span>
            Used for coloring the traffic light or filling the geometry.
            Put the hex color with # (e.g. #ffffff) or put the text of color. (e.g. blue).
        </span>
        </th>
        <th valign="top">
        <span>
            Used for coloring the outline of the geometry.
            Put the hex color with # (e.g. #ffffff) or put the text of color. (e.g. blue).
        </span>
        </th>
      </tr>
      </thead>
      <tbody key={id} id={id} style={style} ref={setNodeRef}>
      <SortableContext id={id} items={items} strategy={rectSortingStrategy}>
        {
          items.map(item => {
            const idx = item - 1;
            let rule = rules[item - 1]
            if (rule) {
              rule = ![
                NO_DATA_RULE, OTHER_DATA_RULE
              ].includes(rule.rule) ? rule : null
            }
            return rule ? <SortableItem key={rule.id} id={item}>
              <IndicatorRule
                key={rule.id} rule={rule} idx={idx}
                onDelete={onDelete}
                onChange={onChange}
              /></SortableItem> : ""

          })
        }
      </SortableContext>
      {
        items.map(item => {
          const idx = item - 1;
          let rule = rules[item - 1]
          if (rule) {
            rule = [
              NO_DATA_RULE, OTHER_DATA_RULE
            ].includes(rule.rule) ? rule : null
          }
          return rule ?
            <IndicatorOtherRule
              key={rule.id} rule={rule} idx={idx}
              onChange={onChange}
            /> : ""

        })
      }
      <tr className='IndicatorRule-Divider'>
        <td colSpan={5}>
        </td>
      </tr>
      </tbody>
      <tbody>
      <tr className='IndicatorRule-Add'>
        <td colSpan={6}>
          <AddButton
            variant="secondary"
            text="Add New Rule"
            onClick={addNewRule}
          />
        </td>
      </tr>
      </tbody>
    </table>
  </DndContext>
}