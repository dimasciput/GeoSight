import React, { Fragment, useEffect, useState } from 'react';

import { AddButton } from "../../../../../components/Elements/Button";
import { layerInGroup } from '../../../../../utils/layers'
import { fetchingData } from "../../../../../Requests";

import DataSelectionModal from './DataSelectionModal'
import SortableList from './SortableList'

import './style.scss';
import {SortableTree} from "./SortableTree";
import {
  allGroups,
  createTreeData,
  findAllGroups,
  findItem,
  flattenTree
} from "./utilities";

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
 * @param {boolean} selectable Indicates whether the list is selectable or not, default is false
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
    setOpenDataSelection,
    selectable = false,
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

  const [treeData, setTreeData] = useState(null)

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
    setTreeData(createTreeData(data))
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
    let allGroups = findAllGroups(treeData);
    let idx = allGroups.length + 1;
    let groupName = '';
    let maxTry = 10 + idx;
    while (!created && idx < maxTry) {
      groupName = 'Group ' + idx;
      if (!findItem(treeData, groupName)) {
        treeData.push({
          id: groupName,
          isGroup: true,
          children: [],
          data: null
        })
        created = true
      }
      idx += 1;
    }
    setTreeData([...treeData])
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
    const allGroups = findAllGroups(treeData)
    const names = allGroups.map(({id}) => {
      return id
    }).filter(name => name !== groupName);
    const flattenData = flattenTree(treeData)
    console.log('flattendData', flattenData)
    if (
      !newName || names.includes(newName) || ['_Table', ''].includes(newName)
    ) {
      return false;
    } else {
      for (const _data of flattenData) {
        if (_data.id === groupName && _data.isGroup) {
          for (const layer of _data.children) {
            if (!layer.isGroup) {
              layer.data.group = newName;
              layer.parentId = newName;
              layer.data.parentId = newName;
              changeLayer(layer)
            }
          }
        }
        if (_data.parentId === groupName && _data.isGroup) {
          for (const layer of _data.children) {
            if (!layer.isGroup) {
              layer.data.group_parent = newName;
              changeLayer(layer)
            }
          }
        }
      }
      console.log('newData', flattenData)
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

  const handleRemoveItems = (selectedItems) => {
    selectedItems.map(selectedItem => removeLayerAction(selectedItem))
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

          <SortableTree
            data={treeData}
            changeGroupName={changeGroupName}
            changeLayer={changeLayer}
            otherActionsFunction={otherActionsFunction}
            rearrangeLayers={rearrangeLayersAction}
            groupLabel={groupLabel}
            addLayerInGroup={addLayerInGroup}
            collapsible indicator/>
          {/* for the table */}
          {/*<SortableList*/}
          {/*  groups={groups}*/}
          {/*  groupLabel={groupLabel}*/}
          {/*  removeGroup={removeGroup}*/}
          {/*  changeGroupName={changeGroupName}*/}
          {/*  removeLayer={removeLayer}*/}
          {/*  changeLayer={changeLayer}*/}
          {/*  addLayerInGroup={addLayerInGroup}*/}
          {/*  editLayerInGroup={editLayerInGroupAction}*/}
          {/*  rearrangeLayers={rearrangeLayersAction}*/}
          {/*  otherActionsFunction={otherActionsFunction}*/}
          {/*  selectable={selectable}*/}
          {/*  removeItems={handleRemoveItems}*/}
          {/*/>*/}

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