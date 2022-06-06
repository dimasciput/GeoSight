/* ==========================================================================
   NAVBAR
   ========================================================================== */

import React from 'react';
import $ from 'jquery';
import i18n from "i18next";
import Button from "@mui/material/Button";

import User from './User'
import Links from './Links'

import './style.scss';

/**
 * Navbar.
 * **/
export default function NavBar() {
  const { icon, site_title } = preferences;

  // Set width of logo
  // Not working using css on firefox
  $('.page__header-logo').width($('.page__header-link').width());

  return (
    <header>
      <div className='page__header'>
        <ul className='page__header-menu'>
          <li className='page__header-logo'>
            <a
              href='/'
              title={i18n.t('Homepage')}
              className='page__header-link'
            >
              <img src={icon} alt="Logo"/>
            </a>
          </li>
          <li className='page__header-title'>
            <Button>
              <a
                href='/'
                title={i18n.t('Homepage')}
                className='page__header-link'
              >
                {site_title}
              </a>
            </Button>
          </li>
          <li>
            <Links/>
          </li>
          <li>
            <User/>
          </li>
        </ul>
      </div>
    </header>
  )
}

