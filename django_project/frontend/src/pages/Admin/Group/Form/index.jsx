import React, { useEffect, useState } from 'react';

import { DataGrid } from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { AddButton, SaveButton } from "../../../../components/Elements/Button";
import Admin, { pageNames } from '../../index';
import AdminForm from '../../Components/Form'
import { fetchJSON } from "../../../../Requests";
import UserSelector from "../../ModalSelector/User";

import './style.scss';


/**
 * Indicator Form App
 */
export default function GroupForm() {
  const [submitted, setSubmitted] = useState(false);
  const [usersGroup, setUsersGroup] = useState(null);
  const [open, setOpen] = useState(false)

  /** Render **/
  const submit = () => {
    setSubmitted(true)
  }


  /** Fetch data when modal is opened **/
  useEffect(() => {
    if (urls.api.detail) {
      fetchJSON(urls.api.detail)
        .then(data => {
          setUsersGroup(data.users)
        })
    } else {
      setUsersGroup([])
    }
  }, [])

  return (
    <Admin
      pageName={pageNames.Groups}
      rightHeader={
        <SaveButton
          variant="secondary"
          text="Submit"
          onClick={submit}
          disabled={submitted ? true : false}
        />
      }>

      <AdminForm isSubmitted={submitted}>
        <div className='MembersLabel'>
          <label className="form-label required" htmlFor="name">Members</label>
          <AddButton
            variant="secondary"
            text={"Add users"}
            onClick={() => {
              setOpen(true)
            }}
          />
        </div>
        {
          usersGroup ?
            <div className='UserTable'>
              <input type={"text"} name='users' className='UserInput'
                     value={usersGroup.map(user => user.id).join(',')}/>
              <DataGrid
                rows={usersGroup}
                columns={[
                  { field: 'id', headerName: 'id', hide: true },
                  { field: 'username', headerName: 'Username', flex: 1 },
                  { field: 'email', headerName: 'Email', flex: 1 },
                  { field: 'name', headerName: 'Name', flex: 1 },
                  { field: 'role', headerName: 'Role', flex: 1 },
                ]}
                pageSize={20}
                rowsPerPageOptions={[20]}
                initialState={{
                  sorting: {
                    sortModel: [{ field: 'username', sort: 'asc' }],
                  },
                }}
                disableSelectionOnClick
              />
              <UserSelector
                open={open}
                setOpen={setOpen}
                selectedData={usersGroup}
                selectedDataChanged={setUsersGroup}
              />
            </div> :
            <div style={{ textAlign: "center" }}>
              <CircularProgress/>
            </div>
        }
      </AdminForm>
    </Admin>
  );
}

render(GroupForm, store)