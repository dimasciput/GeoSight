import React from 'react';
import MapIcon from '@mui/icons-material/Map';
import { GridActionsCellItem } from "@mui/x-data-grid";

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import { COLUMNS, COLUMNS_ACTION } from "../../Components/List";
import { ThemeButton } from "../../../../components/Elements/Button";
import AdminList from "../../AdminList";
import PermissionModal from "../../Permission";

import './style.scss';

/**
 * Indicator List App
 */
export default function DashboardList() {
  const pageName = pageNames.Dashboard
  const columns = COLUMNS(pageName, urls.admin.dashboardList);
  columns[2] = { field: 'modified_at', headerName: 'Last Modified', flex: 1 }
  columns[4] = {
    field: 'actions',
    type: 'actions',
    cellClassName: 'MuiDataGrid-ActionsColumn',
    width: 210,
    getActions: (params) => {
      const permission = params.row.permission
      const actions = [].concat(COLUMNS_ACTION(params, urls.admin.dashboardList));
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
      if (permission.read) {
        actions.unshift(
          <GridActionsCellItem
            className='TextButton'
            icon={
              <a href={urls.api.map.replace('/0', `/${params.id}`)}>
                <ThemeButton variant='secondary'>
                  <MapIcon/> Preview
                </ThemeButton>

              </a>
            }
            label="Preview"
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

render(DashboardList, store)