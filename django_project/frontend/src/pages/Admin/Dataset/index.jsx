import React, { Fragment, useEffect, useState } from 'react';
import $ from "jquery";
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import DoDisturbOnIcon from "@mui/icons-material/DoDisturbOn";
import HistoryIcon from '@mui/icons-material/History';
import {
  LocalizationProvider
} from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import TextField from '@mui/material/TextField';

import { render } from '../../../app';
import Admin, { pageNames } from '../index';
import { store } from '../../../store/admin';
import {
  DatasetFilterSelector,
  IndicatorFilterSelector,
} from "../ModalSelector/ModalFilterSelector";
import {
  MultipleCreatableFilter
} from "../ModalSelector/ModalFilterSelector/MultipleCreatableFilter";
import { fetchJSON } from "../../../Requests";
import {
  deleteFromArray,
  dictDeepCopy,
  jsonToUrlParams,
  splitParams,
  urlParams
} from "../../../utils/main";
import { DeleteButton, SaveButton } from "../../../components/Elements/Button";
import { IconTextField } from "../../../components/Elements/Input";

import './style.scss';

const tableTab = 'table'
const mapTab = 'map'

const deleteWarning = "WARNING! Do you want to delete the selected data? This will apply directly to database."
/**
 * Dataset admin
 */
export default function DatasetAdmin() {
  const {
    datasets,
    indicators,
    levels,
    codes,
    tab: paramTab
  } = urlParams()

  const pageSize = 25
  const [tab, setTab] = useState(paramTab ? paramTab : tableTab)
  const [filterByIndicators, setFilterByIndicator] = useState(splitParams(indicators))
  const [filterByDatasets, setFilterByDatasets] = useState(splitParams(datasets))
  const [filterByLevels, setFilterByLevels] = useState(splitParams(levels))
  const [filterByCodes, setFilterByCodes] = useState(splitParams(codes))
  const [filterByFromTime, setFilterByFromTime] = useState(null)
  const [filterByToTime, setFilterByToTime] = useState(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [selectionModel, setSelectionModel] = useState([]);
  const [updatedData, setUpdatedData] = useState([]);

  const COLUMNS = [
    { field: 'id', headerName: 'id', hide: true },
    { field: 'indicator', headerName: 'Indicator', flex: 1 },
    { field: 'reference_layer_name', headerName: 'Dataset', flex: 0.5 },
    { field: 'admin_level', headerName: 'Level', flex: 0.5 },
    { field: 'geom_identifier', headerName: 'Geo Code', flex: 0.5 },
    { field: 'date', headerName: 'Time', flex: 0.5 },
    {
      field: 'value', headerName: 'Value', flex: 0.5,
      renderCell: (params) => {
        const rowData = updatedData.find(row => row.id === params.row.id)
        const permission = params.row.permission
        if (permission.edit) {
          return <IconTextField
            iconEnd={
              rowData ?
                <HistoryIcon title='Revert to default value' onClick={() => {
                  setUpdatedData([...deleteFromArray(rowData, updatedData)])
                }}/> : ""
            }
            className='ValueInput'
            value={params.value}
            onChange={val => {
              if (rowData?.value !== val.target.value) {
                if (!rowData) {
                  params.row.value = val.target.value
                  updatedData.push(params.row)
                } else {
                  rowData.value = val.target.value
                }
                setUpdatedData([...updatedData])
              } else {
                setUpdatedData([...deleteFromArray(rowData, updatedData)])
              }
            }}/>
        } else {
          return params.value
        }
      }
    },
    {
      field: 'actions',
      type: 'actions',
      width: 80,
      getActions: (params) => {
        return [
          <GridActionsCellItem
            icon={
              <DoDisturbOnIcon
                className='DeleteButton'/>
            }
            onClick={() => {
              if (confirm(deleteWarning) === true) {
                setIsDeleting(true)
                $.ajax({
                  url: urls.api.datasetApi,
                  method: 'DELETE',
                  data: {
                    'ids': JSON.stringify([params.row.id])
                  },
                  success: function () {
                    setIsDeleting(false)
                    loadData();
                  },
                  error: function () {
                    setIsDeleting(false)
                  },
                  beforeSend: beforeAjaxSend
                });
                return false;
              }
            }}
            label="Delete"
          />
        ]
      },
    }
  ]

  // Tables
  const [parameters, setParameters] = useState({
    page: 0,
    page_size: pageSize
  })
  const [data, setData] = useState([])
  const [rowSize, setRowSize] = useState(0)

  /***
   * Parameters Changed
   */
  const parametersChanged = () => {
    if (filterByIndicators.length) {
      parameters['indicator_id__in'] = filterByIndicators.join(',')
    } else {
      delete parameters['indicator_id__in']
    }
    if (filterByDatasets.length) {
      parameters['reference_layer_id__in'] = filterByDatasets.join(',')
    } else {
      delete parameters['reference_layer_id__in']
    }
    if (filterByLevels.length) {
      parameters['admin_level__in'] = filterByLevels.join(',')
    } else {
      delete parameters['admin_level__in']
    }
    if (filterByCodes.length) {
      parameters['geom_identifier__in'] = filterByCodes.join(',')
    } else {
      delete parameters['geom_identifier__in']
    }
    if (filterByFromTime) {
      parameters['date__gte'] = filterByFromTime.format('YYYY-MM-DD');
    } else {
      delete parameters['date__gte']
    }
    if (filterByToTime) {
      parameters['date__lte'] = filterByToTime.format('YYYY-MM-DD');
    } else {
      delete parameters['date__lte']
    }
    setParameters({ ...parameters })
  }

  /***
   * Load data
   */
  const loadData = () => {
    setData([])
    setIsLoading(true)
    const paramsUsed = dictDeepCopy(parameters)
    paramsUsed.page += 1
    const params = jsonToUrlParams(paramsUsed)
    fetchJSON(urls.api.datasetApi + '?' + params, {}, false)
      .then(data => {
        setRowSize(data.count)
        setData(data.results)
        setIsLoading(false)
      })
      .catch(error => {
        setIsLoading(false)
      })
  }
  /***
   * When page changed
   */
  useEffect(() => {
    loadData()
  }, [parameters])

  /***
   * When filter changed
   */
  useEffect(() => {
      parameters.page = 0
      setRowSize(0)
      parametersChanged()
    }, [filterByIndicators, filterByDatasets, filterByLevels, filterByCodes, filterByFromTime, filterByToTime]
  )

  // Update with edited one
  const usedData = dictDeepCopy(data)
  usedData.map(rowData => {
    const foundUpdatedData = updatedData.find(row => row.id === rowData.id)
    if (foundUpdatedData) {
      rowData.value = foundUpdatedData.value
      rowData.updated = true
    }
  })

  return (
    <Admin
      pageName={pageNames.Dataset}>
      <div className='AdminList DatasetAdmin'>
        {/* FILTERS */}
        <div className='DatasetAdminFilters'>
          <IndicatorFilterSelector
            data={filterByIndicators}
            setData={setFilterByIndicator}/>
          <DatasetFilterSelector
            data={filterByDatasets}
            setData={setFilterByDatasets}/>
          <MultipleCreatableFilter
            title={'Filter by Level(s)'}
            data={filterByLevels}
            setData={setFilterByLevels}/>
          <MultipleCreatableFilter
            title={'Filter by Geography(s)'}
            data={filterByCodes}
            setData={setFilterByCodes}/>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DesktopDatePicker
              label="Filter from"
              inputFormat="YYYY-MM-DD"
              maxDate={filterByToTime}
              value={filterByFromTime}
              onChange={value => {
                setFilterByFromTime(value)
              }}
              renderInput={(params) => <TextField {...params} />}
            />
            <DesktopDatePicker
              label="Filter to"
              inputFormat="YYYY-MM-DD"
              minDate={filterByFromTime}
              value={filterByToTime}
              onChange={setFilterByToTime}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </div>

        <div className='Tab TabPrimary'>
          <div
            className={tab === tableTab ? "Selected" : ""}
            onClick={() => setTab(tableTab)}
          >
            Table
          </div>

          {/* Other buttons */}
          <div className='Separator'></div>
          {
            tab === tableTab ?
              <Fragment>
                <DeleteButton
                  disabled={!selectionModel.length || isDeleting}
                  variant="secondary Reverse"
                  text={"Delete"}
                  onClick={() => {
                    if (confirm(deleteWarning) === true) {
                      setIsDeleting(true)
                      $.ajax({
                        url: urls.api.datasetApi,
                        method: 'DELETE',
                        data: {
                          'ids': JSON.stringify(selectionModel)
                        },
                        success: function () {
                          setIsDeleting(false)
                          loadData();
                        },
                        error: function () {
                          setIsDeleting(false)
                        },
                        beforeSend: beforeAjaxSend
                      });
                      return false;
                    }
                  }}
                />
                <SaveButton
                  variant="secondary"
                  text={"Apply " + updatedData.length + " Change(s)"}
                  disabled={!updatedData.length || isApplying}
                  onClick={() => {
                    setIsApplying(true)
                    $.ajax({
                      url: urls.api.datasetApi,
                      method: 'POST',
                      data: {
                        'data': JSON.stringify(updatedData.map(data => {
                          return {
                            id: data.id,
                            value: data.value,
                          }
                        }))
                      },
                      success: function () {
                        setIsApplying(false)
                        setUpdatedData([])
                        loadData();
                      },
                      error: function (error) {
                        alert(error.responseText)
                        setIsApplying(false)
                      },
                      beforeSend: beforeAjaxSend
                    });
                  }}
                />
              </Fragment>
              : ""
          }
        </div>
        <div className='MuiDataGridTable DatasetAdminTable'>
          <DataGrid
            rows={usedData}
            rowCount={rowSize}
            loading={isLoading}
            rowsPerPageOptions={[pageSize]}
            pagination
            page={parameters.page}
            pageSize={pageSize}
            paginationMode="server"
            onPageChange={(newPage) => {
              parameters.page = newPage
              parametersChanged()
            }}
            columns={COLUMNS}
            getCellClassName={params => {
              let className = ''
              if (params.row.updated) {
                className = 'Updated '
              }
              if (["__check__", "actions"].includes(params.field)) {
                if (!params.row.permission.delete) {
                  className += "Hide"
                }
              }
              return className
            }}

            disableSelectionOnClick
            disableColumnFilter

            checkboxSelection={true}
            onSelectionModelChange={(newSelectionModel) => {

              setSelectionModel(
                data.filter(row => row.permission.delete && newSelectionModel.includes(row.id)).map(row => row.id)
              );
            }}
            selectionModel={selectionModel}
          />
        </div>
      </div>
    </Admin>
  );
}

render(DatasetAdmin, store)