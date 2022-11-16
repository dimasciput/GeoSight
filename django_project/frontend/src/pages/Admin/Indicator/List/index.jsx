import React from 'react';
import Tooltip from "@mui/material/Tooltip";
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import MapIcon from '@mui/icons-material/Map';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import StorageIcon from '@mui/icons-material/Storage';
import { GridActionsCellItem } from "@mui/x-data-grid";

import { AddButton } from "../../../../components/Elements/Button";
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
export default function IndicatorList() {
  const pageName = pageNames.Indicators
  const columns = COLUMNS(pageName, urls.admin.indicatorList);

  columns[4] = {
    field: 'actions',
    type: 'actions',
    cellClassName: 'MuiDataGrid-ActionsColumn',
    width: 320,
    getActions: (params) => {
      const permission = params.row.permission
      // Create actions
      const actions = [].concat(
        COLUMNS_ACTION(
          params, urls.admin.indicatorList, urls.api.edit, urls.api.detail
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
      if (permission.delete) {
        actions.unshift(
          <GridActionsCellItem
            icon={
              <Tooltip title={`Go to data access.`}>
                <a
                  href={urls.api.permissionAdmin + '?indicators=' + params.id}>
                  <StorageIcon/>
                </a>
              </Tooltip>
            }
            label="Go to data access."
          />)
      }

      if (permission.edit) {
        actions.unshift(
          <GridActionsCellItem
            icon={
              <Tooltip title={`Management Map`}>
                <a
                  href={urls.api.map.replace('/0', `/${params.id}`)}>
                  <MapIcon/>
                </a>
              </Tooltip>
            }
            label="Edit"
          />)
      }
      if (permission.edit) {
        actions.unshift(
          <GridActionsCellItem
            icon={
              <Tooltip title={`Management Form`}>
                <a
                  href={urls.api.form.replace('/0', `/${params.id}`)}>
                  <DynamicFormIcon/>
                </a>
              </Tooltip>
            }
            label="Management Form"
          />)
      }
      if (permission.delete) {
        actions.unshift(
          <GridActionsCellItem
            className='TextButton'
            icon={
              <a href={urls.api.dataBrowser + '?indicators=' + params.id}>
                <div
                  className='MuiButton-Div MuiButtonBase-root MuiButton-secondary ThemeButton'>
                  <DataUsageIcon/> Value List
                </div>
              </a>
            }
            label="Value List"
          />)
      }
      return actions
    },
  }
  return <AdminList
    columns={columns}
    pageName={pageName}
    listUrl={urls.api.list}
    rightHeader={
      <div>
        <a href={urls.api.create}>
          <AddButton
            variant="secondary"
            text={"Add New Indicator"}
          />
        </a>
      </div>
    }
  />
}

render(IndicatorList, store)