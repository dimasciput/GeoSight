/* ==========================================================================
   Bookmark
   ========================================================================== */

import React, { Fragment, useEffect, useState } from 'react';
import $ from "jquery";
import { useDispatch, useSelector } from "react-redux";
import StarIcon from "@mui/icons-material/Star";
import SaveAsIcon from '@mui/icons-material/SaveAs';
import TextField from "@mui/material/TextField";
import EditIcon from '@mui/icons-material/Edit';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import { fetchingData } from "../../../../Requests";
import { Actions } from '../../../../store/dashboard/index'
import { SaveButton, ThemeButton } from "../../../Elements/Button";
import Modal, { ModalContent, ModalFooter, ModalHeader } from "../../../Modal";
import CustomPopover from "../../../CustomPopover";
import { PluginChild } from "../../MapLibre/Plugin";

import './style.scss';

/**
 * Bookmark component.
 */
export default function Bookmark() {
  const dispatch = useDispatch();
  const dashboardData = useSelector(state => state.dashboard.data);
  const selectedIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);
  const selectedBookmark = useSelector(state => state.selectedBookmark);
  const {
    basemapLayer,
    contextLayers,
    extent
  } = useSelector(state => state.map)
  const data = () => {
    return {
      name: name,
      selectedBasemap: basemapLayer?.id,
      selectedIndicatorLayer: selectedIndicatorLayer?.id,
      selectedContextLayers: Object.keys(contextLayers).map(id => parseInt(id)),
      filters: dashboardData.filters,
      extent: extent
    }
  }

  const [onload, setOnload] = useState(true)
  const [updateList, setUpdateList] = useState(true)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  // Bookmarks
  const [bookmarks, setBookmarks] = useState(null)

  // Bookmark save
  const [saveBookmarkID, setSaveBookmarkID] = useState(null)

  // Fetch bookmark list
  useEffect(() => {
    if (updateList) {
      setBookmarks(null)
      fetchingData(urls.bookmarkList, {}, {}, (data) => {
        setBookmarks(data)
      }, !updateList)
      setUpdateList(false)
    }
  }, [updateList])

  // Fetch bookmark list
  useEffect(() => {
    if (!onload && bookmarks !== null) {
      const bookmark = bookmarks.find(row => row.name === selectedBookmark)
      if (bookmark) {
        dashboardData.extent = bookmark.extent
        dashboardData.basemapsLayers.map(layer => {
          layer.visible_by_default = layer.id === bookmark.selected_basemap
        })
        dashboardData.indicatorLayers.map(layer => {
          layer.visible_by_default = bookmark.selected_indicator_layer === layer.id
        })
        dashboardData.contextLayers.map(layer => {
          layer.visible_by_default = bookmark.selected_context_layers.includes(layer.id)
        })
        dashboardData.filters = bookmark.filters

        dispatch(
          Actions.Dashboard.update(JSON.parse(JSON.stringify(dashboardData)))
        )
      }
    } else if (bookmarks !== null) {
      setOnload(false)
    }
  }, [bookmarks, selectedBookmark])


  // on save data
  const onSaveAs = () => {
    $.ajax({
      url: urls.bookmarkCreate,
      data: {
        data: JSON.stringify(data())
      },
      type: 'POST',
      dataType: 'json',
      success: function (data, textStatus, request) {
        dispatch(Actions.SelectedBookmark.change(name))
        setUpdateList(true)
        setOpen(false)
      },
      error: function (error, textStatus, errorThrown) {
        if (error.responseText) {
          setError(error.responseText);
        } else {
          try {
            setError(error.responseJSON.detail);
          } catch (err) {
            setError(error.statusText);
          }
        }
      },
      beforeSend: beforeAjaxSend
    });
  }
  // on save data
  const onSave = (id) => {
    $.ajax({
      url: urls.bookmarkDetail.replaceAll('/0', `/${id}`),
      data: {
        data: JSON.stringify(data())
      },
      type: 'POST',
      dataType: 'json',
      success: function (data, textStatus, request) {
        dispatch(Actions.SelectedBookmark.change(name))
        setUpdateList(true)
        setOpen(false)
      },
      error: function (error, textStatus, errorThrown) {
        if (error.responseText) {
          setError(error.responseText);
        } else {
          try {
            setError(error.responseJSON.detail);
          } catch (err) {
            setError(error.statusText);
          }
        }
      },
      beforeSend: beforeAjaxSend
    });
  }
  const bookmarkSave = bookmarks ? bookmarks.find(
    row => row.id === saveBookmarkID) : null

  if (!dashboardData.id) {
    return ""
  }
  return (
    <CustomPopover
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      Button={
        <PluginChild title={'Bookmark'}>
          <StarIcon/>
        </PluginChild>
      }>{/* LIST OF BOOKMARKS */}
      <div className='BookmarkComponent'>
        <div className='Header'>

          <ThemeButton
            variant="primary-text"
            onClick={() => {
              setSaveBookmarkID(null)
              setOpen(true)
              setName('')
            }}>
            <SaveAsIcon/> Save As...
          </ThemeButton>
        </div>

        <div className='Body'>
          <table>
            <tbody>
            {
              bookmarks === null ? <tr>
                  <td>Loading</td>
                </tr> :
                <Fragment>
                  {
                    bookmarks.map(bookmark => {
                      return (
                        <tr
                          key={bookmark.id}
                          className={'Bookmark ' + (bookmark.name === selectedBookmark ? 'Selected' : '')}
                          onClick={() => {
                            dispatch(Actions.SelectedBookmark.change(bookmark.name))
                          }}
                        >
                          <td><StarIcon className='StarIcon'/></td>
                          <td>
                            <div>{bookmark.name}</div>
                          </td>
                          {
                            bookmark.id && (user.is_staff || user.username === bookmark.creator) ?
                              <Fragment>
                                <td>
                                  <EditIcon
                                    className='EditIcon'
                                    onClick={(e) => {
                                      setSaveBookmarkID(bookmark.id)
                                      setOpen(true)
                                      setName(bookmark.name)
                                      e.stopPropagation()
                                    }}/>
                                </td>
                                <td>
                                  <HighlightOffIcon
                                    className='DeleteIcon'
                                    onClick={(e) => {
                                      if (confirm(`Are you sure you want to delete ${bookmark.name}?`)) {
                                        $.ajax({
                                          url: urls.bookmarkDetail.replaceAll('/0', `/${bookmark.id}`),
                                          method: 'DELETE',
                                          success: function () {
                                            if (selectedBookmark === bookmark.name) {
                                              dispatch(Actions.SelectedBookmark.change('Default'))
                                            }
                                            setUpdateList(true)
                                          },
                                          beforeSend: beforeAjaxSend
                                        });
                                        e.stopPropagation()
                                      }
                                      e.stopPropagation()
                                    }}/>
                                </td>
                              </Fragment>
                              : <td></td>
                          }
                        </tr>
                      )
                    })
                  }
                </Fragment>
            }
            </tbody>
          </table>
        </div>
      </div>

      {/* SAVE MODAL */}
      <Modal
        open={open}
        onClosed={() => {
          setOpen(false)
        }}
      >
        <ModalHeader onClosed={() => {
          setOpen(false)
        }}>
          {
            bookmarkSave ?
              <Fragment>
                {`Save bookmark ${bookmarkSave.name}`}
                <div className='helptext'>
                  {`Save current selection and extent to ${bookmarkSave.name}.`}
                </div>
              </Fragment> :
              <Fragment>
                Save bookmark as
                <div className='helptext'>
                  Save current selection and extent as new bookmark.
                </div>
              </Fragment>
          }
        </ModalHeader>
        <ModalContent>
          <TextField
            fullWidth label="Bookmark Name"
            value={name} onChange={(event) => {
            setName(event.target.value)
          }}/>
          {error ? <div className='error'>{error}</div> : ""}
        </ModalContent>
        <ModalFooter>
          <SaveButton
            variant="secondary"
            text='Submit'
            onClick={() => {
              if (bookmarkSave) {
                onSave(bookmarkSave?.id)
              } else {
                onSaveAs()
              }
            }}
            disabled={!name || !basemapLayer || !extent || !selectedIndicatorLayer}/>
        </ModalFooter>
      </Modal>
    </CustomPopover>
  )
}