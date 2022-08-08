import React from 'react';

import PublishIcon from '@mui/icons-material/Publish';
import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import { COLUMNS_ACTION } from "../../Components/List";
import AdminList from "../../AdminList";

import {
  AddButton,
  ThemeButton
} from "../../../../components/Elements/Button";

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
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'indicator', headerName: 'Indicator', flex: 1 },
    { field: 'last_run', headerName: 'Last Run', flex: 1 },
    { field: 'creator_name', headerName: 'Creator', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      width: 80,
      getActions: (params) => {
        params.id = params.row.unique_id
        return COLUMNS_ACTION(params, redirectUrl, editUrl, detailUrl)
      },
    }
  ]
}

/**
 * Indicator List App
 */
export default function HarvesterList() {
  const pageName = pageNames.Harvester
  return <AdminList
    columns={COLUMNS(pageName, urls.admin.harvesterList)}
    pageName={pageName}
    listUrl={urls.api.list}
    rightHeader={
      <div>
        <a href={urls.api.ingestor}>
          <ThemeButton
            variant="secondary"
          >
            <PublishIcon/>Meta Ingestor
          </ThemeButton>
        </a>
        <a href={urls.api.create}>
          <AddButton
            variant="secondary"
            text={"Add New Harvester"}
          />
        </a>
      </div>
    }
  />
}

render(HarvesterList, store)