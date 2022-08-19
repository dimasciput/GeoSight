import React, { useEffect, useRef, useState } from 'react';
import Select from "react-select";
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
import { arrayMove } from "../../../../../utils/Array";
import SortableItem
  from '../../../../Admin/Dashboard/Form/ListForm/SortableItem'


/** Arcgis Config Fields */
export default function ArcgisConfigFields({ data_fields, update }) {

  const [fields, setFields] = useState([]);
  const [items, setItems] = useState([]);
  const prevState = useRef();

  /** Update data **/
  const updateData = (newFields) => {
    if (prevState.fields !== JSON.stringify(newFields)) {
      update(newFields)
      prevState.fields = JSON.stringify(newFields)
    }
  }

  const id = 'Fields'
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

  // Data Updated
  const initData = (fields) => {
    setFields(fields)
    setItems(fields.map((field, idx) => {
      return idx + 1
    }))
  }

  // When the data changed
  useEffect(() => {
    initData(data_fields)
  }, [data_fields])

  // When item changed
  useEffect(() => {
    if (items.length) {
      const newFields = []
      items.map(item => {
        newFields.push(fields[item - 1])
      })
      updateData(newFields)
    }
  }, [items])

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
    }
  };

  return <DndContext
    sensors={sensors}
    onDragEnd={handleDragEnd}
  >
    <div><b className='light'>Fields</b></div>
    <table>
      <thead>
      <tr>
        <td></td>
        <td valign="top">Field</td>
        <td valign="top">Alias</td>
        <td valign="top">Visible in Popup</td>
        <td valign="top">Type</td>
        <td valign="top" className='AsField'>
          As label
          <div className='form-helptext'>
            Turn field as label, the orders same with field orders.
          </div>
        </td>
      </tr>
      </thead>
      <tbody key={id} id={id} style={style} ref={setNodeRef}>
      <SortableContext
        id={id} items={items}
        strategy={rectSortingStrategy}>
        {
          items.map(item => {
            const idx = item - 1
            let field = fields[idx]
            const optionsTypes = [
              { value: 'string', label: 'String' },
              { value: 'number', label: 'Number' },
              { value: 'date', label: 'Date' },
            ]
            let type = optionsTypes.find(opt => opt.value === field.type)
            if (!type) {
              field.type = 'string'
            }
            type = optionsTypes.find(opt => opt.value === field.type)

            return (
              <SortableItem key={item} id={item}>
                <td>{field.name}</td>
                <td>
                  <input value={field.alias} onChange={(evt) => {
                    field.alias = evt.target.value;
                    updateData(fields)
                  }}/>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={
                      field.visible === undefined ? true : field.visible
                    }
                    onChange={(evt) => {
                      field.visible = evt.target.checked;
                      updateData(fields)
                    }}/>
                </td>
                <td>
                  <Select
                    options={optionsTypes} defaultValue={type}
                    onChange={(evt) => {
                      field.type = evt.value
                      updateData(fields)
                    }}/>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={
                      field.as_label ? field.as_label : false
                    }
                    onChange={(evt) => {
                      field.as_label = evt.target.checked;
                      updateData(fields)
                    }}/>
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