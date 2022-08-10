/* ==========================================================================
   Filters CONTROL
   ========================================================================== */

import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DoDisturbOnIcon from '@mui/icons-material/DoDisturbOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import WarningIcon from '@mui/icons-material/Warning';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import {
  IDENTIFIER,
  INIT_DATA,
  IS_NOT_NULL,
  IS_NULL,
  OPERATOR,
  TYPE,
  WHERE_OPERATOR
} from "../../../../utils/queryExtraction"

import { Actions } from '../../../../store/dashboard'
import { capitalize } from "../../../../utils/main";
import { filteredGeoms } from "../../../../utils/indicators";
import FilterEditorModal from './Modal'
import FilterValueInput from './ValueInput'

import './style.scss'

const Switcher = styled(Switch)(({ theme }) => ({}));

export function OperatorSwitcher({ ...props }) {
  return <FormControlLabel
    className='OperatorSwitcher'
    control={<Switcher/>}
    {...props}
  />
}

/**
 * Control All Filter.
 * @param {dict} filtersData Filters of dashboard.
 * @param {list} indicatorFields Indicator fields.
 * @param {Function} filter Filter function.
 */
export function FilterControl({ filtersData, indicatorFields, filter }) {
  const dispatcher = useDispatch()
  const [filters, setFilters] = useState(filtersData)
  const selectedIndicator = useSelector(state => state.selectedIndicator)

  // Apply the filters query
  useEffect(() => {
    if (JSON.stringify(filters) !== JSON.stringify(filtersData)) {
      setFilters(filtersData)
    }
  }, [filtersData]);

  /**
   * Update Filter
   */
  const updateFilter = (force) => {
    filter(filters)
    if (force) {
      dispatcher(
        Actions.Filters.update({ ...filters })
      )
      setFilters({ ...filters });
    }
  }

  /** --------------------------------------------------
   ** Render filter group.
   ** -------------------------------------------------- **/
  const FilterGroup = ({ where, upperWhere }) => {
    const [operator, setOperator] = useState(where.operator)
    const [open, setOpen] = useState(false)
    const [data, setData] = useState(INIT_DATA.WHERE())
    const [addType, setAddType] = useState(null)

    const switchWhere = (operator) => {
      setOperator(operator);
      where.operator = operator;
      updateFilter(true)
    }

    const add = (newData) => {
      switch (addType) {
        case TYPE.EXPRESSION: {
          where.queries.push(newData);
          break
        }
        case TYPE.GROUP:
          where.queries.push({
            ...INIT_DATA.GROUP(),
            queries: [newData]
          });
          break
      }
      updateFilter(true)
    }

    // Apply when group control changed
    const groupCheckedChanged = (where, checked) => {
      where.active = checked
      if (where.queries) {
        where.queries.map(query => {
          groupCheckedChanged(query, checked)
        })
      }
      updateFilter(true)
    }

    return <div className='FilterGroup'>
      <div className='FilterGroupHeader'>
        <div className='FilterGroupOption'>
          <Switch
            className='GroupSwitcher'
            size="small"
            checked={where.active}
            onChange={() => {
              groupCheckedChanged(where, !where.active)
            }}
          />
          <OperatorSwitcher
            checked={operator === WHERE_OPERATOR.AND}
            onChange={() => {
              switchWhere(operator === WHERE_OPERATOR.AND ? WHERE_OPERATOR.OR : WHERE_OPERATOR.AND)
            }}/>
          <div className='FilterGroupName'>
          </div>
          <Tooltip title="Add New Filter">
            <AddCircleIcon
              className='FilterGroupAddExpression MuiButtonLike'
              onClick={
                () => {
                  setOpen(true)
                  setAddType(TYPE.EXPRESSION)
                }}/>
          </Tooltip>
          <Tooltip title="Add New Group">
            <CreateNewFolderIcon
              className='FilterGroupAdd MuiButtonLike' onClick={
              () => {
                setOpen(true)
                setAddType(TYPE.GROUP)
              }
            }/>
          </Tooltip>
          <FilterEditorModal
            open={open}
            setOpen={(opened) => {
              setOpen(opened)
              setData(INIT_DATA.WHERE());
            }}
            data={data}
            fields={indicatorFields}
            update={add}/>
          {
            upperWhere ? (
              <Tooltip title="Delete Group">
                <DoDisturbOnIcon
                  className='FilterGroupDelete MuiButtonLike' onClick={
                  () => {
                    let isExecuted = confirm("Are you want to delete this group?");
                    if (isExecuted) {
                      upperWhere.queries = [...upperWhere.queries.filter(query => {
                        return query !== where
                      })]
                      updateFilter(true)
                    }
                  }
                }/>
              </Tooltip>
            ) : ''}
          <div className='FilterGroupEnd'>
          </div>
        </div>
      </div>
      {
        where.queries.length > 0 ?
          where.queries.map(
            (query, idx) => (
              <FilterRender key={idx} where={query} upperWhere={where}
                            updateFilter={updateFilter}/>
            )
          )
          :
          <div className='FilterNote'>No filter</div>
      }
    </div>
  }
  /** --------------------------------------------------
   ** Render input of filter.
   ** -------------------------------------------------- **/
  const FilterInput = ({ where, upperWhere }) => {
    const [expanded, setExpanded] = useState(
      where.expanded ? where.expanded : false
    )
    const [active, setActive] = useState(
      where.active ? where.active : false
    )
    const [open, setOpen] = useState(false)

    const updateExpanded = () => {
      where.expanded = !expanded
      setExpanded(!expanded)
    }
    const updateActive = () => {
      where.active = !active
      setActive(!active)
      updateFilter()
    }
    const update = (newWhere) => {
      where.field = newWhere.field
      where.operator = newWhere.operator
      where.value = newWhere.value
      where.name = newWhere.name
      where.description = newWhere.description
      updateFilter(true)
    }
    const field = where.field
    const operator = where.operator
    const value = where.value
    const indicator = indicatorFields.filter((indicatorField) => {
      return indicatorField.id === field
    })[0]
    const fieldName = indicator?.name

    // TODO: Reporting level
    //  Remove this after aggregation
    const reportingLevel = indicator?.reporting_level
    const differentLevel = !editMode && reportingLevel !== selectedIndicator.reporting_level

    /**
     * Return filter input
     */
    const FilterInputElement = () => {
      const [currentValue, setCurrentValue] = useState(value)
      const updateValue = (value) => {
        const cleanValue = !isNaN(value) ? (!Array.isArray(value) ? Number(value) : value) : value;
        setCurrentValue(cleanValue)
        where.value = cleanValue
        updateFilter()
      }
      const needsValue = ![IS_NULL, IS_NOT_NULL].includes(operator)
      return <div>
        {fieldName ? fieldName : field} {OPERATOR[operator]}
        {
          needsValue ?
            <div className='FilterInputWrapper'>
              <FilterValueInput
                field={field}
                value={currentValue} operator={operator}
                indicator={indicator} onChange={updateValue}
                disabled={!where.active || differentLevel}/>
            </div> : ""
        }
        {where.description ?
          <div
            className='FilterExpressionDescription'>{where.description}</div> : ''
        }
      </div>
    }

    return <Accordion
      className={'FilterExpression ' + (differentLevel ? "Disabled" : "")}
      expanded={expanded}
      onChange={updateExpanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon/>}
      >
        <div
          className='FilterExpressionName'
          onClick={(event) => {
            if (!differentLevel) {
              updateActive(!active)
              if (!active) {
                setExpanded(true)
              } else {
                setExpanded(false)
              }
              event.stopPropagation()
            }
          }}>
          <Switch
            size="small"
            checked={active}
            onChange={() => {
            }}
            disabled={differentLevel}
          />
          {
            differentLevel ?
              <div className='FilterInfo'>
                <Tooltip
                  title={
                    "Filter will not affect indicator on the map because the differences of admin level. " +
                    "Filter admin is " + reportingLevel + " but indicator on map is " + selectedIndicator.reporting_level + "."
                  }
                >
                  <WarningIcon/>
                </Tooltip>
              </div> : ""
          }
          {
            where.name ?
              <div>{where.name}</div> :
              fieldName ?
                <div>{capitalize(fieldName.split('.')[1])}</div> :
                <div>Loading</div>
          }
        </div>
        <ModeEditIcon
          className='MuiButtonLike FilterEdit'
          onClick={(event) => {
            event.stopPropagation()
            setOpen(true)
          }}/>
        {
          upperWhere ? (
            <Tooltip title="Delete Filter">
              <DoDisturbOnIcon
                className='MuiButtonLike FilterDelete MuiButtonLike' onClick={
                () => {
                  let isExecuted = confirm("Are you want to delete this group?");
                  if (isExecuted) {
                    upperWhere.queries = [...upperWhere.queries.filter(query => {
                      return query !== where
                    })]
                    updateFilter(true)
                  }
                }
              }/>
            </Tooltip>
          ) : ''
        }

        <FilterEditorModal
          open={open} setOpen={setOpen} data={where}
          fields={indicatorFields} update={update}/>
      </AccordionSummary>
      <AccordionDetails>
        <FilterInputElement/>
      </AccordionDetails>
    </Accordion>
  }

  /** --------------------------------------------------
   ** Render input of filter.
   ** -------------------------------------------------- **/
  const FilterRender = ({ where, upperWhere }) => {
    switch (where.type) {
      case TYPE.GROUP:
        return <FilterGroup where={where} upperWhere={upperWhere}/>
      case TYPE.EXPRESSION:
        return <FilterInput where={where} upperWhere={upperWhere}/>
      default:
        return ''
    }
  }

  return <Fragment>
    <FilterRender
      where={filters}
      upperWhere={null}/>
  </Fragment>
}


/**
 * Filter section.
 */
export default function FilterSection() {
  const {
    filters,
    indicators,
    referenceLayer
  } = useSelector(state => state.dashboard.data);
  const referenceLayerData = useSelector(state => state.referenceLayerData)
  const indicatorsData = useSelector(state => state.indicatorsData)
  const geometries = useSelector(state => state.geometries);
  const dispatcher = useDispatch();

  // Set older filters
  const prevState = useRef();
  prevState.current = '';

  /** Filter data **/
  const filter = (currentFilter) => {
    let indicatorsList = [];
    let allHasData = true;
    for (const [key, indicatorDataRow] of Object.entries(indicatorsData)) {
      const indicator = JSON.parse(JSON.stringify(indicatorDataRow))
      if (indicator.fetching) {
        allHasData = false
      } else {
        indicatorsList.push(indicator)
        const codes = geometries[indicator.reporting_level] ? Object.keys(geometries[indicator.reporting_level]) : []
        const indicatorCodes = indicator.data.map(data => data.geometry_code)
        const missingCodes = codes.filter(code => !indicatorCodes.includes(code))
        missingCodes.map(code => {
          indicator.data.push({
            geometry_code: code,
            indicator_id: indicator.id
          })
        })
      }
    }

    const currentFilterStr = JSON.stringify(currentFilter)
    if (prevState.current !== currentFilterStr) {
      const filteredGeometries = filteredGeoms(
        indicatorsList, currentFilter
      )
      if (filteredGeometries) {
        dispatcher(
          Actions.FilteredGeometries.update(filteredGeometries)
        )
      }
      dispatcher(
        Actions.FiltersData.update(currentFilter)
      );
      prevState.current = currentFilterStr
    }
  }

  // Apply the filters query
  useEffect(() => {
    if (referenceLayerData[referenceLayer.identifier]?.data &&
      referenceLayerData[referenceLayer.identifier].data.levels) {
      filter(filters)
    }
  }, [filters, indicatorsData, geometries]);

  // get indicator fields
  let indicatorFields = []
  indicators.map(indicator => {
    const indicatorData = indicatorsData[indicator.id]
    if (indicatorData?.fetched) {
      const data = indicatorData?.data
      if (data) {
        let keys = []
        data.map(row => {
          keys = [...new Set(keys.concat(Object.keys(row)))]
        })
        keys.forEach(key => {
          const id = `${IDENTIFIER}${indicator.id}.${key}`
          if (key === 'indicator_id') {
            return
          }
          indicatorFields.push({
            'id': id,
            'name': `${indicator.name}.${key}`,
            'group': indicator.name,
            'data': [...new Set(
              data.map(data => {
                return data[key]
              }).filter(data => {
                return data
              }))
            ],
            // TODO: Reporting level
            //  Remove this after aggregation
            'reporting_level': indicatorData.reporting_level
          })
        })
      }
      indicatorFields = [...new Set(indicatorFields)]
    }
  })

  return <Fragment>
    <div className='FilterControl'>
      <div className='FilterControlInfo'>
        Filter is active if the admin of filter is same with the admin of
        indicator on the map.
      </div>
      <FilterControl
        filtersData={
          (filters && Object.keys(filters).length > 0) ? filters : INIT_DATA.GROUP()
        }
        indicatorFields={indicatorFields}
        filter={filter}
      />
    </div>
  </Fragment>
}