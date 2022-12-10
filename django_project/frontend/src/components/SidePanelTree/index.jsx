import React, {useEffect, useState, useLayoutEffect, useRef} from 'react';
import TreeItem from "@mui/lab/TreeItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import {Checkbox, IconButton, InputBase, Paper} from "@mui/material";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Radio from "@mui/material/Radio";
import './style.scss';
import CustomPopover from "../CustomPopover";
import InfoIcon from "@mui/icons-material/Info";
import TextField from "@mui/material/TextField";
import _ from 'lodash';
import {
  findItemDeep, getDepth
} from "../../pages/Admin/Dashboard/Form/ListForm/utilities";

const Highlighted = ({text = '', highlight = ''}) => {
   if (!highlight.trim()) {
     return <span>{text}</span>
   }
   const regex = new RegExp(`(${_.escapeRegExp(highlight)})`, 'gi')
   const parts = text.split(regex)
   return (
     <span>
        {parts.filter(part => part).map((part, i) => (
            regex.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
        ))}
    </span>
   )
}

const TREE_INDENT_SPACE = 40

/**
 * SidePanelTreeView component
 * @param {array} data tree data, format = [{
 *   'id': 'group_id',
 *   'children': [{
 *     'id': 'data_id',
 *     'children': []
 *   }]
 * }]
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
  const [nodes, setNodes] = useState(data || [])
  const [selected, setSelected] = useState([])
  const [groups, setGroups] = useState([])
  const [filterText, setFilterText] = useState('')
  const layerGroupListRef = useRef(null);
  const [width, setWidth] = useState(25)

  useLayoutEffect(() => {
    if (layerGroupListRef?.current) {
      setWidth(layerGroupListRef.current.offsetWidth - 20);
    }
  }, []);

  useEffect(() => {
    const filterResults = filterData(JSON.parse(JSON.stringify(data)), filterText)
    setNodes(filterResults)
  }, [filterText])

  useEffect(() => {
    setGroups(getGroups(nodes));
    if (selected.length > maxSelect) {
      if (maxSelect === 1) {
        setSelected([selected.at(-1)])
      } else {
        setSelected([...selected.slice(-(maxSelect-1))])
      }
    }
  }, [maxSelect])

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

  function filterData(data, query) {
    try {
      return data.filter(node => {
        if (node.id.toLowerCase().includes(query.toLowerCase())) {
          return true;
        }
        if (node.children.length > 0) {
          node.children = filterData(node.children, query)
          return node.children.length > 0;
        }
      });
    } catch (e) {
      return false
    }
  }

  const onFilterChange = (e) => {
    setFilterText(e.target.value)
  }

  const renderTree = (treeData) => {
    const nodesDataId = treeData.data ? '' + treeData.data.id : treeData.id;
    const itemDeep = getDepth(data, treeData.id)
    const maxWord = parseInt(
      '' + ((width - (TREE_INDENT_SPACE * itemDeep)) / 9)
    )

    return <TreeItem
              className='TreeItem'
              key={nodesDataId}
              nodeId={nodesDataId}
              label={
                !treeData.isGroup && selectable ?
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
                      <Highlighted text={treeData.id.replace(new RegExp(`(\\w{${maxWord}})(?=\\w)`), '$1 ')} highlight={filterText} />
                      {rightIcon ? rightIcon(treeData) : null}
                  </span>}
                  /> : <Highlighted text={treeData.id} highlight={filterText}/>
              }>
      {Array.isArray(treeData.children)
        ? treeData.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  };

  return (
    <div>
      <Paper component="form"
        sx={{ p: '2px 4px',
          display: 'flex',
          alignItems: 'center', width: '100%' }}
      >
        <TextField className='PanelSearchBox'
                   variant={'outlined'}
                   value={filterText}
                   placeholder={'Filter indicators'}
                   onChange={onFilterChange}
                   InputProps={{
          endAdornment: (
            <IconButton type="button" sx={{ p: '10px'}} aria-label="search" disabled={filterText.length === 0}
                        onClick={() => setFilterText('')}>
              { filterText ? <ClearIcon/> : <SearchIcon /> }
            </IconButton>
          )
        }}/>
      </Paper>
      <TreeView
        aria-label="rich object"
        ref={layerGroupListRef}
        defaultCollapseIcon={<ExpandMoreIcon />}
        expanded={groups}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ flexGrow: 1, maxWidth: '100%', paddingRight: '1em' }}
      >
        { nodes.length > 0 ? nodes.map(treeData => renderTree(treeData)) : 'No data' }
      </TreeView>
    </div>
  );
}
