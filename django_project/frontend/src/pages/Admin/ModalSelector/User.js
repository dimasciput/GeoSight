import React from 'react';
import ModalSelector from './Modal'
import './style.scss';

const columns = [
  { field: 'id', headerName: 'id', hide: true },
  { field: 'username', headerName: 'Username', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'role', headerName: 'Role', flex: 1 },
]
/**
 * For user data selection.
 * @param {boolean} open Is modal opened.
 * @param {Function} setOpen Function of set open.
 * @param {Array} selectedData Selected user.
 * @param {Function} selectedDataChanged Function of Selected user changed.
 * */
export default function UserSelector(
  {
    open,
    setOpen,
    selectedData,
    selectedDataChanged
  }
) {

  return <ModalSelector
    title={"User(s)"}
    api={urls.api.users}
    columns={columns}
    open={open}
    setOpen={setOpen}
    selectedData={selectedData}
    selectedDataChanged={selectedDataChanged}
    defaultSorting={[{ field: 'username', sort: 'asc' }]}
  />

}