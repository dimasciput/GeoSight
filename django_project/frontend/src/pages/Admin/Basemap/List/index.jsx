import React from 'react';
import { GridActionsCellItem } from "@mui/x-data-grid";

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import { COLUMNS, COLUMNS_ACTION } from "../../Components/List";
import AdminList from "../../AdminList";
import PermissionModal from "../../Permission";

import './style.scss';

/**
 * Indicator List App
 */
export default function BasemapList() {
  const pageName = pageNames.Basemaps
  const columns = COLUMNS(pageName, urls.admin.basemapList);
  columns[4] = {
    field: 'actions',
    type: 'actions',
    cellClassName: 'MuiDataGrid-ActionsColumn',
    width: 100,
    getActions: (params) => {
      const permission = params.row.permission

      // Create actions
      const actions = [].concat(
        COLUMNS_ACTION(
          params, urls.admin.basemapList, urls.api.edit, urls.api.detail
        )
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
  return <AdminList
    columns={columns}
    pageName={pageName}
    listUrl={urls.api.list}
  />
}

render(BasemapList, store)