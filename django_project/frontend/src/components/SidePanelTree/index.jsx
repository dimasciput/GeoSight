import React, {Fragment, useEffect, useState} from 'react';
import TreeItem from "@mui/lab/TreeItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import {Checkbox} from "@mui/material";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Radio from "@mui/material/Radio";

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
    onChange
  }) {

  const [selected, setSelected] = useState([])

  useEffect(() => {
    if (selected.length > maxSelect) {
      if (maxSelect === 1) {
        setSelected([selected.at(-1)])
      } else {
        setSelected([...selected.slice(-(maxSelect-1))])
      }
    }
  }, [maxSelect])

  useEffect(() => {
    if (onChange) {
      onChange(selected)
    }
  }, [selected])

  const selectItem = (e) => {
    if (selected.indexOf(e.target.value) >= 0) {
      setSelected([...selected.filter(s => s !== e.target.value)])
      return
    }
    if (maxSelect === 1) {
      setSelected([e.target.value])
    } else if (maxSelect === 0) {
      setSelected([...selected, e.target.value])
    } else {
      setSelected([...selected.slice(-(maxSelect-1)), e.target.value])
    }
  }

  const renderTree = (nodes) => {
    const nodesDataId = nodes.data ? '' + nodes.data.id : nodes.id;
    return <TreeItem key={nodesDataId} nodeId={nodesDataId}
              label={
                !nodes.isGroup && selectable ?
                  <FormControlLabel
                    control={maxSelect > 1 ?
                      <Checkbox value={nodesDataId}
                                checked={selected.indexOf(nodesDataId) >= 0}
                                onChange={selectItem}/> :
                      <Radio value={nodesDataId}
                             checked={selected.indexOf(nodesDataId) >= 0}
                             onChange={selectItem}/>}
                    label={nodes.id}
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
      defaultExpanded={[data[0]]}
      defaultExpandIcon={<ChevronRightIcon />}
      sx={{ flexGrow: 1, maxWidth: '100%', paddingRight: '1em' }}
    >
      {renderTree(data)}
    </TreeView>
  );
}
