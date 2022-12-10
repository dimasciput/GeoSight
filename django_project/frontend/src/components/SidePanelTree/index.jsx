import React, {useEffect, useState, useLayoutEffect, useRef} from 'react';
import TreeItem from "@mui/lab/TreeItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import {Checkbox} from "@mui/material";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Radio from "@mui/material/Radio";
import './style.scss';
import CustomPopover from "../CustomPopover";
import InfoIcon from "@mui/icons-material/Info";

/**
 * SidePanelTreeView component
 * @param {dict} data tree data, format = {
 *   'id': 'group_id',
 *   'children': [{
 *     'id': 'data_id',
 *     'children': []
 *   }]
 * }
 * @param {boolean} selectable whether this sidepanel is selectable or not
 * @param {number} maxSelect max selected item
 * @param {boolean} groupSelectable is group also selectable
 * @param {function} onChange callback function to call when selected data changed
 */
export default function SidePanelTreeView(
  {
    data,
    selectable= false,
    maxSelect = 0,
    groupSelectable= false,
    onChange = null
  }) {

  const [selected, setSelected] = useState([])
  const [groups, setGroups] = useState([])

  const getGroups = (groupData) => {
    const _groups = [];
    for (const _data of groupData) {
      if (_data.children.length > 0) {
        _groups.push(...getGroups(_data.children))
      }
      if (_data.isGroup) {
        if (_groups.indexOf(_data.id) === -1) {
          _groups.push(_data.id)
        }
      }
    }
    return _groups;
  }

  useEffect(() => {
    setGroups(getGroups([data]));
    if (selected.length > maxSelect) {
      if (maxSelect === 1) {
        setSelected([selected.at(-1)])
      } else {
        setSelected([...selected.slice(-(maxSelect-1))])
      }
    }
  }, [maxSelect])

  const selectItem = (e) => {
    e.stopPropagation();
    let _selectedIds = []
    if (selected.indexOf(e.target.value) >= 0) {
      _selectedIds = [...selected.filter(s => s !== e.target.value)]
    } else {
      if (maxSelect === 1) {
        _selectedIds = [e.target.value]
      } else if (maxSelect === 0) {
        _selectedIds = [...selected, e.target.value]
      } else {
        _selectedIds = [...selected.slice(-(maxSelect-1)), e.target.value]
      }
    }
    onChange(_selectedIds)
    setSelected(_selectedIds)
  }

  const handleToggle = (event, nodeIds) => {
    setGroups(nodeIds);
  };

  const handleSelect = (event, nodeIds) => {
    event.stopPropagation();
  };

  const rightIcon = (layer = null) => {
    return (
      <span className='InfoIcon'>
        <CustomPopover
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}
          Button={
            <InfoIcon fontSize={"small"}/>
          }
          showOnHover={true}
        >
          <div className='LayerInfoPopover'>
            <div className='LayerInfoPopover'>
              <div className='title'>
                <b className='light'>{layer.data.name.replace(/(\w{17})(?=\w)/g, '$1 ')}
                </b>
              </div>
              <div>
                <b className='light'>Last Update: </b>{layer.data.last_update}
              </div>
              <div>
                <b className='light'>Description: </b>
                {
                  layer.data.description ? layer.data.description : '-'
                }
              </div>
            </div>
          </div>
        </CustomPopover>
      </span>
    )
  }

  const renderTree = (nodes) => {
    const nodesDataId = nodes.data ? '' + nodes.data.id : nodes.id;
    const [width, setWidth] = useState(20)
    const layerGroupListRef = useRef(null);

    useLayoutEffect(() => {
        if (layerGroupListRef?.current) {
          setWidth(parseInt((layerGroupListRef.current.offsetWidth - 40) / 9));
        }
      }, [groups]);

    const maxWordRegex = new RegExp(`(\\w{${width}})(?=\\w)`)
    return <TreeItem
              className='TreeItem'
              key={nodesDataId}
              nodeId={nodesDataId}
              ref={layerGroupListRef}
              label={
                !nodes.isGroup && selectable ?
                  <FormControlLabel
                    control={maxSelect > 1 ?
                      <Checkbox
                        className='PanelCheckbox'
                        size={'small'}
                        value={nodesDataId}
                        checked={selected.indexOf(nodesDataId) >= 0}
                        onChange={selectItem}/> :
                      <Radio
                        className='PanelRadio'
                        size={'small'}
                        value={nodesDataId}
                        checked={selected.indexOf(nodesDataId) >= 0}
                        onChange={selectItem}/>}
                    label={<span>
                      {nodes.id.replace(maxWordRegex, '$1 ')}
                      {rightIcon ? rightIcon(nodes) : null}
                  </span>}
                  /> : nodes.id
              }>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  };
  return (
    <TreeView
      aria-label="rich object"
      defaultCollapseIcon={<ExpandMoreIcon />}
      expanded={groups}
      onNodeToggle={handleToggle}
      onNodeSelect={handleSelect}
      defaultExpandIcon={<ChevronRightIcon />}
      sx={{ flexGrow: 1, maxWidth: '100%', paddingRight: '1em' }}
    >
      {renderTree(data)}
    </TreeView>
  );
}
