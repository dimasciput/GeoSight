import React, { useEffect, useState } from 'react';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import Harvesters from '../../Harvesters'
import { SelectWithList } from "../../../../components/Input/SelectWithList";
import { dictDeepCopy } from "../../../../utils/main"
import { ThemeButton } from "../../../../components/Elements/Button";
import { pageNames } from "../../index";

import './style.scss';


/**
 * MetaIngestorWideFormat App
 */
export default function MetaIngestorWideFormat() {
  const sheetName = "sheet_name";
  const rowNumberHeader = "row_number_for_header";
  const admCodeName = "column_name_administration_code";

  const attributesInputs = []
  const mappingInputs = []
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
    } else {
      mappingInputs.push(attribute)
    }
  })

  const [attributes, setAttributes] = useState(attributesInputs);
  const [mappingAttributes, setMappingAttributes] = useState([]);
  const [headers, setHeaders] = useState([]);

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

      const admCode = attributes.filter(attr => {
        return attr.name === admCodeName
      })[0]

      const headers = array[rowNumber.value - 1] ? array[rowNumber.value - 1] : []
      admCode.options = headers
      admCode.value = admCode.options.find(option => ['dcode', 'pcode'].includes(option.toLowerCase()))

      // CHECK THE ATTRIBUTES
      const attributesMatched = []
      mappingInputs.map(attribute => {
        const shortcode = attribute.data.shortcode
        const headerMatcher = headers.find(
          header => header === shortcode
        )
        if (headerMatcher) {
          const attr = dictDeepCopy(attribute)
          attr.options = headers
          attr.value = shortcode
          attributesMatched.push(attr)
        }
      })
      setMappingAttributes([...attributesMatched])
      setHeaders(headers)
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
    <Harvesters
      attributes={attributes} setAttributes={setAttributes}
      pageName={pageNames.DataImporter}>
      <table className='IndicatorSelection'>
        <tbody>
        <tr>
          <th colSpan={3}>
            <div className='IndicatorSelectionTitle'>
              <div>Indicator Mapping</div>
              <ThemeButton
                variant="secondary"
                onClick={() => {
                  const attr = dictDeepCopy(mappingInputs[0])
                  attr.options = headers
                  attr.value = headers[0]
                  mappingAttributes.push(attr)
                  setMappingAttributes([...mappingAttributes])
                }}
              >
                <AddCircleIcon/>Add new mapping
              </ThemeButton>
            </div>
          </th>
        </tr>
        {
          mappingAttributes.map((attribute, idx) => {
            return (
              <tr key={idx}>
                <td>
                  <SelectWithList
                    list={mappingInputs.map(attr => {
                      return {
                        value: attr.name,
                        label: attr.data.name,
                      }
                    })}
                    value={attribute.name}
                    onChange={evt => {
                      const changeAttr = dictDeepCopy(
                        mappingInputs.find(attr => attr.name === evt.value)
                      )
                      attribute.data = changeAttr.data
                      attribute.name = changeAttr.name
                      attribute.title = changeAttr.title
                      setMappingAttributes([...mappingAttributes])
                    }}/>
                </td>
                <td>
                  <SelectWithList
                    name={'attribute_' + attribute.name}
                    list={attribute.options}
                    value={attribute.value}
                    onChange={evt => {
                      attribute.value = evt.value
                      setMappingAttributes([...mappingAttributes])
                    }}/>
                </td>
                <td className='DeleteButtonSection DeleteButton'>
                  <RemoveCircleIcon onClick={e => {
                    mappingAttributes.splice(idx, 1);
                    setMappingAttributes([...mappingAttributes])
                  }}/>
                </td>
              </tr>
            )
          })
        }
        </tbody>
      </table>
    </Harvesters>
  );
}


render(MetaIngestorWideFormat, store)