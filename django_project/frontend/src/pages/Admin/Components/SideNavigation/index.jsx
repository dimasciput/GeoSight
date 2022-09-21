import React, { Fragment } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LayersIcon from '@mui/icons-material/Layers';
import MapIcon from '@mui/icons-material/Map';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import StorageIcon from '@mui/icons-material/Storage';

import { pageNames } from '../../index'

import './style.scss';

/**
 * Admin side navigation bad
 * @param {string} pageName Page name indicator
 */
export default function SideNavigation({ pageName }) {
  const dashboardList = urls.admin.dashboardList; // eslint-disable-line no-undef
  const indicatorList = urls.admin.indicatorList; // eslint-disable-line no-undef
  const basemapList = urls.admin.basemapList; // eslint-disable-line no-undef
  const contextLayerList = urls.admin.contextLayerList; // eslint-disable-line no-undef
  const harvesterList = urls.admin.harvesterList; // eslint-disable-line no-undef
  const userList = urls.admin.userList; // eslint-disable-line no-undef
  const groupList = urls.admin.groupList; // eslint-disable-line no-undef
  const dataAccess = urls.admin.dataAccess; // eslint-disable-line no-undef
  return (
    <div className='SideNavigation'>
      <a href='/' className='SideNavigation-Row'>
        <HomeIcon className='SideNavigation-Row-Icon'/>
        <span className='SideNavigation-Row-Name'>Home</span>
      </a>
      <a href={dashboardList}
         className={'SideNavigation-Row ' + (pageName === pageNames.Dashboard ? 'active' : '')}>
        <InsertDriveFileIcon className='SideNavigation-Row-Icon'/>
        <span className='SideNavigation-Row-Name'>Projects</span>
      </a>
      <a href={indicatorList}
         className={'SideNavigation-Row ' + (pageName === pageNames.Indicators ? 'active' : '')}>
        <ListAltIcon className='SideNavigation-Row-Icon'/>
        <span className='SideNavigation-Row-Name'>Indicators</span>
      </a>
      <a href={contextLayerList}
         className={'SideNavigation-Row ' + (pageName === pageNames.ContextLayer ? 'active' : '')}>
        <LayersIcon className='SideNavigation-Row-Icon'/>
        <span className='SideNavigation-Row-Name'>Context Layers</span>
      </a>
      <a href={basemapList}
         className={'SideNavigation-Row ' + (pageName === pageNames.Basemaps ? 'active' : '')}>
        <MapIcon className='SideNavigation-Row-Icon'/>
        <span className='SideNavigation-Row-Name'>Basemaps</span>
      </a>
      <a href={harvesterList}
         className={'SideNavigation-Row ' + (pageName === pageNames.Harvester ? 'active' : '')}>
        <CloudSyncIcon className='SideNavigation-Row-Icon'/>
        <span className='SideNavigation-Row-Name'>Harvesters</span>
      </a>
      {
        user.is_admin ? <Fragment>
          <a href={userList}
             className={'SideNavigation-Row ' + (pageName === pageNames.Users ? 'active' : '')}>
            <PersonIcon className='SideNavigation-Row-Icon'/>
            <span className='SideNavigation-Row-Name'>Users</span>
          </a>
          <a href={groupList}
             className={'SideNavigation-Row ' + (pageName === pageNames.Groups ? 'active' : '')}>
            <GroupsIcon className='SideNavigation-Row-Icon'/>
            <span className='SideNavigation-Row-Name'>Groups</span>
          </a>
          <a href={dataAccess}
             className={'SideNavigation-Row ' + (pageName === pageNames.DataAccess ? 'active' : '')}>
            <StorageIcon className='SideNavigation-Row-Icon'/>
            <span className='SideNavigation-Row-Name'>Data Access</span>
          </a>
        </Fragment> : ""
      }
    </div>
  );
}