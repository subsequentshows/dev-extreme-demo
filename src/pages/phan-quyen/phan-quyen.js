import React, { useState, useCallback } from 'react';
import './phan-quyen.scss';
import DataGrid, { Column, Editing, Paging, Form, Selection, Lookup, LoadPanel, Toolbar, Item, DataGridTypes }
  from 'devextreme-react/data-grid';
import {
  Popup, Position, ToolbarItem
} from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';

// Export to excel library
import { exportDataGrid as exportDataGridToExcel } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

// Export to pdf library
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { jsPDF } from "jspdf";
// Default export is a4 paper, portrait, using millimeters for units

import * as XLSX from "xlsx";
import * as JSZIP from "jszip";
import $ from 'jquery';
import { Modal } from "react-bootstrap-v5";

import readXlsxFile from 'read-excel-file';

const PhanQuyen = () => {


  return (
    <>
      <h2 className={'content-block'}>Phan Quyen</h2>
      <div className={'content-block'}>
        <div className={'dx-card responsive-paddings'}>

        </div>
      </div>
    </>
  )
};


export default PhanQuyen;