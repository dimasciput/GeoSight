import React, { Fragment, useEffect, useState } from 'react';
import $ from 'jquery';
import CircularProgress from '@mui/material/CircularProgress';
import SettingsBackupRestoreIcon
  from '@mui/icons-material/SettingsBackupRestore';
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Popover from "@mui/material/Popover";

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import Admin, { pageNames } from '../../index';
import {
  AddButton,
  DeleteButton,
  EditButton,
  SaveButton,
  ThemeButton
} from "../../../../components/Elements/Button";
import { fetchJSON } from "../../../../Requests";
import { dictDeepCopy, urlParams } from "../../../../utils/main";
import {
  DatasetSelector,
  GroupSelector,
  UserSelector
} from "../../ModalSelector";
import { IconTextField } from "../../../../components/Elements/Input";

import './style.scss';
import IndicatorSelector from "../../ModalSelector/Indicator";
import DoDisturbOnIcon from "@mui/icons-material/DoDisturbOn";
import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader
} from "../../../../components/Modal";

export function AddData(
  {
    tab, permissions, open, setOpen, data, updateData
  }
) {
  const [indicators, setIndicators] = useState([])
  const [datasets, setDatasets] = useState([])
  const [objects, setObjects] = useState([])
  const [permission, setPermission] = useState(permissions[0][0])

  useEffect(() => {
    setIndicators([])
    setDatasets([])
    setObjects([])
  }, [open])
  return <Modal
    className='PermissionFormModal PermissionDatasetAddData'
    open={open}
    onClosed={() => {
      setOpen(false)
    }}
  >
    <ModalHeader onClosed={() => {
      setOpen(false)
    }}>Update permission</ModalHeader>
    <ModalContent>
      <FormControl className='BasicForm'>
        <label className="form-label">Indicators</label>
        <ModalFilter
          filterType={IndicatorTab}
          placeholder={'Select indicator(s)'}
          data={indicators}
          setData={setIndicators}
          returnObject={true}
        />
      </FormControl>
      <FormControl className='BasicForm'>
        <label className="form-label">Dataset</label>
        <ModalFilter
          filterType={DatasetTab}
          placeholder={'Select dataset(s)'}
          data={datasets}
          setData={setDatasets}
          returnObject={true}
        />
      </FormControl>
      <FormControl className='BasicForm'>
        <label className="form-label">{tab}</label>
        <ModalFilter
          filterType={tab}
          placeholder={'Select ' + tab + '(s)'}
          data={objects}
          setData={setObjects}
          returnObject={true}
        />
      </FormControl>
      <FormControl className='BasicForm'>
        <label className="form-label">Permission</label>
        <Select
          value={permission}
          onChange={(evt) => {
            setPermission(evt.target.value)
          }}
        >
          {
            permissions.map(choice => {
              return <MenuItem
                key={choice[0]}
                value={choice[0]}>{choice[1]}</MenuItem>
            })
          }
        </Select>
      </FormControl>
    </ModalContent>
    <ModalFooter>
      <div className='Save-Button'>
        <SaveButton
          variant="secondary"
          text={"Apply Changes"}
          onClick={() => {
            let maxId = data.length ? Math.max(...data.map(row => row.id)) : 0
            indicators.map(indicator => {
              datasets.map(dataset => {
                objects.map(object => {
                  if (tab === UserTab) {
                    const dataFound = data.filter(row => {
                      return row.indicator_id === indicator.id &&
                        row.dataset_id === dataset.id && row.user_id === object.id
                    })[0]
                    if (dataFound) {
                      dataFound.permission = permission
                    } else {
                      maxId += 1
                      data.push({
                        'id': maxId + 1,
                        'dataset_id': dataset.id,
                        'dataset_name': dataset.name,
                        'indicator_id': indicator.id,
                        'indicator_name': indicator.name,
                        'user_id': object.id,
                        'user_name': object.name,
                        'user_role': object.role,
                        'permission': permission
                      })
                    }
                  } else if (tab === GroupTab) {
                    const dataFound = data.filter(row => {
                      return row.indicator_id === indicator.id &&
                        row.dataset_id === dataset.id && row.group_id === object.id
                    })[0]
                    if (dataFound) {
                      dataFound.permission = permission
                    } else {
                      maxId += 1
                      data.push({
                        'id': maxId,
                        'dataset_id': dataset.id,
                        'dataset_name': dataset.name,
                        'indicator_id': indicator.id,
                        'indicator_name': indicator.name,
                        'group_id': object.id,
                        'group_name': object.name,
                        'permission': permission
                      })
                    }
                  }
                })
              })
            })
            updateData(data)
            setOpen(false)
          }}
        />
      </div>
    </ModalFooter>
  </Modal>
}

/**
 * SelectFilter component
 */
export function SelectFilter({ title, data, setData, options }) {
  const handleChange = (evt) => {
    setData(evt.target.value);
  };
  return <FormControl>
    <InputLabel>{title}</InputLabel>
    <Select
      multiple
      value={data}
      onChange={handleChange}
      IconComponent={FilterAltIcon}
      input={<OutlinedInput label={title}/>}
      renderValue={(selected) => selected.length + ' selected'}
    >
      {options.map((option) => (
        <MenuItem key={option[0]} value={option[0]}>
          <Checkbox checked={data.indexOf(option[0]) > -1}/>
          <ListItemText primary={option[1]}/>
        </MenuItem>
      ))}
    </Select>
  </FormControl>
}

/**
 * Filter component
 * @param {str} filterType Filter type.
 * @param {str} placeholder Placeholder of input.
 * @param {array} data Selected data.
 * @param {function} setData When the value changed.
 * @param {Boolean} returnObject Is data returned whole object.
 */
export function ModalFilter(
  { filterType, placeholder, data, setData, returnObject }
) {
  const [open, setOpen] = useState(false)

  const updateData = (changedData) => {
    setData(changedData.map(row => returnObject ? row : row.id))
  }
  return <FormControl className='FilterControl'>
    <IconTextField
      iconEnd={<FilterAltIcon/>}
      onClick={() => setOpen(true)}
      value={data.length ? data.length + ' selected' : placeholder}
      inputProps={
        { readOnly: true, }
      }
    />
    {
      filterType === IndicatorTab ?
        <IndicatorSelector
          open={open}
          setOpen={setOpen}
          selectedData={data}
          selectedDataChanged={updateData}
        /> :
        filterType === UserTab ?
          <UserSelector
            open={open}
            setOpen={setOpen}
            selectedData={data}
            selectedDataChanged={updateData}
          /> :
          filterType === GroupTab ?
            <GroupSelector
              open={open}
              setOpen={setOpen}
              selectedData={data}
              selectedDataChanged={updateData}
            /> :
            filterType === DatasetTab ?
              <DatasetSelector
                open={open}
                setOpen={setOpen}
                selectedData={data}
                selectedDataChanged={updateData}
              /> : ""
    }
  </FormControl>
}


/**
 * Update permission modal
 */
export function UpdatePermissionModal(
  { choices, open, setOpen, selectedPermission }
) {
  const [selected, setSelected] = useState(choices[0][0])

  return <Modal
    className='PermissionFormModal'
    open={open}
    onClosed={() => {
      setOpen(false)
    }}
  >
    <ModalHeader onClosed={() => {
      setOpen(false)
    }}>Update permission</ModalHeader>
    <ModalContent>
      <FormControl className='BasicForm'>
        <Select
          value={selected}
          onChange={(evt) => {
            setSelected(evt.target.value)
          }}
        >
          {
            choices.map(choice => {
              return <MenuItem
                key={choice[0]}
                value={choice[0]}>{choice[1]}</MenuItem>
            })
          }
        </Select>
      </FormControl>
    </ModalContent>
    <ModalFooter>
      <div className='Save-Button'>
        <SaveButton
          variant="secondary"
          text={"Apply Changes"}
          onClick={() => {
            selectedPermission(selected)
          }}
        />
      </div>
    </ModalFooter>
  </Modal>
}

/**
 * Access data
 */
export function AccessData(
  { rows, columns, selected, selectionModel, setSelectionModel }) {
  return <div className='MuiDataGridTable DataAccessAdminTable'>
    <DataGrid
      rows={rows}
      columns={columns}
      pageSize={20}
      rowsPerPageOptions={[20]}
      initialState={{
        sorting: {
          sortModel: [
            { field: 'indicator_name', sort: 'asc' },
          ],
        },
      }}
      disableSelectionOnClick
      disableColumnFilter

      checkboxSelection={selected}
      onSelectionModelChange={(newSelectionModel) => {
        setSelectionModel(newSelectionModel);
      }}
      selectionModel={selectionModel}
    />
  </div>
}

/** Split params and parse to int **/
const splitParams = (param) => {
  return param ? param.split(',').map(obj => {
    try {
      return parseInt(obj)
    } catch (err) {
      return obj
    }
  }) : []
}

const UserTab = 'users'
const IndicatorTab = 'indicators'
const DatasetTab = 'datasets'
const GroupTab = 'groups'
const GeneralTab = 'generals'
/**
 * Data Access admin
 */
export default function DataAccessAdmin() {
  const {
    datasets,
    indicators,
    permissions,
    users,
    groups,
    tab: paramTab
  } = urlParams()

  const [submitted, setSubmitted] = useState(false)
  const [tab, setTab] = useState(paramTab ? paramTab : UserTab)
  const [data, setData] = useState(null)
  const [tableData, setTableData] = useState(null)
  const [defaultTableData, setDefaultTableTableData] = useState(null)

  const [filterByIndicators, setFilterByIndicator] = useState(splitParams(indicators))
  const [filterByDatasets, setFilterByDataset] = useState(splitParams(datasets))
  const [filterByPermissions, setFilterByPermission] = useState(splitParams(permissions))
  const [filterByUsers, setFilterByUsers] = useState(splitParams(users))
  const [filterByGroups, setFilterByGroups] = useState(splitParams(groups))
  const [selectionModel, setSelectionModel] = useState([]);
  const [updatePermissionOpen, setUpdatePermissionOpen] = useState(false);
  const [addPermissionOpen, setAddPermissionOpen] = useState(false);

  // for popover
  const [anchorEl, setAnchorEl] = useState(null);
  const [info, setInfo] = useState(null);

  // Render Cell
  const renderCell = (params, key) => {
    return <FormControl className='BasicForm'>
      <Select
        value={params.row[key]}
        onChange={(evt) => {
          tableData[tab][params.row.id][key] = evt.target.value
          setTableData({ ...tableData })
        }}
      >
        {
          data['permission_choices'].map(choice => {
            if (tab !== GeneralTab && choice[0] === 'None') {
              return
            }
            return <MenuItem
              key={choice[0]}
              value={choice[0]}>{choice[1]}</MenuItem>
          })
        }
      </Select>
    </FormControl>
  }

  const actions = (params) => {
    return [
      <GridActionsCellItem
        icon={
          <DoDisturbOnIcon
            className='DeleteButton'/>
        }
        onClick={() => {
          tableData[tab] = tableData[tab].filter(row => {
            return row.id !== params.row.id
          })
          setTableData({ ...tableData })
        }}
        label="Delete"
      />
    ]
  }

  // Columns for each tab
  const COLUMNS = {}
  COLUMNS[UserTab] = [
    { field: 'id', headerName: 'id', hide: true },
    { field: 'indicator_name', headerName: 'Indicator', flex: 1 },
    { field: 'dataset_name', headerName: 'Dataset', flex: 0.5 },
    { field: 'user_name', headerName: 'User', flex: 0.5 },
    { field: 'user_role', headerName: 'Role', flex: 0.5 },
    {
      field: 'permission', headerName: 'Permission', width: 200,
      renderCell: (params) => {
        return renderCell(params, 'permission')
      }
    },
    {
      field: 'actions',
      type: 'actions',
      width: 80,
      getActions: (params) => {
        return actions(params)
      },
    }
  ]
  COLUMNS[GroupTab] = [
    { field: 'id', headerName: 'id', hide: true },
    { field: 'indicator_name', headerName: 'Indicator', flex: 1 },
    { field: 'dataset_name', headerName: 'Dataset', flex: 0.5 },
    { field: 'group_name', headerName: 'Group', flex: 0.5 },
    {
      field: 'permission', headerName: 'Permission', width: 200,
      renderCell: (params) => {
        return renderCell(params, 'permission')
      }
    },
    {
      field: 'actions',
      type: 'actions',
      width: 80,
      getActions: (params) => {
        return actions(params)
      },
    }
  ]
  COLUMNS[GeneralTab] = [
    { field: 'id', headerName: 'id', hide: true },
    { field: 'indicator_name', headerName: 'Indicator', flex: 1 },
    { field: 'dataset_name', headerName: 'Dataset', flex: 0.5 },
    {
      field: 'organization', headerName: 'Organization', width: 200,
      renderCell: (params) => {
        return renderCell(params, 'organization')
      }
    },
    {
      field: 'public', headerName: 'Public', width: 200,
      renderCell: (params) => {
        return renderCell(params, 'public')
      }
    }
  ]

  /** Submit function **/
  const submit = (event) => {
    const target = event.currentTarget
    const permissions = []
    const users = tableData[UserTab].filter(data => {
      return data.permission !== 'None'
    }).map(data => {
      const id = data.dataset_id + '-' + data.indicator_id
      permissions.push(id)
      return {
        d: data.dataset_id,
        i: data.indicator_id,
        o: data.user_id,
        p: data.permission
      }
    })
    const groups = tableData[GroupTab].filter(data => {
      return data.permission !== 'None'
    }).map(data => {
      const id = data.dataset_id + '-' + data.indicator_id
      permissions.push(id)
      return {
        d: data.dataset_id,
        i: data.indicator_id,
        o: data.group_id,
        p: data.permission
      }
    })
    const generals = tableData[GeneralTab].filter(data => {
      const id = data.dataset_id + '-' + data.indicator_id
      return permissions.includes(id) ||
        data.organization !== 'None' ||
        data.public !== 'None'
    }).map(data => {
      return {
        d: data.dataset_id,
        i: data.indicator_id,
        o: data.organization,
        p: data.public,
      }
    })
    const payload = {
      'users': users,
      'groups': groups,
      'generals': generals,
    }
    setSubmitted(true)
    $.ajax({
      url: urls.api.permissions,
      data: {
        data: JSON.stringify(payload)
      },
      dataType: 'json',
      type: 'POST',
      success: function () {
        setSubmitted(false)
        setAnchorEl(target)
        setInfo("<div class='FormOk'>Configuration has been saved!</div>")
        setDefaultTableTableData(dictDeepCopy(tableData))
      },
      error: function (error, textStatus, request) {
        setSubmitted(false)
        setAnchorEl(target)
        setInfo("<div class='FormError'>" + textStatus + "</div>")
      },
      beforeSend: beforeAjaxSend
    });
  }

  /** Format data to table data **/
  const formatData = (data) => {
    const users = []
    const groups = []
    const generals = []
    data['permissions'][UserTab].map((obj, idx) => {
      users.push({
        'id': idx,
        'dataset_id': obj.d,
        'dataset_name': obj.dn,
        'indicator_id': obj.i,
        'indicator_name': obj.in,
        'user_id': obj.o,
        'user_name': obj.on,
        'user_role': obj.or,
        'permission': obj.p
      })
    })
    data['permissions'][GroupTab].map((obj, idx) => {
      groups.push({
        'id': idx,
        'dataset_id': obj.d,
        'dataset_name': obj.dn,
        'indicator_id': obj.i,
        'indicator_name': obj.in,
        'group_id': obj.o,
        'group_name': obj.on,
        'permission': obj.p
      })
    })
    data['permissions'][GeneralTab].map((obj, idx) => {
      generals.push({
        'id': idx,
        'dataset_id': obj.d,
        'dataset_name': obj.dn,
        'indicator_id': obj.i,
        'indicator_name': obj.in,
        'organization': obj.o,
        'public': obj.p,
      })
    })
    const tableData = {}
    tableData[UserTab] = users
    tableData[GroupTab] = groups
    tableData[GeneralTab] = generals
    setTableData(tableData)
    setDefaultTableTableData(dictDeepCopy(tableData))
  }


  /** Fetch data **/
  useEffect(() => {
    fetchJSON(urls.api.permissions)
      .then(data => {
        setData(data)
        formatData(data)
      })
  }, [])

  // Check if the data changed
  let changed = false;
  if (tableData) {
    changed = JSON.stringify(tableData) !== JSON.stringify(defaultTableData)
  }

  // For filtered data
  const filteredTableData = dictDeepCopy(tableData)
  if (filteredTableData) {
    if (filterByIndicators.length) {
      filteredTableData[tab] = filteredTableData[tab].filter(data => {
        return filterByIndicators.includes(data.indicator_id)
      })
    }
    if (filterByDatasets.length) {
      filteredTableData[tab] = filteredTableData[tab].filter(data => {
        return filterByDatasets.includes(data.dataset_id)
      })
    }
    if (tab === UserTab && filterByUsers.length) {
      filteredTableData[tab] = filteredTableData[tab].filter(data => {
        return filterByUsers.includes(data.user_id)
      })
    }
    if (tab === GroupTab && filterByGroups.length) {
      filteredTableData[tab] = filteredTableData[tab].filter(data => {
        return filterByGroups.includes(data.group_id)
      })
    }
    if (filterByPermissions.length) {
      if (tab !== GeneralTab) {
        filteredTableData[tab] = filteredTableData[tab].filter(data => {
          return filterByPermissions.includes(data.permission)
        })
      } else {
        filteredTableData[tab] = filteredTableData[tab].filter(data => {
          return filterByPermissions.includes(data.organization) || filterByPermissions.includes(data.public)
        })
      }
    }
  }

  // For notification
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const buttonID = open ? "Button-Save" : undefined;
  return (
    <Admin
      pageName={pageNames.DataAccess}
      rightHeader={
        <Fragment>
          <ThemeButton
            variant="secondary" onClick={() => {
            setTableData(dictDeepCopy(defaultTableData))
          }}
            disabled={!changed || submitted}>
            <SettingsBackupRestoreIcon/> Default
          </ThemeButton>
          <SaveButton
            id={buttonID}
            variant="secondary Reverse"
            text="Apply"
            onClick={submit}
            disabled={!changed || submitted}
          />
          <Popover
            id={buttonID}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <div className='Popover-Submit'
                 dangerouslySetInnerHTML={{ __html: info }}>
            </div>
          </Popover>
        </Fragment>
      }>
      <div className='AdminList DataAccessAdmin'>
        {/* FILTERS */}
        <div className='DataAccessAdminFilters'>
          <ModalFilter
            filterType={IndicatorTab}
            placeholder={'Filter by Indicator(s)'}
            data={filterByIndicators}
            setData={setFilterByIndicator}/>
          <ModalFilter
            filterType={DatasetTab}
            placeholder={'Filter by Dataset(s)'}
            data={filterByDatasets}
            setData={setFilterByDataset}/>
          <SelectFilter
            title={'Filter by Permission(s)'} data={filterByPermissions}
            setData={setFilterByPermission}
            options={data ? data.permission_choices : []}/>
          {
            tab === UserTab ? (
              <ModalFilter
                filterType={UserTab}
                placeholder={'Filter by User(s)'}
                data={filterByUsers}
                setData={setFilterByUsers}
              />
            ) : tab === GroupTab ? (
              <ModalFilter
                filterType={GroupTab}
                placeholder={'Filter by Group(s)'}
                data={filterByGroups}
                setData={setFilterByGroups}
              />
            ) : ""
          }
        </div>
        <div className='Tab TabPrimary'>
          <div
            className={tab === UserTab ? "Selected" : ""}
            onClick={() => setTab(UserTab)}
          >
            User(s)
          </div>
          <div
            className={tab === GroupTab ? "Selected" : ""}
            onClick={() => setTab(GroupTab)}
          >
            Group(s)
          </div>
          <div
            className={tab === GeneralTab ? "Selected" : ""}
            onClick={() => setTab(GeneralTab)}
          >
            General
          </div>

          {/* Other buttons */}
          <div className='Separator'></div>
          {
            [UserTab, GroupTab].includes(tab) && data ?
              <Fragment>
                <DeleteButton
                  disabled={!selectionModel.length}
                  variant="secondary Reverse"
                  text={"Delete"}
                  onClick={() => {
                    if (confirm("Do you want to delete the selected data?") === true) {
                      tableData[tab] = tableData[tab].filter(data => !selectionModel.includes(data.id))
                      setTableData({ ...tableData })
                      setSelectionModel([])
                    }
                  }}
                />
                <EditButton
                  disabled={!selectionModel.length}
                  variant="secondary Reverse"
                  text={"Change permission"}
                  onClick={() => {
                    setUpdatePermissionOpen(true)
                  }}
                />
                <UpdatePermissionModal
                  open={updatePermissionOpen}
                  setOpen={setUpdatePermissionOpen}
                  choices={data['permission_choices'].filter(choice => {
                    return !(tab !== 'Generals' && choice[0] === 'None')
                  })}
                  selectedPermission={(permission) => {
                    tableData[tab].filter(data => {
                      if (selectionModel.includes(data.id)) {
                        data.permission = permission
                      }
                    })
                    setTableData({ ...tableData })
                    setSelectionModel([])
                    setUpdatePermissionOpen(false)
                  }}
                />
                <AddButton
                  variant="secondary"
                  text={"Share to " + tab}
                  onClick={() => {
                    setAddPermissionOpen(true)
                  }}
                />
                <AddData
                  open={addPermissionOpen}
                  setOpen={setAddPermissionOpen}
                  permissions={data['permission_choices'].filter(choice => {
                    return !(tab !== 'Generals' && choice[0] === 'None')
                  })}
                  tab={tab}
                  data={tableData[tab]}
                  updateData={(data) => {
                    tableData[tab] = data
                    setTableData({ ...tableData })
                  }}
                />
              </Fragment> : ""
          }
        </div>
        <div>
          {
            !tableData ?
              <div className='DataAccessAdminTable Loading'>
                <CircularProgress/>
              </div> : (
                <AccessData
                  rows={filteredTableData[tab]} columns={COLUMNS[tab]}
                  selected={[UserTab, GroupTab].includes(tab)}
                  selectionModel={selectionModel}
                  setSelectionModel={setSelectionModel}
                />
              )
          }
        </div>
      </div>
    </Admin>
  );
}

render(DataAccessAdmin, store)