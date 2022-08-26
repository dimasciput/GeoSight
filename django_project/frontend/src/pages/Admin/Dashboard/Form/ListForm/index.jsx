import React, { Fragment, useEffect, useState } from 'react';

import { AddButton } from "../../../../../components/Elements/Button";
import { layerInGroup } from '../../../../../utils/layers'
import { fetchingData } from "../../../../../Requests";

import DataSelectionModal from './DataSelectionModal'
import SortableList from './SortableList'

import './style.scss';

/**
 * Basemaps dashboard
 * @param {string} pageName Page Name.
 * @param {Array} data Current data.
 * @param {string} listUrl API for list data.
 * @param {Array} defaultListData Default list data.
 * @param {Function} addLayerAction Action of Layer Added.
 * @param {Function} removeLayerAction Action of Layer Removed.
 * @param {Function} changeLayerAction Action of Layer Changed.
 * @param {Function} addLayerInGroupAction When Add Layer In Group.
 * @param {Function} editLayerInGroupAction When edit layer in group
 * @param {Function} rearrangeLayersAction When rearrange layers
 * @param {Function} otherActionsFunction Other actions
 * @param {string} groupLabel Group label
 *
 * @param {boolean} openDataSelection Open data selection
 * @param {Function} setOpenDataSelection Set open data selection
 */
export default function ListForm(
  {
    pageName,
    data,
    listUrl,
    defaultListData,
    addLayerAction,
    removeLayerAction,
    changeLayerAction,
    addLayerInGroupAction,
    editLayerInGroupAction,
    rearrangeLayersAction,
    otherActionsFunction,
    groupLabel,

    openDataSelection,
    setOpenDataSelection
  }
) {
  // GLOBAL DATA
  const className = pageName.replaceAll(' ', '')
  const singularPageName = pageName.substring(0, pageName.length - 1);

  // Generate group of layers
  const [groups, setGroups] = useState(null);
  const [listData, setListData] = useState(null);
  const [currentGroupName, setCurrentGroupName] = useState(null);
  const [open, setOpen] = useState(false);

  // Fetch data
  useEffect(() => {
    if (listUrl) {
      fetchingData(listUrl, {}, {}, (data) => {
        setListData(data)
      })
    } else if (defaultListData) {
      setListData(defaultListData)
    }
  }, [defaultListData])

  // Onload, check the default one
  useEffect(() => {
    setGroups(layerInGroup(data))
  }, [data])

  // Open data selection when the props true
  useEffect(() => {
    if (openDataSelection) {
      setOpen(true)
    }
  }, [openDataSelection])

  // Open data selection when the props true
  useEffect(() => {
    if (setOpenDataSelection) {
      setOpenDataSelection(open)
    }
  }, [open])

  /** Add group */
  const addGroup = () => {
    let created = false;
    let idx = Object.keys(groups).length + 1;
    while (!created) {
      const name = 'Group ' + idx;
      if (!groups[name]) {
        groups[name] = []
        created = true;
      }
      idx += 1;
    }
    setGroups({ ...groups })
  }

  /** Remove group */
  const removeGroup = (groupName) => {
    const layers = [...(groups[groupName] ? groups[groupName] : groups[''])]
    delete groups[groupName]
    setGroups({ ...groups })
    layers.map(layer => {
      removeLayer(layer)
    })
  }

  /** Remove Layer */
  const removeLayer = (layer) => {
    removeLayerAction(layer)
  }
  /** Change Layer */
  const changeLayer = (layer) => {
    changeLayerAction(layer)
  }
  /** Change group name */
  const changeGroupName = (groupName, newName) => {
    const names = Object.keys(groups).filter(name => {
      return name !== groupName;
    });
    if (
      !newName || names.includes(newName) || ['_Table', ''].includes(newName)
    ) {
      return false;
    } else {
      groups[groupName].map(layer => {
        layer.group = newName;
        changeLayer(layer);
      })
      return true;
    }
  }

  const addLayerInGroup = (groupName) => {
    setCurrentGroupName(groupName)
    if (addLayerInGroupAction) {
      addLayerInGroupAction(groupName)
    } else {
      setOpen(true)
    }
  }
  const applyData = (addedData, removeData) => {
    addedData.map(data => {
      addLayerAction(data)
    })
    removeData.map(data => {
      removeLayerAction(data)
    })
    setOpen(false)
  }

  return <Fragment>
    {
      !groups ? <div>Loading</div> :
        <div className={'TableForm ' + className}>
          <div className='TableForm-Header'>
            <div className='TableForm-Header-Left'></div>
            <div className='TableForm-Header-Right'>
              <AddButton
                variant="secondary" text={"Add " + singularPageName}
                onClick={() => addLayerInGroup("")}/>
              <AddButton
                className='AddGroupButton'
                variant="secondary" text={"Add Group"} onClick={addGroup}/>
            </div>
          </div>

          {/* for the table */}
          <SortableList
            groups={groups}
            groupLabel={groupLabel}
            removeGroup={removeGroup}
            changeGroupName={changeGroupName}
            removeLayer={removeLayer}
            changeLayer={changeLayer}
            addLayerInGroup={addLayerInGroup}
            editLayerInGroup={editLayerInGroupAction}
            rearrangeLayers={rearrangeLayersAction}
            otherActionsFunction={otherActionsFunction}
          />

          {
            open ?
              <DataSelectionModal
                listData={listData}
                selectedData={data}
                open={open} setOpen={setOpen}
                pageName={pageName}
                groupName={currentGroupName}
                applyData={applyData}
                groupLabel={groupLabel}/>
              : ""
          }
        </div>
    }
  </Fragment>
}