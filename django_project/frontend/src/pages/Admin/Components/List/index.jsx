import React, { Fragment, useEffect, useState } from 'react';
import $ from "jquery";
import SearchIcon from '@mui/icons-material/Search';

import { GridActionsCellItem } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { AdminTable } from '../Table';
import { IconTextField } from '../../../../components/Elements/Input'
import { fetchingData } from "../../../../Requests";
import MoreAction from "../../../../components/Elements/MoreAction";
import { toSingular } from "../../../../utils/main";

import './style.scss';

/**
 *
 * DEFAULT COLUMNS ACTIONS
 * @param {dict} params Params for action.
 * @param {String} redirectUrl Url for redirecting after action done.
 * @param {String} editUrl Url for edit row.
 * @param {String} detailUrl Url for detail of row.
 * @param {React.Component} moreActions More actions before delete
 * @returns {list}
 */
export function COLUMNS_ACTION(
  params, redirectUrl, editUrl = null, detailUrl = null, moreActions = null
) {
  detailUrl = detailUrl ? detailUrl : urls.api.detail;
  const actions = []

  // Delete action
  const permission = params.row.permission
  if (!permission || permission.delete) {
    actions.push(
      <GridActionsCellItem
        icon={
          <MoreAction moreIcon={<MoreVertIcon/>}>
            {
              moreActions ? React.Children.map(moreActions, child => {
                return child
              }) : ''
            }
            {
              detailUrl ?
                <div className='error' onClick={
                  () => {
                    const api = detailUrl.replace('/0', `/${params.id}`);
                    if (confirm(`Are you sure you want to delete : ${params.row.name ? params.row.name : params.row.id}?`)) {
                      $.ajax({
                        url: api,
                        method: 'DELETE',
                        success: function () {
                          window.location = redirectUrl;
                        },
                        beforeSend: beforeAjaxSend
                      });
                      return false;
                    }
                  }
                }>
                  <DeleteIcon/> Delete
                </div> : ''
            }
          </MoreAction>
        }
        label="More"
      />
    )
  }
  return actions
}

/**
 *
 * DEFAULT COLUMNS
 * @param {String} pageName Page name.
 * @param {String} redirectUrl Url for redirecting after action done.
 * @param {String} editUrl Url for edit row.
 * @param {String} detailUrl Url for detail of row.
 * @returns {list}
 */
export function COLUMNS(pageName, redirectUrl, editUrl = null, detailUrl = null) {
  const singularPageName = toSingular(pageName)
  editUrl = editUrl ? editUrl : urls.api.edit;
  detailUrl = detailUrl ? detailUrl : urls.api.detail;
  const _columns = [
    { field: 'id', headerName: 'id', hide: true, width: 30, },
    {
      field: 'name', headerName: singularPageName + ' Name', flex: 1,
      renderCell: (params) => {
        const permission = params.row.permission
        if (editUrl && (!permission || permission.edit)) {
          return <a className='MuiButtonLike CellLink'
                    href={editUrl.replace('/0', `/${params.id}`)}>
            {params.value}
          </a>
        } else {
          return params.value
        }
      }
    },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 0.5 },
    {
      field: 'actions',
      type: 'actions',
      cellClassName: 'MuiDataGrid-ActionsColumn',
      width: 80,
      getActions: (params) => {
        return COLUMNS_ACTION(params, redirectUrl, editUrl, detailUrl)
      },
    }
  ]
  if (['indicator'].includes(singularPageName.toLowerCase())) {
    _columns[2] = { field: 'shortcode', headerName: 'Shortcode', flex: 0.5 }
  }
  return _columns
}

/**
 * Admin List App
 * @param {list} columns Columns setup.
 * @param {String} pageName Page Name.
 * @param {String} listUrl Url for list row.
 * @param {list} initData Init Data.
 * @param {function} selectionChanged Function when selection changed.
 */
export default function List(
  {
    columns, pageName, listUrl, initData,
    selectionChanged, sortingDefault
  }
) {
  const [data, setData] = useState(initData);
  const [search, setSearch] = useState(null);

  /** Fetch list of data */
  const fetchData = (url) => {
    if (!data) {
      fetchingData(url, {}, {}, (data) => {
        setData(data)
      })
    }
  }

  // Show modal when url changed
  useEffect(() => {
    fetchData(listUrl)
  }, [])

  /** Search on change */
  const searchOnChange = (evt) => {
    setSearch(evt.target.value.toLowerCase())
  }

  /** Filter by search input */
  let rows = data;
  if (search) {
    rows = rows.filter(row => {
      return row.name?.toLowerCase().includes(search)
        || row.category?.toLowerCase().includes(search)
        || row.description?.toLowerCase().includes(search)
        || row.shortcode?.toLowerCase().includes(search)
    })
  }

  /** Render **/
  return (
    <Fragment>
      <div className='AdminBaseInput Indicator-Search'>
        <IconTextField
          placeholder={"Search " + pageName}
          iconStart={<SearchIcon/>}
          onChange={searchOnChange}
        />
      </div>

      <div className='AdminList'>
        <AdminTable
          rows={rows} columns={columns}
          selectionChanged={selectionChanged}
          sortingDefault={sortingDefault}
        />
      </div>
    </Fragment>
  );
}