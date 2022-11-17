/* ==========================================================================
   Measurement
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import {
  area as turfArea,
  length as turfLength,
  lineString as turfLineString
} from '@turf/turf';

import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import { ThemeButton } from "../../../Elements/Button";
import { addPopup } from "../../MapLibre/utils";
import { numberWithCommas } from "../../../../utils/main";

import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import './style.scss';

/**
 * Measurement
 */
export default function Measurement({ map }) {
  const [draw, setDraw] = useState(null);
  const [start, setStart] = useState(false);
  const [startDraw, setStartDraw] = useState(false);
  const [selected, setSelected] = useState([]);

  /** Update Area **/
  const updateArea = () => {
    setStartDraw(false)
    setSelected(draw.getSelectedIds())
  }

  /**
   * Map created
   */
  useEffect(() => {
    if (map) {
      var draw = new MapboxDraw(
        {
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          }
        }
      )
      setDraw(draw)
    }
  }, [map]);

  /**
   * Start changed
   */
  useEffect(() => {
    if (map && draw) {
      if (start) {
        map.addControl(draw, 'top-left')
        onStart()
      } else {
        map.removeControl(draw)
        setSelected([])
        onStop(true)
        map.boxZoom.enable();
      }
    }
  }, [start]);

  /**
   * Draw Created
   */
  useEffect(() => {
    if (map && draw) {
      map.on('draw.create', (e) => {
        map.measurementMode = false
        updateArea(e)
      });
      map.on('draw.delete', updateArea);
      map.on('draw.update', updateArea);
      map.on('draw.selectionchange', (e) => {
        if (e.features.length) {
          setStart(true)
          map.measurementMode = true
          map.getCanvas().style.cursor = 'crosshair'
        } else {
          map.measurementMode = false
          map.getCanvas().style.cursor = '';
        }
        setSelected(draw.getSelectedIds())
      });
    }
  }, [draw]);

  /**
   * On Start Measurement
   */
  const onStart = () => {
    setStartDraw(true)
    draw.changeMode(draw.modes.DRAW_POLYGON)
    map.measurementMode = true
  }

  /**
   * On Stop Measurement
   */
  const onStop = (close) => {
    if (!close) {
      draw.changeMode(draw.modes.SIMPLE_SELECT)
    }
    map.measurementMode = false
  }

  const Information = () => {
    var data = draw.getAll();
    let area = 0
    let lengthMeters = 0
    let lengthMiles = 0
    data.features.filter(feature => selected.includes(feature.id)).map(feature => {
      area += turfArea(feature)
      lengthMeters += turfLength(
        turfLineString(feature.geometry.coordinates[0]),
        { units: "meters" }
      )
      lengthMiles += turfLength(
        turfLineString(feature.geometry.coordinates[0]),
        { units: "miles" }
      )
    })
    return (
      <div>
        <div>
          {numberWithCommas(area, 2)} Sq Meters
        </div>
        <div>
          {numberWithCommas(lengthMeters, 2)} Meters
          ({numberWithCommas(lengthMiles, 2)} Miles) Perimeter
        </div>
      </div>
    )
  }

  return <Plugin className={'MeasurementComponent'}>
    <PluginChild
      title={'Start Measurement'}
      disabled={!map || !draw}
      active={start}
      onClick={() => {
        if (map && draw) {
          setStart(!start)
        }
      }}>
      <SquareFootIcon/>
    </PluginChild>
    {
      start ?
        <div className={'MeasurementComponentPopup'}>
          <div className={'Title'}>Measure distances and areas</div>
          <div className='MeasurementComponentText'>
            {
              selected.length ? <Information/> :
                <i>Draw on map and finish by double click.</i>
            }
            <div style={{ textAlign: "right" }}>
              {
                selected.length ?
                  <ThemeButton onClick={() => {
                    draw.delete(selected)
                    draw.changeMode(draw.modes.SIMPLE_SELECT)
                    map.measurementMode = false
                    updateArea()
                    setStartDraw(false)
                  }} className={'MeasurementDeleteButton'}>
                    <DeleteIcon/> Delete selected
                  </ThemeButton> : ""
              }
            </div>
          </div>
          <div className='MeasurementComponentFooter'>
            <ThemeButton onClick={() => {
              onStop()
            }}>
              <CancelIcon/> Cancel
            </ThemeButton>
            <ThemeButton onClick={() => {
              onStart()
            }} style={{ width: '300px' }} disabled={startDraw}>
              <AddLocationIcon/> Add new measurement
            </ThemeButton>
          </div>
        </div>
        : ""
    }
  </Plugin>
}