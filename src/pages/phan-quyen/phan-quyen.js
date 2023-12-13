import React from 'react';
import './phan-quyen.scss';

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
import { Modal, Button } from "react-bootstrap-v5";

import readXlsxFile from 'read-excel-file';

const PhanQuyen = () => {
  // function handleChange(e) {
  //   this.file = e.target.files[0]
  // }

  // function handleImport() {
  //   const wb = new Excel.Workbook();
  //   const reader = new FileReader()

  //   reader.readAsArrayBuffer(this.file)
  //   reader.onload = () => {
  //     const buffer = reader.result;
  //     wb.xlsx.load(buffer).then(workbook => {
  //       console.log(workbook, 'workbook instance')
  //       workbook.eachSheet((sheet, id) => {
  //         sheet.eachRow((row, rowIndex) => {
  //           console.log(row.values, rowIndex)
  //         })
  //       })
  //     })
  //   }
  // }

  return (
    <>
      <h2 className={'content-block'}>Phan Quyen</h2>
      <div className={'content-block'}>
        <div className={'dx-card responsive-paddings'}>
          {/* <input type="file" change={handleChange} /> */}

        </div>
      </div>
    </>
  )
};


export default PhanQuyen;