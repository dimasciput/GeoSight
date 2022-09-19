import React from 'react';
import ModalSelector from './Modal'
import './style.scss';

const columns = [
  { field: 'id', headerName: 'id', hide: true },
  { field: 'name', headerName: 'Name', flex: 1 },
]
/**
 * For group data selection.
 * @param {boolean} open Is modal opened.
 * @param {Function} setOpen Function of set open.
 * @param {Array} selectedData Selected group.
 * @param {Function} selectedDataChanged Function of Selected group changed.
 * */
export default function GroupSelector(
  {
    open,
    setOpen,
    selectedData,
    selectedDataChanged
  }
) {
  return <ModalSelector
    title={"Group(s)"}
    api={urls.api.groups}
    columns={columns}
    open={open}
    setOpen={setOpen}
    selectedData={selectedData}
    selectedDataChanged={selectedDataChanged}
    defaultSorting={[{ field: 'name', sort: 'asc' }]}
  />

}