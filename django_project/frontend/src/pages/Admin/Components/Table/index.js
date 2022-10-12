import React, { useEffect, useState } from 'react';
import { DataGrid } from "@mui/x-data-grid";

import './style.scss';

/**
 * Admin Table
 * @param {Array} rows List of data.
 * @param {Array} columns Columns for the table.
 * @param {function} selectionChanged Function when selection changed.
 * @param {dict} sortingDefault Soring default.
 */
export function AdminTable(
  {
    rows, columns, selectionChanged = null, sortingDefault = null
  }
) {
  const [selectionModel, setSelectionModel] = useState([]);

  // When selection model show
  useEffect(() => {
    if (selectionChanged) {
      selectionChanged(selectionModel)
    }
  }, [selectionModel]);

  if (rows) {
    let sorting = {
      sortModel: [{ field: 'name', sort: 'asc' }],
    }
    if (sortingDefault) {
      sorting = sortingDefault
    }
    return (
      <div className='AdminTable'>
        <DataGrid
          getRowClassName={(params) => {
            return !params.row.permission || params.row.permission.read ? 'ResourceRow Readable' : 'ResourceRow'
          }}
          rows={rows}
          columns={columns}
          pageSize={20}
          rowsPerPageOptions={[20]}
          initialState={{
            sorting: sorting,
          }}
          disableSelectionOnClick

          checkboxSelection={!!selectionChanged}
          onSelectionModelChange={(newSelectionModel) => {
            setSelectionModel(newSelectionModel);
          }}
          selectionModel={selectionModel}
        />
      </div>
    )
  } else {
    return <div className='AdminTable-Loading'>Loading</div>
  }
}