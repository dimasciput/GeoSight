import React from 'react';
import ModalSelector from './Modal'
import './style.scss';

const columns = [
  { field: 'id', headerName: 'id', hide: true },
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'shortcode', headerName: 'Code', flex: 1 },
  { field: 'description', headerName: 'Description', flex: 1 },
  { field: 'category', headerName: 'Category', flex: 1 },
]
/**
 * For group data selection.
 * @param {boolean} open Is modal opened.
 * @param {Function} setOpen Function of set open.
 * @param {Array} selectedData Selected group.
 * @param {Function} selectedDataChanged Function of Selected group changed.
 * */
export default function IndicatorSelector(
  {
    open,
    setOpen,
    selectedData,
    selectedDataChanged
  }
) {
  return <ModalSelector
    title={"Indicator(s)"}
    api={urls.api.indicators}
    columns={columns}
    open={open}
    setOpen={setOpen}
    selectedData={selectedData}
    selectedDataChanged={selectedDataChanged}
    defaultSorting={[{ field: 'name', sort: 'asc' }]}
  />

}