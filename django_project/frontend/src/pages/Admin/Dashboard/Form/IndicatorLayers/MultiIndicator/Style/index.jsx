import React, { useEffect, useState } from 'react';
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { arrayMove } from "../../../../../../../utils/Array";
import SortableItem
  from '../../../../../../Admin/Dashboard/Form/ListForm/SortableItem'


export default function MultiIndicatorStyle({ data, indicators, updateData }) {
  const [items, setItems] = useState([]);

  // When item changed
  useEffect(() => {
    if (data.indicators.length) {
      setItems(data.indicators.map(indicator => {
        return indicator.id
      }))
    }
  }, [data])

  const id = 'Styles'
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  /** When drag event ended **/
  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over.id) {
      const activeIndex = active.data.current.sortable.index;
      const overIndex = over.data.current?.sortable.index || 0;
      let newList = arrayMove(
        items,
        activeIndex,
        overIndex
      )
      setItems(newList)

      // Order changed
      const indicators = []
      newList.map(item => {
        indicators.push(data.indicators.find(
          indicator => indicator.id === item
        ))
      })
      data.indicators = indicators
      updateData()
    }
  };

  /** Delete Style Row **/
  const deleteStyleRow = (row) => {
    data.indicators = data.indicators.filter(indicator => indicator.id !== row.id)
    updateData()
  }
  return <DndContext
    sensors={sensors}
    onDragEnd={handleDragEnd}
  >
    <table id='RuleTable'>
      <thead>
      <tr>
        <th></th>
        <th></th>
        <th>Indicator</th>
        <th>Label</th>
        <th>Color</th>
      </tr>
      </thead>
      <tbody key={id} id={id} style={style} ref={setNodeRef}>
      <SortableContext
        id={id} items={items}
        strategy={rectSortingStrategy}>
        {
          items.map(item => {
            let indicator = data.indicators.find(
              indicator => indicator.id === item
            )
            if (!indicator) {
              return ""
            }
            const indicatorData = indicators.find(
              indicatorData => indicator.id === indicatorData.id
            )
            if (!indicatorData) {
              return ""
            }
            return (
              <SortableItem key={indicator.id} id={item}>
                <td>
                  <RemoveCircleIcon
                    className='MuiButtonLike RemoveButton'
                    onClick={(evt) => {
                      deleteStyleRow(indicator)
                    }}
                  />
                </td>
                <td>{indicatorData.name}</td>
                <td>
                  <input
                    type="text" spellCheck="false"
                    value={indicator.name}
                    onChange={evt => {
                      indicator.name = evt.target.value
                      updateData()
                    }}/>
                </td>
                <td>
                  <div className='RuleSectionColor'>
                    <input type="text" value={indicator.color}
                           onChange={evt => {
                             indicator.color = evt.target.value
                             updateData()
                           }}
                           spellCheck="false"/>
                    <div className='RuleSectionColor-Preview'>
                      <input type="color" spellCheck="false"
                             value={indicator.color}
                             onChange={evt => {
                               indicator.color = evt.target.value
                               updateData()
                             }}/>
                    </div>
                  </div>
                </td>
              </SortableItem>
            )
          })
        }
      </SortableContext>
      </tbody>
    </table>
  </DndContext>
}