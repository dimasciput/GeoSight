import React from 'react';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from "../../index";
import Detail from "../../Harvesters/Detail/index";


/**
 * Data Importer Detail page
 */
export default function DataImporterDetail() {
  return <Detail pageName={pageNames.DataImporter}/>
}


render(DataImporterDetail, store)