import React, { Fragment, useEffect, useState } from 'react';

import ShareIcon from '@mui/icons-material/Share';
import CircularProgress from '@mui/material/CircularProgress';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import DoDisturbOnIcon from '@mui/icons-material/DoDisturbOn';
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";

import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader
} from "../../../components/Modal";
import {
  AddButton,
  DeleteButton,
  EditButton,
  SaveButton
} from "../../../components/Elements/Button";
import { fetchJSON } from "../../../Requests";
import { dictDeepCopy } from "../../../utils/main";

import './style.scss';
import $ from "jquery";

/**
 * Permission Configuration Form Table data selection
 * @param {str} dataUrl Url for data.
 * @param {str} permissionLabel permission label.
 * @param {Array} permissionChoices permission choices.
 * @param {Array} columns Columns data.
 * @param {boolean} open Is modal opened.
 * @param {Function} setOpen Function of set open.
 * @param {Dict} permissionData Selected data.
 * @param {Function} setPermissionData Set permission data.
 * @param {string} permissionDataListKey The key for the data.
 * */
export function PermissionFormTableDataSelection(
  {
    dataUrl,
    permissionLabel,
    permissionChoices,
    open,
    setOpen,
    columns,
    permissionData,
    setPermissionData,
    permissionDataListKey
  }
) {
  const selectedData = permissionData[permissionDataListKey]
  const [permissionChoice, setPermissionChoice] = useState(permissionChoices[0][0])
  const [data, setData] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [selectionModel, setSelectionModel] = useState([]);

  const selectedIds = selectedData.map(data => {
    return data.id
  })
  let unselectedData = []
  if (data) {
    unselectedData = data.filter(data => {
      return !selectedIds.includes(data.id)
    })
  }


  /** Fetch data when modal is opened **/
  useEffect(() => {
    if (open && !loaded) {
      setLoaded(true)
      fetchJSON(dataUrl)
        .then(data => {
          setData(data)
        })
    }
  }, [open])

  return <Modal
    className='PermissionFormModal'
    open={open}
    onClosed={() => {
      setOpen(false)
    }}
  >
    <ModalHeader onClosed={() => {
      setOpen(false)
    }}>
      List of {permissionLabel}
    </ModalHeader>
    <ModalContent>
      <div className='BasicForm'>
        <div className="BasicFormSection">
          <div>
            <label className="form-label">Permission</label>
          </div>
          <div>
            <FormControl className='BasicForm'>
              <Select
                value={permissionChoice}
                onChange={(evt) => {
                  setPermissionChoice(evt.target.value)
                }}
              >
                {
                  permissionChoices.map(choice => {
                    return <MenuItem
                      key={choice[0]}
                      value={choice[0]}>{choice[1]}</MenuItem>
                  })
                }
              </Select>
            </FormControl>
          </div>
        </div>
      </div>
      {
        !data ?
          <div style={{ textAlign: "center" }}>
            <CircularProgress/>
          </div> :
          <div style={{ height: '300px' }}>
            <DataGrid
              rows={unselectedData}
              columns={columns}
              pageSize={20}
              rowsPerPageOptions={[20]}
              initialState={{
                sorting: {
                  sortModel: [{ field: 'username', sort: 'asc' }],
                },
              }}
              disableSelectionOnClick

              checkboxSelection={true}
              onSelectionModelChange={(newSelectionModel) => {
                setSelectionModel(newSelectionModel);
              }}
              selectionModel={selectionModel}
            />
          </div>
      }
    </ModalContent>
    <ModalFooter>
      <div className='Save-Button'>
        <SaveButton
          variant="secondary"
          text={"Add " + permissionLabel + 's'}
          onClick={() => {
            const newData = data.filter(row => {
              row.permission = permissionChoice
              return selectionModel.includes(row.id)
            })
            permissionData[permissionDataListKey] = permissionData[permissionDataListKey].concat(newData)
            setPermissionData({ ...permissionData })
            setOpen(false)
          }}
        />
      </div>
    </ModalFooter>
  </Modal>
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
 * Permission Configuration Form Table
 * @param {str} permissionLabel permissionLabel.
 * @param {Array} columns Columns data.
 * @param {dict} data Permission data.
 * @param {string} dataListKey Permission data list.
 * @param {Function} setData Function of set data.
 * @param {List} permissionChoices Permission choice.
 * @param {string} dataUrl Data URL.
 * */
export function PermissionFormTable(
  {
    permissionLabel, columns,
    data, dataListKey,
    setData, permissionChoices,
    dataUrl
  }
) {
  const [open, setOpen] = useState(false)
  const [openPermission, setOpenPermission] = useState(false)
  const [selectionModel, setSelectionModel] = useState([]);
  const dataList = data[dataListKey]
  return <div>
    <div className='PermissionFormTableHeader'>
      <DeleteButton
        disabled={!selectionModel.length}
        variant="secondary Reverse"
        text={"Delete"}
        onClick={() => {
          if (confirm("Do you want to delete the selected data?") === true) {
            data[dataListKey] = dataList.filter(row => !selectionModel.includes(row.id))
            setData({ ...data })
            setSelectionModel([])
          }
        }}
      />
      <EditButton
        disabled={!selectionModel.length}
        variant="secondary Reverse"
        text={"Change permission"}
        onClick={() => {
          setOpenPermission(true)
        }}
      />
      <AddButton
        variant="secondary"
        text={"Share to new " + permissionLabel.toLowerCase() + "(s)"}
        onClick={() => {
          setOpen(true)
        }}
      />
    </div>
    <div className='PermissionFormTable MuiDataGridTable'>
      <DataGrid
        rows={dataList}
        getRowClassName={(params) => `${params.row.creator ? 'Creator' : ''}`}
        columns={columns.concat([
          {
            field: 'permission', headerName: 'Permission', flex: 1,
            renderCell: (params) => {
              return <FormControl className='BasicForm'>
                <Select
                  disabled={params.row.creator}
                  value={params.row.permission}
                  onChange={(evt) => {
                    params.row.permission = evt.target.value
                    setData({ ...data })
                  }}
                >
                  {
                    permissionChoices.map(choice => {
                      return <MenuItem
                        key={choice[0]}
                        value={choice[0]}>{choice[1]}</MenuItem>
                    })
                  }
                </Select>
              </FormControl>
            }
          },
          {
            field: 'actions',
            type: 'actions',
            width: 80,
            getActions: (params) => {
              if (params.row.creator) {
                return []
              }
              return [
                <GridActionsCellItem
                  icon={
                    <DoDisturbOnIcon
                      className='DeleteButton'/>
                  }
                  onClick={() => {
                    data[dataListKey] = dataList.filter(row => {
                      return row.id !== params.row.id
                    })
                    setData({ ...data })
                  }}
                  label="Delete"
                />
              ]
            },
          }
        ])
        }
        pageSize={20}
        rowsPerPageOptions={[20]}
        initialState={{
          sorting: {
            sortModel: [{ field: 'username', sort: 'asc' }],
          },
        }}
        disableSelectionOnClick

        checkboxSelection={true}
        onSelectionModelChange={(newSelectionModel) => {
          setSelectionModel(newSelectionModel);
        }}
        selectionModel={selectionModel}
      />
      <PermissionFormTableDataSelection
        permissionLabel={permissionLabel}
        permissionChoices={permissionChoices}
        columns={columns}
        open={open}
        setOpen={setOpen}
        dataUrl={dataUrl}
        permissionData={data}
        setPermissionData={setData}
        permissionDataListKey={dataListKey}
      />
    </div>
    <UpdatePermissionModal
      choices={permissionChoices} open={openPermission}
      setOpen={setOpenPermission}
      selectedData={dataList.filter(data => selectionModel.includes(data.id))}
      selectedPermission={(permission) => {
        dataList.map(row => {
          if (selectionModel.includes(row.id)) {
            row.permission = permission
          }
        })
        data[dataListKey] = dataList
        setData({ ...data })
        setOpenPermission(false)
        setSelectionModel([])
      }}
    />
  </div>
}

/**
 * Permission Configuration Form.
 * Can be used without using modal.
 * @param {dict} data Permission data.
 * @param {Function} setData Function of set data.
 * */
export function PermissionForm({ data, setData }) {
  const [tab, setTab] = useState('UserAccess')
  return <Fragment>
    {
      !data ?
        <div style={{ textAlign: "center" }}>
          <CircularProgress/>
        </div> :
        <div className={'PermissionForm BasicForm ' + tab}>
          <div className='TabPrimary'>
            <div className={tab === 'UserAccess' ? 'Selected' : ''}
                 onClick={() => setTab('UserAccess')}>
              User Access ({data.user_permissions.length})
            </div>
            <div className={tab === 'GroupAccess' ? 'Selected' : ''}
                 onClick={() => setTab('GroupAccess')}>
              Group Access ({data.group_permissions.length})
            </div>
            <div className={tab === 'GeneralAccess' ? 'Selected' : ''}
                 onClick={() => setTab('GeneralAccess')}>
              General Access
            </div>
          </div>
          {/* USERS ACCESS */}
          {
            tab === "UserAccess" ?
              <div className="UserAccess">
                <PermissionFormTable
                  permissionLabel='User'
                  columns={[
                    { field: 'id', headerName: 'id', hide: true },
                    { field: 'username', headerName: 'Username', flex: 1 },
                    { field: 'email', headerName: 'Email', flex: 1 },
                    { field: 'name', headerName: 'Name', flex: 1 },
                    { field: 'role', headerName: 'Role', flex: 1 },
                  ]}
                  data={data}
                  dataListKey='user_permissions'
                  setData={setData}
                  permissionChoices={data.choices.user_permission}
                  dataUrl={urls.api.users}
                />
              </div> : ""
          }

          {/* GROUP ACCESS */}
          {
            tab === "GroupAccess" ?
              <div className="GroupAccess">
                <PermissionFormTable
                  permissionLabel='Group'
                  columns={[
                    { field: 'id', headerName: 'id', hide: true },
                    { field: 'name', headerName: 'Group name', flex: 1 },
                  ]}
                  data={data}
                  dataListKey='group_permissions'
                  setData={setData}
                  permissionChoices={data.choices.group_permission}
                  dataUrl={urls.api.groups}
                />
              </div> : ""
          }

          {/* ORGANIZATION ACCESS */}
          {
            tab === "GeneralAccess" ?
              <div className='GeneralAccess'>
                <div className="BasicFormSection">
                  <div>
                    <label className="form-label">
                      Organization Access
                    </label>
                  </div>
                  <FormControl>
                    <RadioGroup
                      value={data.organization_permission}
                      name="radio-buttons-group"
                      onChange={(evt) => {
                        data.organization_permission = evt.target.value
                        setData({ ...data })
                      }}
                    >
                      {
                        data.choices.organization_permission.map(choice => {
                          return <FormControlLabel
                            key={choice[0]}
                            value={choice[0]} control={<Radio/>}
                            label={choice[1]}/>
                        })
                      }
                    </RadioGroup>
                  </FormControl>
                </div>

                {/* PUBLIC ACCESS */}
                <div className="BasicFormSection">
                  <div>
                    <label className="form-label">Public Access</label>
                  </div>
                  <FormControl>
                    <RadioGroup
                      value={data.public_permission}
                      name="radio-buttons-group"
                      onChange={(evt) => {
                        data.public_permission = evt.target.value
                        setData({ ...data })
                      }}
                    >
                      {
                        data.choices.public_permission.map(choice => {
                          return <FormControlLabel
                            key={choice[0]}
                            value={choice[0]} control={<Radio/>}
                            label={choice[1]}/>
                        })
                      }
                    </RadioGroup>
                  </FormControl>
                </div>
              </div> : ""
          }
        </div>
    }
  </Fragment>
}

/**
 * Permission Configuration
 * @param {string} name Name of data that will be updated.
 * @param {string} urlData Url to fetch data.
 * */
export default function PermissionModal({ name, urlData }) {
  const [open, setOpen] = useState(false)
  const [defaultData, setDefaultData] = useState(null)
  const [data, setData] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  /** Fetch data when modal is opened **/
  useEffect(() => {
    setUploaded(false)
    if (open) {
      if (!loaded) {
        setLoaded(true)
        fetchJSON(urlData)
          .then(data => {
            setDefaultData(data)
          })
      } else {
        setData(dictDeepCopy(defaultData))
      }
    }
  }, [open])

  /** Fetch data when modal is opened **/
  useEffect(() => {
    setData(dictDeepCopy(defaultData))
  }, [defaultData])

  return <Fragment>
    <ShareIcon onClick={() => setOpen(true)}/>
    <Modal
      className='PermissionFormModal'
      open={open}
      onClosed={() => {
        setOpen(false)
      }}
    >
      <ModalHeader onClosed={() => {
        setOpen(false)
      }}>
        {
          data ? "Share '" + name + "'" : 'Loading'
        }
      </ModalHeader>
      <ModalContent>
        <PermissionForm data={data} setData={setData}/>
      </ModalContent>
      <ModalFooter>
        <div className='Save-Button'>
          <SaveButton
            disabled={uploaded}
            variant="secondary"
            text={"Apply Changes"}
            onClick={() => {
              setUploaded(true)
              $.ajax({
                url: urlData,
                data: {
                  data: JSON.stringify(data)
                },
                dataType: 'json',
                type: 'POST',
                success: function () {
                  setDefaultData(data)
                  setOpen(false)
                },
                error: function (error, textStatus, request) {
                },
                beforeSend: beforeAjaxSend
              });
            }}
          />
        </div>
      </ModalFooter>
    </Modal>
  </Fragment>
}