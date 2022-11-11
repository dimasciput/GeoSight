import React, { Fragment, useEffect, useState } from 'react';
import { Actions } from '../../store/dashboard';
import { useDispatch, useSelector } from 'react-redux';
import LeftPanel from '../../components/Dashboard/LeftPanel'
import MapLibre from '../../components/Dashboard/MapLibre'
import RightPanel from '../../components/Dashboard/RightPanel'
import BottomPanel from '../../components/Dashboard/BottomPanel'

import './style.scss';

export default function Dashboard({ children }) {
  const dispatch = useDispatch();
  const { data } = useSelector(state => state.dashboard);
  const [leftExpanded, setLeftExpanded] = useState(true);

  // Fetch data of dashboard
  useEffect(() => {
    dispatch(
      Actions.Dashboard.fetch(dispatch)
    )
  }, []);

  return (
    <div className={'dashboard ' + (leftExpanded ? 'LeftExpanded' : "")}>
      {Object.keys(data).length > 0 ?
        <Fragment>
          <LeftPanel setLeftExpanded={setLeftExpanded}/>
          <MapLibre/>
          <RightPanel/>
          <BottomPanel/>
        </Fragment> :
        <div></div>
      }
      {children ? children : ""}
    </div>
  );
}