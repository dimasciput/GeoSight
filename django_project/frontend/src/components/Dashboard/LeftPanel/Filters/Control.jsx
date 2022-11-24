/* ==========================================================================
   Filters CONTROL
   ========================================================================== */

import React, { Fragment, useEffect, useRef, useState } from 'react'
import $ from 'jquery'
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
import { allDataIsReady, filteredGeoms } from "../../../../utils/indicators";
import FilterEditorModal from './Modal'
import FilterValueInput from './ValueInput'

import './style.scss'

const Switcher = styled(Switch)(({ theme }) => ({}));
const expandedByFilterField = {}

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
 * @param {bool} ableToModify Able to modify.
 */
export function FilterControl(
  { filtersData, indicatorFields, filter, ableToModify }
) {
  const dispatcher = useDispatch()
  const [filters, setFilters] = useState(filtersData)
  const selectedIndicatorLayer = useSelector(state => state.selectedIndicatorLayer)
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel)

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

  // When component updated
  useEffect(() => {
    if (!editMode) {
      // We hide group if not have filter
      $('.FilterGroup').each(function () {
        if ($(this).find('.MuiPaper-root').length === 0) {
          $(this).addClass('Hidden')
        } else {
          $(this).removeClass('Hidden')
        }
      })
    }
  });

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
          {
            ableToModify ?
              <Fragment>
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
              </Fragment> :
              <div className='OperatorIdentifier'>{operator}</div>
          }
        </div>
      </div>
      {
        where.queries.length > 0 ?
          where.queries.map(
            (query, idx) => (
              <FilterRender
                key={idx} where={query} upperWhere={where}
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
      expandedByFilterField[where.field] && where.active ? expandedByFilterField[where.field] : false
    )
    const [open, setOpen] = useState(false)

    const updateExpanded = () => {
      setExpanded(!expanded)
      expandedByFilterField[where.field] = !expanded
    }
    const updateActive = () => {
      where.active = !where.active
      updateFilter()
    }
    const update = (newWhere) => {
      where.field = newWhere.field
      where.operator = newWhere.operator
      where.value = newWhere.value
      where.name = newWhere.name
      where.description = newWhere.description
      where.allowModify = newWhere.allowModify
      updateFilter(true)
    }
    const field = where.field
    const operator = where.operator
    const value = where.value
    const indicator = indicatorFields.filter((indicatorField) => {
      return indicatorField.id === field
    })[0]
    const fieldName = indicator?.name

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
                disabled={!where.active}/>
            </div> : ""
        }
        {where.description ?
          <div
            className='FilterExpressionDescription'>{where.description}</div> : ''
        }
      </div>
    }

    const ableToExpand = where.allowModify || editMode;
    return <Accordion
      className={'FilterExpression'}
      expanded={!ableToExpand ? false : expanded}
      onChange={updateExpanded}>
      <AccordionSummary
        expandIcon={ableToExpand ? <ExpandMoreIcon/> : ""}
      >
        <div
          className='FilterExpressionName'
          onClick={(event) => {
            updateActive(!where.active)
            updateExpanded()
            event.stopPropagation()
          }}>
          <Switch
            size="small"
            checked={where.active}
            onChange={() => {
            }}
          />
          {
            where.name ?
              <div>{where.name}</div> :
              fieldName ?
                <div>{capitalize(fieldName.split('.')[1])}</div> :
                <div>Loading</div>
          }
        </div>
        {ableToModify ?
          <Fragment>
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
                    className='MuiButtonLike FilterDelete MuiButtonLike'
                    onClick={
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
          </Fragment>
          : ""}
      </AccordionSummary>
      <AccordionDetails>
        {ableToExpand ? <FilterInputElement/> : ""}
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
    referenceLayer,
    filtersAllowModify
  } = useSelector(state => state.dashboard.data);

  const ableToModify = filtersAllowModify || editMode;
  const referenceLayerData = useSelector(state => state.referenceLayerData)
  const indicatorsData = useSelector(state => state.indicatorsData)
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel)
  const geometries = useSelector(state => state.geometries);
  const dispatcher = useDispatch();

  const levels = referenceLayerData[referenceLayer.identifier]?.data?.levels

  // Set older filters
  const prevState = useRef();
  /** Filter data **/
  const filter = (currentFilter) => {
    if (!allDataIsReady(indicatorsData)) {
      return
    }
    let dataList = [];
    if (levels) {
      levels.filter(level => level.level === selectedAdminLevel.level).map(level => {
        if (geometries[level.level]) {
          const data = []
          for (const [key, geomData] of Object.entries(geometries[level.level])) {
            const geom = JSON.parse(JSON.stringify(geomData))
            geom.geometry_code = geom.code
            data.push(geom)
          }
          dataList.push({
            id: `geometry_${level.level}`,
            reporting_level: level.level,
            data: data
          })
        }
      })
    }
    for (const [key, indicatorDataRow] of Object.entries(indicatorsData)) {
      indicatorDataRow.reporting_levels.map(reporting_level => {
        const indicator = JSON.parse(JSON.stringify(indicatorDataRow))
        indicator.id = `indicator_${indicator.id}`
        indicator.reporting_level = reporting_level
        dataList.push(indicator)
        const codes = geometries[reporting_level] ? Object.keys(geometries[reporting_level]) : []
        if (indicator.data) {
          const indicatorCodes = indicator.data.map(data => data.geometry_code)
          const missingCodes = codes.filter(code => !indicatorCodes.includes(code))
          missingCodes.map(code => {
            indicator.data.push({
              geometry_code: code,
              indicator_id: indicator.id
            })
          })
        }
      })
    }

    const currentFilterStr = JSON.stringify(currentFilter)
    if (prevState.current !== currentFilterStr || prevState.level !== selectedAdminLevel.level) {
      const filteredGeometries = filteredGeoms(
        dataList, currentFilter, selectedAdminLevel.level
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
      prevState.level = selectedAdminLevel.level
    }
  }

  // Apply the filters query
  useEffect(() => {
    if (referenceLayerData[referenceLayer.identifier]?.data &&
      referenceLayerData[referenceLayer.identifier].data.levels) {
      filter(filters)
    }
  }, [filters, indicatorsData, geometries, selectedAdminLevel]);

  // get indicator fields
  let indicatorFields = []
  if (levels) {
    levels.map(level => {
      if (geometries[level.level]) {
        ['code', 'name'].map(key => {
          const id = `geometry_${level.level}.${key}`
          indicatorFields.push({
            id: id,
            name: `${key}`,
            group: `Admin - ${level.level_name}`,
            data: [...new Set(
              Object.keys(geometries[level.level]).map(geom => {
                return geometries[level.level][geom][key]
              })
            )],
            reporting_levels: [level.level],
            type: 'String'
          })
        })
      } else {
        ['code', 'name'].map(key => {
          const id = `geometry_${level.level}.${key}`
          indicatorFields.push({
            id: id,
            name: `${key}`,
            group: `Admin - ${level.level_name}`,
            data: ['loading'],
            reporting_levels: [level.level],
            type: 'String'
          })
        })
      }
    })
  }
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
          if (['indicator_id', 'style', 'date', 'geometry_code'].includes(key)) {
            return
          }
          indicatorFields.push({
            id: id,
            name: `${key}`,
            group: indicator.name,
            data: [...new Set(
              data.map(data => {
                return data[key]
              }).filter(data => {
                return data
              }))
            ],
            reporting_levels: indicatorData?.reporting_levels,
            type: key === 'value' ? indicator?.type : 'String'
          })
        })
      }
      indicatorFields = [...new Set(indicatorFields)]
    } else {
      let keys = ['label', 'value']
      keys.forEach(key => {
        const id = `${IDENTIFIER}${indicator.id}.${key}`
        if (['indicator_id', 'style', 'date', 'geometry_code'].includes(key)) {
          return
        }
        indicatorFields.push({
          id: id,
          name: `${key}`,
          group: indicator.name,
          data: ['loading'],
          reporting_levels: indicatorData?.reporting_levels,
          type: key === 'value' ? indicator?.type : 'String'
        })
      })
    }
  })

  return <Fragment>
    <div className='FilterControl'>
      <div className='FilterControlInfo'>
        Filter changes based on the admin level shows on the map.
      </div>
      <FilterControl
        filtersData={
          (filters && Object.keys(filters).length > 0) ? filters : INIT_DATA.GROUP()
        }
        indicatorFields={indicatorFields}
        filter={filter}
        ableToModify={ableToModify}
      />
    </div>
  </Fragment>
}