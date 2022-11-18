/* ==========================================================================
   NAVBAR
   ========================================================================== */

import React from 'react';
import $ from 'jquery';
import i18n from "i18next";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

import User from './User'

import './style.scss';

/**
 * Navbar.
 * **/
export default function NavBar() {
  const { icon, site_title } = preferences;
  const { username, full_name, is_staff, is_contributor } = user;

  // Set width of logo
  // Not working using css on firefox
  $('.page__header-logo').width($('.page__header-link').width());

  return (
    <header>
      <div className='NavHeader'>
        <ul className='NavHeader Menu'>
          <li className='NavHeaderLogo'>
            <a
              href='/'
              title={i18n.t('Homepage')}
              className='nav-header-link'
            >
              <img src={icon} alt="Logo"/>
            </a>
          </li>
          <li className='NavHeaderTitle'>
            <button type='<button'>
              <a
                href='/'
                title={i18n.t('Homepage')}
                className='NavHeaderLink'
              >
                {site_title}
              </a>
            </button>
          </li>
          {
            headerTitle ?
              <li
                className='NavHeaderRight HeaderTitle'>{headerTitle}</li> : ''
          }
          {
            is_contributor ? (
              <li className='NavHeaderRight First'>
                <div>
                  <button type="button">
                    <a href={urls.admin.dashboardList}
                       className='NavHeader-Options'
                       title={"Admin Panel"}><ManageAccountsIcon/></a>
                  </button>
                </div>
              </li>
            ) : ''
          }
          <li className={'NavHeaderRight ' + (!is_contributor ? 'First' : "")}>
            <User/>
          </li>
        </ul>
      </div>
    </header>
  )
}

