import React, { useState } from 'react';
import CreatableSelect from "react-select/creatable";
import FormControl from "@mui/material/FormControl";
import CustomPopover from "../../../../components/CustomPopover";
import { IconTextField } from "../../../../components/Elements/Input";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

/**
 * Filter group
 * @param {str} title Place holder.
 * @param {array} data Selected data.
 * @param {function} setData When the value changed.
 * @param {Boolean} returnObject Is data returned whole object.
 */
export function MultipleCreatableFilter(
  { title, data, setData, returnObject }
) {
  return <CustomPopover
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    Button={
      <FormControl className='FilterControl'>
        {
          data.length ?
            <label
              className="MuiFormLabel-root"
              data-shrink="true">{title}</label>
            : ""
        }
        <IconTextField
          iconEnd={<FilterAltIcon/>}
          value={data.length ? data.length + ' selected' : title}
          inputProps={
            { readOnly: true, }
          }
        />
      </FormControl>
    }>
    <MultipleCreatable
      data={
        data.map(label => {
          return {
            label,
            value: label
          }
        })
      }
      setData={(data) => {
        setData(data.map(row => row.value))
      }}/>
  </CustomPopover>
}

/**
 * Multiple Creatable component
 */
export function MultipleCreatable({ data, setData }) {
  const [inputValue, setInputValue] = useState('');
  const components = {
    DropdownIndicator: null,
  };

  const createOption = (label) => ({
    label,
    value: label,
  });

  const handleKeyDown = (event) => {
    if (!inputValue) return;
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        setData([...data, createOption(inputValue)]);
        setInputValue('');
        event.preventDefault();
    }
  };


  return <CreatableSelect
    components={components}
    inputValue={inputValue}
    isClearable
    isMulti
    menuIsOpen={false}
    onChange={(newValue) => {
      console.log(newValue)
      setData(newValue)
    }}
    onInputChange={(newValue) => setInputValue(newValue)}
    onKeyDown={handleKeyDown}
    placeholder="Type something and press enter..."
    value={data}
  />
}