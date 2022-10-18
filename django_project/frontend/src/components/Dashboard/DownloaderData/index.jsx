/* ==========================================================================
   DownloaderData
   ========================================================================== */

import React, { Fragment, useState } from 'react';
import { useSelector } from "react-redux";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress'
import Checkbox from '@mui/material/Checkbox';

import { fetchGeojson } from "../../../utils/georepo";
import { PluginChild } from "../Map/Plugin";
import CustomPopover from "../../CustomPopover";
import { ThemeButton } from "../../Elements/Button";
import { dictDeepCopy, jsonToXlsx } from "../../../utils/main";

import './style.scss';

/**
 * DownloaderData component.
 */
export default function DownloaderData() {
  const filteredGeometries = useSelector(state => state.filteredGeometries)
  const selectedIndicatorLayer = useSelector(state => state.selectedIndicatorLayer)
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel)
  const indicatorsData = useSelector(state => state.indicatorsData)
  const [downloading, setDownloading] = useState(false)

  const [xls, setXls] = useState(true)
  const [geojson, setGeojson] = useState(false)

  const selectedLayerData = []
  selectedIndicatorLayer?.indicators?.map(indicator => {
    if (indicatorsData[indicator.id]?.fetched) {
      selectedLayerData.push(indicatorsData[indicator.id].data)
    }
  })
  const disabled = downloading || selectedLayerData.length !== selectedIndicatorLayer?.indicators?.length

  // Construct the data
  const download = () => {
    if (!disabled) {
      setDownloading(true);

      (
        async () => {
          const geometryData = await fetchGeojson(
            preferences.georepo_api.domain + selectedAdminLevel.url
          )
          const tableData = {}
          const geojsonData = {
            "type": "FeatureCollection",
            "features": []
          }
          filteredGeometries.map(code => {
            // Get data per geom
            const geom = geometryData.find(feature => {
              return feature.properties.identifier.admin === code
            })
            if (geom) {
              const row = {
                GeographyCode: geom.properties.identifier.admin,
                GeographyName: geom.properties.name,
                GeographyLevel: geom.properties.level_name
              }
              const indicatorsDataProperties = []
              selectedIndicatorLayer.indicators.map(indicator => {
                const name = indicator.name
                if (indicatorsData[indicator.id]?.fetched) {
                  const value = indicatorsData[indicator.id].data.find(row => {
                    return code === row.geometry_code
                  })
                  if (value) {
                    if (!tableData[name]) {
                      tableData[name] = []
                    }
                    const indicatorData = {
                      IndicatorCode: indicator.shortcode ? indicator.shortcode : '',
                      IndicatorName: indicator.name,
                      Value: '' + value.value,
                      Date: value.date
                    }
                    tableData[name].push(
                      Object.assign({}, row, indicatorData)
                    )
                    indicatorsDataProperties.push(indicatorData)
                  }
                }
              })
              const newGeom = dictDeepCopy(geom)
              newGeom.properties = row
              if (selectedIndicatorLayer.indicators.length === 1) {
                newGeom.properties = Object.assign({}, newGeom.properties, indicatorsDataProperties[0])
              } else {
                indicatorsDataProperties.map((indicator, idx) => {
                  newGeom.properties['IndicatorCode' + idx] = indicator.IndicatorCode
                  newGeom.properties['IndicatorName' + idx] = indicator.IndicatorName
                  newGeom.properties['Value' + idx] = indicator.Value
                  newGeom.properties['Date' + idx] = indicator.Date
                })
              }
              geojsonData.features.push(newGeom)
            }
          })
          if (xls) {
            let excelData = []
            for (const [key, value] of Object.entries(tableData)) {
              excelData = excelData.concat(value)
            }
            jsonToXlsx(excelData, 'data.xls')
          }
          if (geojson) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geojsonData)))
            element.setAttribute('download', 'data.geojson');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }
          setDownloading(false);
        }
      )()
    }
  }
  if (Object.keys(selectedIndicatorLayer).length === 0) {
    return ""
  }

  return (
    <Fragment>
      <div
        title={downloading ? "Preparing Data" : ""}
        className={(disabled ? "Disabled" : "")}
      >
        <CustomPopover
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          Button={
            <PluginChild title={'Download Data'}>
              <CloudDownloadIcon/>
            </PluginChild>
          }>
          <div
            className={"DownloaderDataComponent " + (disabled ? "Disabled" : "")}
          >
            <div className='DownloaderDataTitle'>
              <b className='light'>
                Download {selectedIndicatorLayer.name.toLowerCase()} data.
              </b>
            </div>
            <label><b className={'light'}>Format</b></label>
            <FormGroup className={'FormatSelection'}>
              <FormControlLabel
                disabled={disabled}
                control={
                  <Checkbox size="small" checked={xls} onChange={(evt) => {
                    setXls(evt.target.checked)
                  }}/>
                } label="XLS"/>
              <FormControlLabel
                disabled={disabled}
                control={
                  <Checkbox size="small" checked={geojson} onChange={(evt) => {
                    setGeojson(evt.target.checked)
                  }}/>
                } label="Geojson"/>
            </FormGroup>
            <div className='DownloadButton'>
              <ThemeButton
                disabled={disabled || (!xls && !geojson)}
                variant="secondary Reverse"
                onClick={download}
              >
                {
                  downloading ? <CircularProgress/> :
                    <CloudDownloadIcon/>
                }
                {
                  downloading ? "Downloading" : "Download"
                }
              </ThemeButton>
            </div>
          </div>
        </CustomPopover>

      </div>
    </Fragment>
  )
}