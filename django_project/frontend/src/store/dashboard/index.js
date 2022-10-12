import { compose, legacy_createStore as createStore } from 'redux';
import rootReducer from './reducers';

// Reducers and Actions
import Basemaps from './reducers/basemap/actions'
import ContextLayers from './reducers/contextLayers/actions'
import Dashboard from './reducers/dashboard/actions'
import Extent from './reducers/extent/actions'
import Filters from './reducers/filters/actions'
import FiltersData from './reducers/filtersData/actions'
import FilteredGeometries from './reducers/filteredGeometries/actions'
import Geometries from './reducers/geometries/actions'
import IndicatorLayers from './reducers/indicatorLayers/actions'
import Indicators from './reducers/indicators/actions'
import IndicatorsData from './reducers/indicatorsData/actions'
import Map from './reducers/map/actions'
import ReferenceLayer from './reducers/referenceLayer/actions'
import ReferenceLayerData from './reducers/referenceLayerData/actions'
import SelectedAdminLevel from './reducers/selectedAdminLevel/actions'
import SelectedIndicatorLayer from './reducers/selectedIndicatorLayer/actions'
import SelectedBookmark from './reducers/selectedBookmark/actions'
import SelectedGlobalTime from './reducers/selectedGlobalTime/actions'
import Widgets from './reducers/widgets/actions'

const Actions = {
  Basemaps,
  ContextLayers,
  Dashboard,
  Extent,
  Filters,
  FilteredGeometries,
  FiltersData,
  Geometries,
  IndicatorLayers,
  Indicators,
  IndicatorsData,
  Map,
  ReferenceLayer,
  ReferenceLayerData,
  SelectedAdminLevel,
  SelectedIndicatorLayer,
  SelectedBookmark,
  SelectedGlobalTime,
  Widgets
}

export { Actions }

const initialState = {};
const enhancers = [];

// Dev Tools
if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}

const composedEnhancers = compose(
  ...enhancers
);

export const store = createStore(rootReducer, initialState, composedEnhancers);