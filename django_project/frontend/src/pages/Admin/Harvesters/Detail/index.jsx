import React, { Fragment, useEffect, useState } from 'react';
import $ from 'jquery';
import ErrorIcon from '@mui/icons-material/Error';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import Admin, { pageNames } from "../../index";
import Modal, { ModalHeader } from "../../../../components/Modal";
import { EditButton } from "../../../../components/Elements/Button";

import './style.scss';
import CopyToClipboard from "../../../../components/Elements/CopyToClipboard";


/**
 * MetaIngestor App
 */
export default function Detail() {
  const period = 1000;
  const [open, setOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState(currentLogData);

  /** When current log is changed */
  useEffect(() => {
    if (currentLog && ['Running', 'Start'].includes(currentLog.status)) {
      setTimeout(function () {
        $.ajax({
          url: currentLog.api,
          dataType: 'json',
          success: function (json, textStatus, request) {
            setCurrentLog({ ...json })
          },
          error: function () {
            setCurrentLog({ ...currentLog })
          }
        });
      }, period);
    }
  }, [currentLog]);

  return (
    <Admin
      pageName={pageNames.Harvester}
      rightHeader={
        <a href={editUrl}>
          <EditButton
            variant="secondary"
            text="Edit"
          />
        </a>
      }
    >
      <div className='PageContent'>
        <b className='light'>Harvester Class</b> : {harvester.type}<br/>
        <b className='light'>Reference
          Layer</b> : {harvester.reference_layer_name} ({harvester.reference_layer})<br/>
        <b className='light'>Admin Level</b> : {harvester.admin_level}<br/>
        {
          harvester.indicator ? <Fragment><b
            className='light'>Indicator</b> : {harvester.indicator}<br/></Fragment> : ''
        }
        {
          harvester.frequency ? <Fragment><b
            className='light'>Frequency</b> : {harvester.frequency} day(s)<br/></Fragment> : ''
        }
        {
          currentLog ? (
            <div className='PageSection'>
              <div className='PageSectionTitle'>Last Run
                : {currentLog.start_time}</div>
              <div
                className={
                  'HarvesterStatus ' + currentLog.status
                }>
                <span>{currentLog.status} </span>
                <span
                  dangerouslySetInnerHTML={{ __html: currentLog.note ? '- ' + currentLog.note : '' }}></span>
                <span
                  className='HarvesterStatusDetail MuiButtonLike'>
              {
                currentLog.html_detail ? (
                  <Fragment>
                    <ErrorIcon onClick={() => {
                      setOpen(true)
                    }}/>

                    <Modal
                      className='HarvesterStatusDetailModal'
                      open={open}
                      onClosed={() => {
                        setOpen(false)
                      }}
                    >
                      <ModalHeader onClosed={() => {
                        setOpen(false)
                      }}>
                        Harvester Status
                      </ModalHeader>
                      <div className='HarvesterStatusDetailTable'
                           dangerouslySetInnerHTML={{ __html: currentLog.html_detail }}>
                      </div>
                    </Modal>
                  </Fragment>
                ) : ''
              }
            </span>
              </div>
            </div>
          ) : ''
        }
        <div className='PageSection'>
          <div className='PageSectionTitle'>Attributes</div>
          <table className='PageSectionTable'>
            <tbody>
            {
              harvester.creator.full_name ?
                <tr>
                  <td>User who run</td>
                  <td>
                    {harvester.creator.full_name}
                  </td>
                </tr>
                : ""
            }
            {
              attributesData.map(attr => {
                if (attr.name === "API URL") {
                  return (
                    <tr key={attr.name}>
                      <td valign="top">{attr.name}</td>
                      <td>
                        <CopyToClipboard
                          text={window.location.protocol + '//' + window.location.host + attr.value}/>
                        <br/>
                        <br/>
                        <div className="helptext">
                          Example data:
                          <br/>
                          <pre>{
                            JSON.stringify({
                              "geometry_code": "SO",
                              "extra_data": {
                                "Data 1": "1",
                                "Data 2": "2",
                              },
                              "date": "2022-01-01",
                              "value": 1
                            }, undefined, 2)
                          }</pre>
                        </div>
                        <b className='light'> For batch </b><br/>
                        <div id="batch-url">
                          <CopyToClipboard
                            text={window.location.protocol + '//' + window.location.host + attr.value + '/batch'}/>
                        </div>
                        <br/>
                        <div className="helptext">
                          Example data:
                          <pre>{
                            JSON.stringify([
                              {
                                "geometry_code": "SO",
                                "extra_data": {
                                  "Data 1": "1",
                                  "Data 2": "2",
                                },
                                "date": "2022-01-01",
                                "value": 1
                              },
                              {
                                "geometry_code": "SO",
                                "extra_data": {
                                  "Data 1": "1",
                                  "Data 2": "2",
                                },
                                "date": "2022-02-01",
                                "value": 1
                              }
                            ], undefined, 2)
                          }</pre>
                        </div>
                      </td>
                    </tr>
                  )
                } else if (attr.name === "Token") {
                  return (
                    <tr key={attr.name}>
                      <td valign="top">{attr.name}</td>
                      <td>
                        <CopyToClipboard text={attr.value}/>
                      </td>
                    </tr>
                  )
                } else {
                  return (
                    <tr key={attr.name}>
                      <td valign="top">{attr.name}</td>
                      <td>{attr.value}</td>
                    </tr>
                  )
                }
              })
            }
            </tbody>
          </table>
        </div>
      </div>
    </Admin>
  );
}


render(Detail, store)