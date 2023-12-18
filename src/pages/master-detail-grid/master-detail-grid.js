import React, { useEffect, useState, useRef, useCallback } from 'react';

import "./modal.scss";
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
  Popup,
  Form,
  Pager,
  CheckBox,
  SelectBox,
  SearchPanel,
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
  Selection,
  Toolbar,
  Item,
} from 'devextreme-react/data-grid';
import "./master-detail-grid.scss";
import notify from 'devextreme/ui/notify';

import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
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
import { Modal, Button } from "react-bootstrap-v5";

import readXlsxFile from 'read-excel-file';

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

// Export files
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
// const ExcelToJSON = function () {
//   this.parseExcel = function (file) {
//     let reader = new FileReader();

//     reader.onload = function (e) {
//       let data = e.target.result;
//       let workbook = XLSX.read(data, {
//         type: 'binary'
//       });
//       workbook.SheetNames.forEach(function (sheetName) {
//         // Here is your object
//         let XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
//         let json_object = JSON.stringify(XL_row_object);
//         console.log(JSON.parse(json_object));
//         $('#xlx_json').val(json_object);
//       })
//     };

//     reader.onerror = function (ex) {
//       console.log(ex);
//     };

//     reader.readAsBinaryString(file);
//   };
// };

// function handleFileSelect(evt) {
//   let files = evt.target.files; // FileList object
//   let xl2json = new ExcelToJSON();
//   xl2json.parseExcel(files[0]);
// }

// const input = document.getElementById('input')
// input.addEventListener('change', () => {
//   readXlsxFile(input.files[0]).then((rows) => {
//     // `rows` is an array of rows
//     // each row being an array of cells.
//   })
// })

const MasterDetailGrid = () => {
  const [data, setData] = useState([]);

  const allowedPageSizes = [50, 100, 150, 200];
  // const [items, setItems] = useState([]);

  // Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // File upload
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState();
  const [error, setError] = useState();
  const [fileContent, setFileContent] = useState('');

  // Delete
  const [selectedItems, setSelectedItems] = useState([]);
  const [editedItems, setEditedItems] = useState({});

  // const readExcel = (file) => {
  //   const promise = new Promise((resolve, reject) => {
  //     const fileReader = new FileReader();
  //     fileReader.readAsArrayBuffer(file);

  //     fileReader.onload = (e) => {
  //       const bufferArray = e.target.result;

  //       const wb = XLSX.read(bufferArray, { type: "buffer" });

  //       const wsname = wb.SheetNames[0];

  //       const ws = wb.Sheets[wsname];

  //       const data = XLSX.utils.sheet_to_json(ws);

  //       resolve(data);
  //     };

  //     fileReader.onerror = (error) => {
  //       reject(error);
  //     };
  //   });

  //   promise.then((d) => {
  //     setItems(d);
  //   });
  // };

  // document.getElementById('file').addEventListener('change', handleFileSelect, false);

  // $("#file").on("change", function (e) {
  //   e.preventDefault();
  //   handleFileSelect();
  // });

  var ExcelToJSON = function () {

    this.parseExcel = function (file) {
      var reader = new FileReader();

      reader.onload = function (e) {
        var data = e.target.result;
        var workbook = XLSX.read(data, {
          type: 'binary'
        });
        workbook.SheetNames.forEach(function (sheetName) {
          // Here is your object
          var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
          var json_object = JSON.stringify(XL_row_object);
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

  // Upload
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      function getExtension() {
        return file.name.split('.').pop().toLowerCase();
      }

      if (getExtension() === "xls" || getExtension() === "xlsx") {
        try {
          const result = await fetch("https://localhost:44300/upload", {
            method: "POST",
            body: formData,
            success: function (fileData) {
              alert(fileData)
            },
          });

          // Download file
          // const data = await result.json();
          // console.log("Data:" + data);

          // Read the content of the file using FileReader
          const reader = new FileReader();

          reader.onload = (event) => {
            // Set the file content to state
            setFileContent(event.target.result);
          };

          // Start reading the file as text
          reader.readAsText(file);

          // Set the file to state if needed for further processing
          setFile(file);
          // console.log("setFile is" + file);
          // console.log(setFile());

          const excelJSON = JSON.stringify(file);
          console.log(typeof (excelJSON));

          let xl2json = new ExcelToJSON();
          console.log(typeof (xl2json));
          let excelArray = xl2json.parseExcel(file);
          console.log(typeof (file));

          // let excelObject = excelArray.reduce(function (o, val) { o[val] = val; return o; }, {});
          // console.log(JSON.stringify(excelObject));
        }
        catch (error) {
          console.error("Lỗi: " + error);
        }
      } else {
        console.error("Chỉ cho phép nhập dữ liệu từ file Excel (*.xls, *.xlsx)")
      }
    } else {
      console.error("Bạn chưa lựa chọn file excel!")
    }
  };
  // End of upload

  const dataGridRef = useRef(null);
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);

  const deleteRecords = useCallback(() => {
    selectedItemKeys.forEach((key) => {
      dataSource.remove(key);
    });
    setSelectedItemKeys([]);
    refreshDataGrid();
  }, [selectedItemKeys]);

  // const onSelectionChanged = useCallback((data: DataGridTypes.SelectionChangedEvent) => {
  const onSelectionChanged = useCallback((data) => {
    setSelectedItemKeys(data.selectedRowKeys);
  }, []);

  const refreshDataGrid = useCallback(() => {
    dataGridRef.current.instance.refresh();
  }, []);

  const renderLabel = () => <div className="toolbar-label">1.1. Quản lý thu phí</div>;
  const notesEditorOptions = { height: 100 };

  const onContentReady = (e) => {
    e.component.columnOption("command:edit", "visibleIndex", -1);
  }

  return (
    <>
      <div className='item-function-btn import-excel'>
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
              {/* <form name='upload-form' className='upload-file' encType="multipart/form-data">
                <input id="input-file" type="file" />
              </form>


              <textarea id="xlx_json" className="form-control" rows="35" cols="120" ></textarea>
              <button className='upload' >Tải lên</button> */}

              <form name='upload-form' className='upload-file' >
                <input id="file" type="file" onChange={handleFileChange} accept=".xls, .xlsx" />

              </form>

              {file && <button className='upload' onClick={handleUpload}>Tải lên</button>}

              <DataGrid
                dataSource={file}
              />
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <DataGrid
        className='responsive-paddings'
        allowColumnReordering={false}
        onload={onContentReady}
        ref={dataGridRef}
        dataSource={dataSource}
        showBorders={true}
        width="100%"
        height={600}
        remoteOperations={true}
        onExporting={onExporting}
        onSelectionChanged={onSelectionChanged}
      >
        <Editing
          mode="popup"
          allowUpdating={true}
          allowAdding={true}
          allowDeleting={false}
          confirmDelete={true}
          fixed={true}
          fixedPosition="left"
        />
        <Column caption="STT" fixed={true} width={90} allowSorting={false} allowReordering={false} allowSearch={false} allowFiltering={false} allowExporting={true}
          cellRender={(data) => {
            return <span>{data.rowIndex + 1}</span>;
          }}
        >
          <StringLengthRule max={3} message="" />
        </Column>

        <Column dataField="CustomerID" caption="Tên" width={200} allowFiltering={false} allowExporting={true} allowSearch={true}>
          {/* <Lookup dataSource={customersData} valueExpr="Value" displayExpr="Text" /> */}
          <StringLengthRule min={1} message="The field Customer must be a string with a maximum length of 5." />
        </Column>

        <Column dataField="OrderDate" caption="Ngày đặt hàng" dataType="date" width={150} allowSearch={false}>
          <RequiredRule message="The OrderDate field is required." />
        </Column>

        <Column dataField="Freight" caption="Tổng tiền" width={130} allowFiltering={true} allowExporting={true} allowSearch={false}>
          <HeaderFilter groupInterval={100} />
          <RangeRule min={0} message="The field Freight must be between 0 and 2000." />
        </Column>

        <Column dataField="ShipCountry" caption="Địa chỉ đặt hàng" width={200} allowFiltering={true} allowExporting={true} allowSearch={true}>
          <StringLengthRule max={15} message="The field ShipCountry must be a string with a maximum length of 15." />
        </Column>

        {/* <Column dataField="ShipLocation" caption="Địa chỉ giao hàng " allowFiltering={true} allowSearch={false} >
          <StringLengthRule max={15} message="The field ShipLocation must be a string with a maximum length of 15." />
        </Column> */}

        <Column dataField="ShipVia" caption="Tên nhà vận chuyển" dataType="number" allowSearch={true} allowReordering={false} >
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

        <Popup title="Employee Info" showTitle={true} width={700} height={525} />

        <Form>
          <Item itemType="group" colCount={2} colSpan={2}>
            <Item dataField="CustomerID" />
            <Item dataField="OrderDate" dataType="date" />
            <Item dataField="Freight" />
            <Item dataField="ShipCountry" />
            {/* <Item dataField="ShipLocation" /> */}
            <Item dataField="ShipVia" />
          </Item>
        </Form>

        {/* </Editing> */}

        <Grouping autoExpandAll={false} />
        <ColumnFixing enabled={true} />
        <Selection mode="multiple" />
        <SearchPanel location="left" visible={true} width={240} highlightSearchText={true} searchVisibleColumnsOnly={true} placeholder="Tìm kiếm" />
        <FilterRow visible={false} />
        <HeaderFilter enabled={false} visible={false} />
        <GroupPanel visible={false} />
        <Export enabled={true} formats={exportFormats} allowExportSelectedData={true} />
        <Paging enabled={true} defaultPageSize={50} defaultPageIndex={1} />
      </DataGrid >

    </>
  );
}

export default MasterDetailGrid;