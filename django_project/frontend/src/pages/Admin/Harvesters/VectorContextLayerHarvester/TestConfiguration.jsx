import React, { Fragment, useEffect, useState } from 'react';

import BugReportIcon from '@mui/icons-material/BugReport';
import { ThemeButton } from "../../../../components/Elements/Button";

import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../components/Modal";
import List from "../../Components/List";
import { fetchFeatureList } from "../../../../utils/georepo";
import { fetchJSON } from "../../../../Requests";
import DataSelectionModal
  from "../../Dashboard/Form/ListForm/DataSelectionModal";


import './style.scss';

/** COLUMNS FOR TEST DATA
 */
export function REFERENCE_LAYER_COLUMNS() {
  return [
    { field: 'id', headerName: 'id', hide: true, width: 30, },
    { field: 'code', headerName: 'Code', flex: 1 },
    { field: 'label', headerName: 'Label', flex: 1 },
    { field: 'temp', headerName: 'Temp', flex: 1, hide: true }
  ]
}

/** COLUMNS FOR TEST DATA
 */
export function DATA_COLUMNS() {
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
  const [fetchingData, setFetchingData] = useState(null);
  const [error, setError] = useState(null);
  const [codes, setCodes] = useState(null);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const onClosed = () => {
    setOpen(false);
  };

  const [openSelection, setOpenSelection] = useState(false);
  const refLayer = attributes.find(attr => attr.name === "reference_layer")

  useEffect(() => {
    setData(null)
    setError(null)
    setCodes(null)
    const adminLevel = attributes.find(attr => attr.name === "admin_level")
    let level = null
    if (refLayer?.levels) {
      level = refLayer.levels.find(level => level.level === adminLevel?.value);
      (
        async () => {
          const geometryData = await fetchFeatureList(
            preferences.georepo_api.domain + level.url + '/list'
          )
          const codesFound = []
          geometryData.map(geom => {
            const code = geom?.identifier?.admin
            codesFound.push({
              id: geom.id,
              label: geom.name,
              name: geom.name,
              code: code
            })
          })
          setCodes(codesFound)
        }
      )()
    }
  }, [open]);

  const fetchData = () => {
    if (!fetchingData) {
      setData(null)
      setError(null)
      setFetchingData(true)
      const data = {}
      attributes.map(attr => {
        data[attr['name']] = attr.value
      });
      data['codes'] = selectedCodes.map(code => code.code).join(',');
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
            setFetchingData(false)
          } catch (err) {
            try {
              setError(err.data.detail)
            } catch (e) {
              setError(err.toString())
            }
            setFetchingData(false)
          }
        }
      )()
    }
  }

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
        <div className='helptext'>
          Selecting geometries will decrease testing time.
          The less geometries you chose, the faster the test process.
        </div>
      </ModalHeader>
      <ModalContent>
        <div className="BasicForm TestConfigurationForm AdminContent">
          <div className="BasicFormSection CodeSelection">
            <input
              disabled={!codes || fetchingData}
              type="text"
              placeholder={
                !codes ? "Loading" : "Please select 1 or more geometries"
              }
              readOnly={true}
              value={selectedCodes ? selectedCodes.map(code => code.code).join(',') : ""}
              onClick={evt => setOpenSelection(true)}
              onChange={(evt) => {

              }}
            />
            {
              codes?.length > 0 ?
                <DataSelectionModal
                  listData={codes}
                  selectedData={selectedCodes}
                  open={openSelection}
                  setOpen={setOpenSelection}
                  pageName={'geometries'}
                  groupName={''}
                  applyData={(addedData, removeData) => {
                    addedData.map(data => {
                      selectedCodes.push(data)
                    })
                    removeData.map(data => {
                      const index = selectedCodes.indexOf(data);
                      if (index > -1) {
                        selectedCodes.splice(index, 1);
                      }
                    })
                    setSelectedCodes([...selectedCodes])
                    setOpenSelection(false)
                  }}
                  groupLabel={'groupLabel'}
                  initColumns={REFERENCE_LAYER_COLUMNS()}
                /> : ""
            }

          </div>
          <ThemeButton
            disabled={selectedCodes.length === 0 || fetchingData}
            className={'TestConfiguration'}
            onClick={fetchData}>
            <BugReportIcon/> Run test configuration
          </ThemeButton>
          {
            error ? <div className='error'>{error}</div> : fetchingData ?
              <div className='loading'>Loading</div> :
              <List
                columns={DATA_COLUMNS()} pageName={"Temporary Data Fetched"}
                initData={data} listUrl={""}/>
          }
        </div>
      </ModalContent>
    </Modal>
  </Fragment>
}