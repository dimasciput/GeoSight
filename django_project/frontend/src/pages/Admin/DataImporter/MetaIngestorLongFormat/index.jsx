import React, { useEffect, useState } from 'react';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import Harvesters from '../../Harvesters'
import { pageNames } from "../../index";

import './style.scss';


/**
 * MetaIngestorWideFormat App
 */
export default function MetaIngestorLongFormat() {
  const sheetName = "sheet_name";
  const rowNumberHeader = "row_number_for_header";
  const admCodeName = "column_name_administration_code";
  const indicatorShortcodeName = "column_name_indicator_shortcode";
  const valueName = "column_name_value";
  const dateName = "column_name_date";

  const attributesInputs = []
  const [workbook, setWorkbook] = useState(null);

  // When file changed
  const fileChanged = (attribute, evt) => {
    let workbook = null;
    const file = evt.target.files[0];
    const fr = new FileReader();
    fr.onload = function () {
      workbook = XLSX.read(fr.result, {
        type: 'binary'
      });

      const sheetsOptions = []
      workbook.Workbook.Sheets.map(sheet => {
        if (sheet.Hidden === 0) {
          sheetsOptions.push(sheet.name)
        }
      })
      const sheetAttribute = attributes.filter(attr => {
        return attr.name === sheetName
      })[0]
      sheetAttribute.options = sheetsOptions
      sheetAttribute.value = sheetsOptions[0]

      const rowNumber = attributes.filter(attr => {
        return attr.name === rowNumberHeader
      })[0]
      if (!rowNumber.value) {
        rowNumber.value = 1
      }
      // Set all states
      setAttributes([...attributes])
      setWorkbook(workbook)
    }
    fr.readAsBinaryString(file)
  }

  // Default Format all data
  attributesData.map(attribute => {
    if (isNaN(attribute.name)) {
      switch (attribute.name) {
        case "file":
          attribute.onChange = fileChanged
          break
      }
      attributesInputs.push(attribute)
    }
  })

  const [attributes, setAttributes] = useState(attributesInputs);

  // When Sheet changed
  const SheetChanged = (attribute, evt) => {
    attribute.value = evt.target.value
    if (workbook) {
      const rowNumber = attributes.filter(attr => {
        return attr.name === rowNumberHeader
      })[0]
      const array = XLSX.utils.sheet_to_json(workbook.Sheets[evt.target.value], {
        header: 1,
        defval: '',
        blankrows: true
      });

      // Change the options
      const headers = array[rowNumber.value - 1] ? array[rowNumber.value - 1] : []
      const admCode = attributes.find(attr => attr.name === admCodeName)
      admCode.options = headers
      admCode.value = findMostMatched(admCode.options, 'pcode').value

      const indicatorShortcode = attributes.find(attr => attr.name === indicatorShortcodeName)
      indicatorShortcode.options = headers
      indicatorShortcode.value = findMostMatched(admCode.options, 'indicatorcode').value
      if (!indicatorShortcode.value) {
        indicatorShortcode.value = findMostMatched(admCode.options, 'indicator').value
      }
      if (!indicatorShortcode.value) {
        indicatorShortcode.value = findMostMatched(admCode.options, 'shortcode').value
      }

      const valueAttr = attributes.find(attr => attr.name === valueName)
      valueAttr.options = headers
      valueAttr.value = findMostMatched(admCode.options, 'value').value

      const dateAttr = attributes.find(attr => attr.name === dateName)
      dateAttr.options = headers
      dateAttr.value = findMostMatched(admCode.options, 'date').value
    }
    setAttributes([...attributes])
  }

  /** When workbook changed */
  useEffect(() => {
    if (workbook) {
      const sheetAttribute = attributes.filter(attr => {
        return attr.name === sheetName
      })[0]
      sheetAttribute.onChange = SheetChanged
      SheetChanged(
        sheetAttribute, { target: { value: sheetAttribute.value } }
      )

      const rowNumberAttribute = attributes.filter(attr => {
        return attr.name === rowNumberHeader
      })[0]
      rowNumberAttribute.onChange = (attribute, evt) => {
        attribute.value = evt.target.value
        sheetAttribute.onChange = SheetChanged
        setAttributes([...attributes])
        SheetChanged(
          sheetAttribute, { target: { value: sheetAttribute.value } }
        )
      }
    }
  }, [workbook]);

  return (
    <Harvesters attributes={attributes} setAttributes={setAttributes}
                pageName={pageNames.DataImporter}/>
  );
}


render(MetaIngestorLongFormat, store)