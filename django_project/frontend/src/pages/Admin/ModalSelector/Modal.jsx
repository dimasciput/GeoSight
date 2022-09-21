import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from '@mui/icons-material/Search';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import Modal, { ModalContent, ModalHeader } from "../../../components/Modal";
import { IconTextField } from "../../../components/Elements/Input";
import { SaveButton } from "../../../components/Elements/Button";
import { fetchJSON } from "../../../Requests";

import './style.scss';

/**
 * For modal data selection.
 * @param {String} title Title of modal.
 * @param {String} api api url of data.
 * @param {Array} columns Columns for table.
 * @param {boolean} open Is modal opened.
 * @param {Function} setOpen Function of set open.
 * @param {Array} selectedData Selected data.
 * @param {Function} selectedDataChanged Function of Selected data changed.
 * @param {Array} defaultSorting Default sorting table.
 * */
export default function ModalSelector(
  {
    title,
    api,
    columns,
    open,
    setOpen,
    selectedData,
    selectedDataChanged,
    defaultSorting
  }
) {
  const [data, setData] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [selectionModel, setSelectionModel] = useState([]);
  const [search, setSearch] = useState(null);
  /** Search on change */
  const searchOnChange = (evt) => {
    setSearch(evt.target.value.toLowerCase())
  }

  /** Filter by search input */
  const fields = columns.map(column => column.field).filter(column => column !== 'id')
  let rows = data;
  if (search) {
    rows = rows.filter(row => {
      let found = false
      fields.map(field => {
        if (row[field].toLowerCase().includes(search)) {
          found = true;
        }
      })
      return found
    })
  }

  /** Fetch data when modal is opened **/
  useEffect(() => {
    if (open && !loaded) {
      setLoaded(true)
      fetchJSON(api)
        .then(data => {
          setData(data)
        })
    }
  }, [open])

  /** Fetch data when modal is opened **/
  useEffect(() => {
    if (selectedData) {
      setSelectionModel(selectedData.map(row => {
        if (row.id) {
          return row.id
        } else {
          return row
        }
      }))
    }
  }, [selectedData])

  let selectedModel = []
  if (data) {
    selectedModel = data.filter(row => {
      return selectionModel.includes(row.id)
    })
  }
  return <div>
    <div className='ModalDataSelectorSelected'>
      {
        selectedModel.map(
          selectedModelData => <div
            key={selectedModelData.id}
            className='ModalDataSelectorSelectedObject'>
            <div>{selectedModelData.name}</div>
            <RemoveCircleIcon onClick={() => {
              const selectedData = [...selectionModel.filter(id => id !== selectedModelData.id)]
              const newData = data.filter(row => {
                return selectedData.includes(row.id)
              })
              selectedDataChanged(newData)
              setOpen(false)
            }}/>
          </div>
        )
      }
    </div>
    <Modal
      className='ModalDataSelector'
      open={open}
      onClosed={() => {
        setOpen(false)
      }}
    >
      <ModalHeader onClosed={() => {
        setOpen(false)
      }}>
        Select {title}
      </ModalHeader>
      {
        !data ?
          <div style={{ textAlign: "center" }}>
            <ModalContent><CircularProgress/></ModalContent>
          </div> :

          <div className='AdminContent'>
            <div className='AdminBaseInput Indicator-Search'>
              <IconTextField
                placeholder={"Search " + title}
                iconStart={<SearchIcon/>}
                onChange={searchOnChange}
                value={search ? search : ""}
              />
            </div>

            <div className='AdminList'>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={20}
                rowsPerPageOptions={[20]}
                initialState={{
                  sorting: {
                    sortModel: defaultSorting,
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
            <div className='Save-Button'>
              <SaveButton
                variant="secondary"
                text={"Update Selection"}
                onClick={() => {
                  const newData = data.filter(row => {
                    return selectionModel.includes(row.id)
                  })
                  selectedDataChanged(newData)
                  setOpen(false)
                }}
              />
            </div>
          </div>
      }
    </Modal>
  </div>
}