import React, { useEffect, useState } from 'react';
import "./master-detail-grid.scss"
import "./modal.scss"
import 'devextreme/data/odata/store';
import {
  Column,
  DataGrid,
  FilterRow,
  HeaderFilter,
  GroupPanel,
  Editing,
  Grouping,
  Paging,
  // PagingPanel,
  Popup,
  Pager,
  CheckBox,
  SelectBox,
  Lookup,
  Summary,
  RangeRule,
  RequiredRule,
  StringLengthRule,
  GroupItem,
  TotalItem,
  ValueFormat,
  ColumnFixing,
  Export,
  Selection
} from 'devextreme-react/data-grid';

import { createStore } from 'devextreme-aspnet-data-nojquery';

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
import { Modal, Button } from "react-bootstrap-v5"

const url = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';

const dataSource = createStore({
  key: 'OrderID',
  loadUrl: `${url}/Orders`,
  insertUrl: `${url}/InsertOrder`,
  updateUrl: `${url}/UpdateOrder`,
  deleteUrl: `${url}/DeleteOrder`,
  onBeforeSend: (method, ajaxOptions) => {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

const customersData = createStore({
  key: 'Value',
  loadUrl: `${url}/CustomersLookup`,
  onBeforeSend: (method, ajaxOptions) => {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

const shippersData = createStore({
  key: 'Value',
  loadUrl: `${url}/ShippersLookup`,
  onBeforeSend: (method, ajaxOptions) => {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

const exportFormats = ['xlsx', 'pdf'];

function onExporting(e) {
  if (e.format === 'xlsx') {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Companies');
    exportDataGridToExcel({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Companies.xlsx');
      });
    });
  }
  else if (e.format === 'pdf') {
    const doc = new jsPDF();
    exportDataGridToPdf({
      jsPDFDocument: doc,
      component: e.component
    }).then(() => {
      doc.save('Companies.pdf');
    })
  };
}

// Import
const ExcelToJSON = function () {

  this.parseExcel = function (file) {
    let reader = new FileReader();

    reader.onload = function (e) {
      let data = e.target.result;
      let workbook = XLSX.read(data, {
        type: 'binary'
      });
      workbook.SheetNames.forEach(function (sheetName) {
        // Here is your object
        let XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        let json_object = JSON.stringify(XL_row_object);
        console.log(JSON.parse(json_object));
        $('#xlx_json').val(json_object);
      })
    };

    reader.onerror = function (ex) {
      console.log(ex);
    };

    reader.readAsBinaryString(file);
  };
};

function handleFileSelect(evt) {
  let files = evt.target.files; // FileList object
  let xl2json = new ExcelToJSON();
  xl2json.parseExcel(files[0]);
}

const MasterDetailGrid = () => {
  const allowedPageSizes = [50, 100, 150, 200];
  const [items, setItems] = useState([]);

  // Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const readExcel = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;

        const wb = XLSX.read(bufferArray, { type: "buffer" });

        const wsname = wb.SheetNames[0];

        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws);

        resolve(data);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise.then((d) => {
      setItems(d);
    });
  };

  return (
    <>
      <div className='item-function-btn'>
        <Button className='qi-button' variant="primary" onClick={handleShow}>
          Nhập từ excel
        </Button>

      </div>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className='modal-title-wrapper'>
            <img className='modal-logo' src='' alt='' />
            <p className='modal-title'>Quản lý thu phí</p>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className='item-header'>
            <div className='item-title'>
              <img className='icon' src='' alt='' />
              <p>Nhập từ excel</p>
            </div>

            <div className='item-function'>
              <div className='item-function-btn'>
                <Button className='qi-button'>
                  Tải file mẫu
                </Button>
              </div>

              <div className='item-function-btn'>
                <Button className='qi-button'>
                  Ghi
                </Button>
              </div>

              <div className='item-function-btn'>
                <Button className='qi-button' variant="secondary" onClick={handleClose}>
                  Đóng
                </Button>
              </div>
            </div>
          </div>

          <div className='item-filter'>

          </div>

          <div className='upload-item-wrapper'>
            <div className='upload-item'>
              <form name='upload-form' className='upload-file' enctype="multipart/form-data">
                <input id="file" type="file" name="files[]" />
              </form>

              <textarea id="xlx_json" class="form-control" rows="35" cols="120" ></textarea>
              {/* <button className='upload' >Tải lên</button> */}
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <DataGrid
        className='responsive-paddings'
        dataSource={dataSource}
        showBorders={true}
        width="100%"
        height={600}
        remoteOperations={true}
        onExporting={onExporting}
      >
        <Editing
          mode="row"
          allowAdding={true}
          allowDeleting={true}
          allowUpdating={true}
        />

        <Column dataField="CustomerID" caption="Tên" fixed={true} allowFiltering={true} allowExporting={true}>
          <Lookup dataSource={customersData} valueExpr="Value" displayExpr="Text" />
          <StringLengthRule max={5} message="The field Customer must be a string with a maximum length of 5." />
        </Column>

        <Column dataField="OrderDate" caption="Ngày đặt hàng" dataType="date" width={150}>
          <RequiredRule message="The OrderDate field is required." />
        </Column>

        <Column dataField="Freight" caption="Tổng tiền" width={130} allowFiltering={true} allowExporting={true}>
          <HeaderFilter groupInterval={100} />
          <RangeRule min={0} message="The field Freight must be between 0 and 2000." />
        </Column>

        <Column dataField="ShipCountry" caption="Địa chỉ đặt hàng" width={200} allowFiltering={true} allowExporting={true}>
          <StringLengthRule max={15} message="The field ShipCountry must be a string with a maximum length of 15." />
        </Column>

        <Column dataField="ShipLocation" caption="Địa chỉ giao hàng " allowFiltering={true} >
          <StringLengthRule max={15} message="The field ShipLocation must be a string with a maximum length of 15." />
        </Column>

        <Column
          dataField="ShipVia"
          caption="Tên nhà vận chuyển "
          dataType="number"
        >
          <Lookup dataSource={shippersData} valueExpr="Value" displayExpr="Text" />
        </Column>

        <Summary>
          <TotalItem column="Freight" summaryType="sum">
            <ValueFormat type="decimal" precision={2} />
          </TotalItem>

          <GroupItem column="Freight" summaryType="sum">
            <ValueFormat type="decimal" precision={2} />
          </GroupItem>

          <GroupItem summaryType="count" >
          </GroupItem>
        </Summary>

        <Grouping autoExpandAll={false} />
        <ColumnFixing enabled={true} />
        <Selection mode="multiple" />
        <FilterRow visible={true} />
        <HeaderFilter enabled={true} visible={true} />
        <GroupPanel visible={false} />
        <Export enabled={true} formats={exportFormats} allowExportSelectedData={true} />
        <Paging enabled={true} defaultPageSize={50} defaultPageIndex={1} />
      </DataGrid >

    </>
  );
}

export default MasterDetailGrid;