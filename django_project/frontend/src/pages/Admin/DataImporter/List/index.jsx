import React from 'react';

import PublishIcon from '@mui/icons-material/Publish';
import { GridActionsCellItem } from "@mui/x-data-grid";
import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import AdminList from "../../AdminList";

import { ThemeButton } from "../../../../components/Elements/Button";
import MoreAction from "../../../../components/Elements/MoreAction";
import { COLUMNS_ACTION } from "../../Components/List";
import PermissionModal from "../../Permission";

import './style.scss';

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
  editUrl = editUrl ? editUrl : urls.api.edit;
  detailUrl = detailUrl ? detailUrl : urls.api.detail;
  return [
    { field: 'id', headerName: 'id', hide: true, width: 30, },
    {
      field: 'name', headerName: 'Harvester ID', width: 300,
      renderCell: (params) => {
        if (editUrl) {
          return <a className='MuiButtonLike CellLink'
                    href={editUrl.replace('/0', `/${params.value}`)}>
            {params.value}
          </a>
        } else {
          return params.value
        }
      }
    },
    {
      field: 'reference_layer_name',
      headerName: 'Reference Layer',
      width: 150
    },
    {
      field: 'admin_level',
      headerName: 'Level',
      width: 100
    },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'last_run', headerName: 'Last Run', flex: 1 },
    { field: 'creator_name', headerName: 'Creator', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      cellClassName: 'MuiDataGrid-ActionsColumn',
      width: 80,
      getActions: (params) => {
        params.id = params.row.unique_id
        const permission = params.row.permission

        // Create actions
        const actions = [].concat(
          COLUMNS_ACTION(params, redirectUrl, editUrl, detailUrl)
        );

        // Unshift before more & edit action
        if (permission.share) {
          actions.unshift(
            <GridActionsCellItem
              icon={
                <a>
                  <PermissionModal
                    name={params.row.name}
                    urlData={urls.api.permission.replace('/0', `/${params.id}`)}/>
                </a>
              }
              label="Change Share Configuration."
            />)
        }
        return actions
      },
    }
  ]
}

/**
 * Indicator List App
 */
export default function HarvesterList() {
  const pageName = pageNames.DataImporter
  return <AdminList
    columns={COLUMNS(pageName, urls.admin.dataImporterList)}
    pageName={pageName}
    listUrl={urls.api.list}
    sortingDefault={{
      sortModel: [{ field: 'last_run', sort: 'desc' }],
    }}
    rightHeader={
      <div className='AdminContentHeader-Right-Inner'>
        <MoreAction
          moreIcon={
            <ThemeButton
              variant="secondary"
            >
              <PublishIcon/>Import data from Excel
            </ThemeButton>
          }>
          <div className='IngestorList'>
            <a href={urls.api.meta_ingestor_wide_format}>WIDE Format</a>
          </div>
          <div className='IngestorList'>
            <a href={urls.api.meta_ingestor_long_format}>LONG Format</a>
          </div>
        </MoreAction>
      </div>
    }
  />
}

render(HarvesterList, store)