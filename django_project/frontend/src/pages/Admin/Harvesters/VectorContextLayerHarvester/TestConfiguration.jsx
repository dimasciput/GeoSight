import React, { Fragment, useEffect, useState } from 'react';

import BugReportIcon from '@mui/icons-material/BugReport';
import { ThemeButton } from "../../../../components/Elements/Button";

import './style.scss';
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../components/Modal";
import List from "../../Components/List";
import { fetchJSON } from "../../../../Requests";


/** COLUMNS FOR TEST DATA
 */
export function COLUMNS() {
  return [
    { field: 'id', headerName: 'id', hide: true, width: 30, },
    { field: 'reference_layer', headerName: 'Reference Layer', flex: 1 },
    { field: 'name', headerName: 'Reference Layer name', flex: 1 },
    { field: 'geom_identifier', headerName: 'Geometry Code', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'value', headerName: 'Value', flex: 1 },
  ]
}

/**
 * Test Current Configuration
 */
export default function TestConfiguration({ attributes }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const onClosed = () => {
    setOpen(false);
  };

  useEffect(() => {
    setData(null)
    setError(null)
    if (open) {
      const data = {}
      attributes.map(attr => {
        data[attr['name']] = attr.value
      });
      (
        async () => {
          try {
            const response = await fetchJSON(
              testConfigurationAPI, {
                method: 'POST',
                headers: {
                  'X-CSRFToken': csrfmiddlewaretoken,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
              }, false
            )
            setData(response)
          } catch (err) {
            try {
              setError(err.data.detail)
            } catch (e) {
              setError(err.toString())
            }
          }
        }
      )()
    }
  }, [open]);

  let enabled = true;
  attributes.map(attr => {
    if (attr.required && !attr.value) {
      enabled = false;
    }
  })
  // On Click
  const onClick = () => {
    setOpen(true)
  }

  return <Fragment>
    <ThemeButton
      disabled={!enabled} className={'TestConfiguration'} onClick={onClick}>
      <BugReportIcon/> Test current configuration
    </ThemeButton>
    <Modal
      className={'TestConfigurationModal'}
      open={open}
      onClosed={onClosed}
    >
      <ModalHeader onClosed={onClosed}>
        Test data for this configuration.
        The data is not saved to database.
      </ModalHeader>
      <ModalContent>
        {
          error ? <div className='error'>{error}</div> : !data ?
            <div className='loading'>Loading</div> :
            <div className='AdminContent'>
              <List
                columns={COLUMNS()} pageName={"Temporary Data Fetched"}
                initData={data} listUrl={""}/>
            </div>
        }
      </ModalContent>
    </Modal>
  </Fragment>
}