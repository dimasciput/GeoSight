import React, { useEffect, useState } from 'react';
import { WhereQueryGenerator } from "../../../../components/SqlQueryGenerator"
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../components/Modal";
import { SaveButton } from "../../../../components/Elements/Button";

import './style.scss';

/**
 * Filter input
 * @param {dict} attribute Attribute of data.
 * @param {Array} attributes Attributes of data.
 * @param {Function} setAttributes Set Attribute Functions.
 * @param {Array} fields Fields of data.
 */
export default function Filter(
  { attribute, attributes, setAttributes, fields }
) {
  const [where, setWhere] = useState(attribute.value);
  const [open, setOpen] = useState(false);
  const onClosed = () => {
    setOpen(false);
  };

  useEffect(() => {
      setWhere(attribute.value)
    }, [attribute]
  )

  const onLoading = fields === undefined || fields === null
  return <div className="BasicFormSection">
    <label
      className={"form-label " + (attribute.required ? 'required' : '')}>
      {attribute.title}
    </label>
    <input
      name={'attribute_' + attribute.name}
      required={attribute.required}
      type="text"
      hidden={true}
      value={attribute.value}
      onChange={(evt) => {
      }}
    />
    <div className='InputInLine'>
      <div className="BasicFormSection">
        <input
          disabled={onLoading}
          type="text"
          placeholder={onLoading ? "Loading" : "SQL Filter"}
          readOnly={true}
          value={attribute.value}
          onClick={evt => setOpen(true)}
          onChange={(evt) => {

          }}
        />
        <span className="form-helptext">{attribute.description}</span>
      </div>
    </div>
    <Modal
      className={'WhereConfigurationModal'}
      open={open}
      onClosed={onClosed}
    >
      <ModalHeader onClosed={onClosed}>
        Change filter for the data.
      </ModalHeader>
      <ModalContent>
        <WhereQueryGenerator
          fields={fields}
          whereQuery={where}
          setWhereQuery={(where) => {
            setWhere(where)
          }}/>
        {
          fields ?
            <div className='Save-Button'>
              <SaveButton
                variant="secondary"
                text={"Apply"}
                onClick={() => {
                  attribute.value = where
                  setAttributes([...attributes])
                  setOpen(false)
                }}/>
            </div> : ""
        }
      </ModalContent>
    </Modal>
  </div>
}