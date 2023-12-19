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
  Position,
  ToolbarItem,
  Export,
  Selection,
  Toolbar,
  Item,
} from 'devextreme-react/data-grid';
import { Button } from "devextreme-react/button";
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
import { Modal } from "react-bootstrap-v5";

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

  // Popup confirm
  const [currentEmployee, setCurrentEmployee] = useState();
  const [popupVisible, setPopupVisible] = useState(false);
  const [positionOf, setPositionOf] = useState('');

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

  const refreshDataGrid = useCallback(() => {
    dataGridRef.current.instance.refresh();
  }, []);

  function refreshDataGrid2() {
    let refreshmMessage = `reload`;
    dataGridRef.current.instance.refresh()

      .then(function () {
        notify(
          {
            refreshmMessage,
            error,
            position: {
              my: 'right bottom',
              at: 'right bottom',
            },
          },
          'success',
          3000,
        );
      })
      .catch(function (error) {

        notify(
          {
            error,
            position: {
              my: 'center top',
              at: 'center top',
            },
          },
          'error',
          3000,
        );
      });
  }

  const deleteRecords = useCallback(() => {
    selectedItemKeys.forEach((key) => {
      dataSource.remove(key);
    });
    refreshDataGrid2();
    setSelectedItemKeys([]);

  }, [selectedItemKeys]);

  // const onSelectionChanged = useCallback((data: DataGridTypes.SelectionChangedEvent) => {
  const onSelectionChanged = useCallback((data) => {
    setSelectedItemKeys(data.selectedRowKeys);
  }, []);

  const renderLabel = () => <div className="toolbar-label">1.1. Quản lý thu phí</div>;
  const notesEditorOptions = { height: 100 };

  const onContentReady = (e) => {
    e.component.columnOption("command:edit", "visibleIndex", -1);
  }

  // Popup confirm
  const showInfo = useCallback((employee) => {
    setCurrentEmployee(employee);
    setPositionOf(`#image${employee.ID}`);
    setPopupVisible(true);
  }, [setCurrentEmployee, setPositionOf, setPopupVisible]);

  const hideInfo = React.useCallback(() => {
    setCurrentEmployee({});
    setPopupVisible(false);
  }, [setCurrentEmployee, setPopupVisible]);

  const sendEmail = React.useCallback(() => {
    const message = `Email is sent to`;
    notify(
      {
        message,
        position: {
          my: 'center top',
          at: 'center top',
        },
      },
      'success',
      3000,
    );
  }, [currentEmployee]);

  const getEmailButtonOptions = React.useCallback(() => ({
    icon: 'email',
    stylingMode: 'contained',
    text: 'Send',
    onClick: sendEmail,
  }), [sendEmail]);

  const getCloseButtonOptions = React.useCallback(() => ({
    text: 'Close',
    stylingMode: 'outlined',
    type: 'normal',
    onClick: hideInfo,
  }), [hideInfo]);

  return (
    <>

      <DataGrid
        id="gridContainer"
        className='responsive-paddings master-detail-grid'
        allowColumnReordering={false}
        ref={dataGridRef}
        width="100%"
        height={700}
        dataSource={dataSource}
        onExporting={onExporting}
        showBorders={true}
        remoteOperations={true}
        repaintChangesOnly={true}
        selectedRowKeys={selectedItemKeys}
        onSelectionChanged={onSelectionChanged}
      >
        <Editing mode="popup" location="center" locateInMenu="auto" allowAdding={true} allowDeleting={false} allowUpdating={true} />

        <Column dataField="STT" fixed={false} width={80} allowEditing={false} allowSorting={false} allowReordering={false} allowSearch={false} allowFiltering={false} allowExporting={true}
          cellRender={(data) => {
            return <span>{data.rowIndex + 1}</span>;
          }}>
          <StringLengthRule max={3} message="" />
        </Column>
        <Column type="buttons" width={80}> <Button name="edit" /> </Column>
        <Column dataField="OrderID" width={100} allowEditing={false}>
          <StringLengthRule max={5} message="The field OrderID must be a string with a maximum length of 5." />
        </Column>
        <Column dataField="ShipName" dataType="string" width={200} allowSearch={true} allowReordering={false}>
          <StringLengthRule max={15} message="The field ShipCountry must be a string with a maximum length of 15." />
        </Column>
        <Column dataField="Freight" dataType="number" width={150}></Column>
        <Column dataField="ShipCountry" width={200}></Column>
        <Column dataField="ShipCity" width={150}></Column>
        <Column dataField="ShipAddress" width={150}></Column>
        <Column dataField="OrderDate" dataType="date" width={110}>
          <RequiredRule message="The OrderDate field is required." />
        </Column>
        {/* <Column dataField="" width={200}></Column> */}

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

        <Selection mode="multiple" />

        <Toolbar>
          <Item location="left" locateInMenu="never" render={renderLabel} />

          <Item location="after" name="addRowButton" />
          <Item location="after" name='refresh'>
            <Button
              icon='refresh'
              widget="dxButton"
              onClick={refreshDataGrid}
              text="Refresh"
            />
          </Item>
          <Item location="after" showText="always" name='mutiple-delete'>
            <Button
              onClick={deleteRecords}
              confirmDelete="true"
              icon="trash"
              disabled={!selectedItemKeys.length}
              text="Xóa mục đã chọn"
            />
          </Item>
          <Item location='after' name='exportButton' />
          <Item location='after' name='searchPanel' />
        </Toolbar>

        <Grouping autoExpandAll={false} />
        <ColumnFixing enabled={false} />
        <Selection mode="multiple" />
        <SearchPanel location="left" visible={true} width={240} highlightSearchText={true} searchVisibleColumnsOnly={true} placeholder="Tìm kiếm" />
        <FilterRow visible={false} />
        <HeaderFilter enabled={false} visible={false} />
        <GroupPanel visible={false} />
        <Export enabled={true} formats={exportFormats} allowExportSelectedData={true} />
        <Paging enabled={true} defaultPageSize={50} defaultPageIndex={1} />
      </DataGrid>
    </>
  );
}

export default MasterDetailGrid;