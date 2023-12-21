import React, { useRef, useCallback, useEffect, useState } from 'react';
import DataGrid, { Column, Editing, Paging, Form, Selection, Lookup, LoadPanel, Toolbar, Item, DataGridTypes }
  from 'devextreme-react/data-grid';
import {
  Popup
} from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import FileUploader, { FileUploaderTypes } from 'devextreme-react/file-uploader';
import 'whatwg-fetch';
import notify from 'devextreme/ui/notify';
import './demo-data-grid.scss';

import { jsPDF } from "jspdf";
// Default export is a4 paper, portrait, using millimeters for units

import * as XLSX from "xlsx";
import * as JSZIP from "jszip";
import $ from 'jquery';
import { Modal } from "react-bootstrap-v5";

import readXlsxFile from 'read-excel-file';

const URL = 'https://js.devexpress.com/Demos/Mvc/api/DataGridBatchUpdateWebApi';

const ordersStore = createStore({
  key: 'OrderID',
  loadUrl: `${URL}/Orders`,
  onBeforeSend: (method, ajaxOptions) => {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

async function sendBatchRequest(url, changes) {
  const result = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(changes),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    credentials: 'include',
  });

  if (!result.ok) {
    const json = await result.json();

    throw json.Message;
  }
}

async function processBatchRequest(url, changes, component) {
  await sendBatchRequest(url, changes);
  await component.refresh(true);
  component.cancelEditData();
}

// let uploadedFileValue = $("#fileUploaderContainer").dxFileUploader("option", "value");

const renderContent = () => {
  // const [multiple, setMultiple] = useState(false);
  // const [uploadMode, setUploadMode] = useState < FileUploaderTypes.Properties['uploadMode'] > ('instantly');
  // const [accept, setAccept] = useState('*');
  // const [selectedFiles, setSelectedFiles] = useState([]);

  // // Upload
  // const onSelectedFilesChanged = useCallback((e) => {
  //   setSelectedFiles(e.value);
  // }, [setSelectedFiles]);

  // const onAcceptChanged = useCallback((e) => {
  //   setAccept(e.value);
  // }, [setAccept]);

  // const onUploadModeChanged = useCallback((e) => {
  //   setUploadMode(e.value);
  // }, [setUploadMode]);

  return (
    <>
      {/* <FileUploader
        multiple={multiple}
        accept={accept}
        uploadMode={uploadMode}
        uploadUrl="https://js.devexpress.com/Demos/NetCore/FileUploader/Upload"
        onValueChanged={onSelectedFilesChanged}
      />

      <div
        className="content"
        style={{ display: selectedFiles.length > 0 ? 'block' : 'none' }}>
        <div>
          <h4>Selected Files</h4>
          {selectedFiles.map((file, i) => (
            <div className="selected-item" key={i}>
              <span>{`Name: ${file.name}`}<br /></span>
              <span>{`Size ${file.size}`}<br /></span>
              <span>{`Type ${file.type}`}<br /></span>
              <span>{`Last Modified Date: ${file.lastModifiedDate}`}</span>
            </div>
          ))}
        </div>
      </div> */}
      <p>hêhe</p>
    </>
  )
}

const DemoDataGrid = ({ onSelected, onDelete }) => {
  // var ExcelToJSON = function () {

  //   this.parseExcel = function (file) {
  //     var reader = new FileReader();

  //     reader.onload = function (e) {
  //       var data = e.target.result;
  //       var workbook = XLSX.read(data, {
  //         type: 'binary'
  //       });
  //       workbook.SheetNames.forEach(function (sheetName) {
  //         // Here is your object
  //         var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
  //         var json_object = JSON.stringify(XL_row_object);
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

  // const handleUpload = async (e) => {
  //   if (file) {
  //     const formData = new FormData();
  //     formData.append("file", file);

  //     function getExtension() {
  //       return file.name.split('.').pop().toLowerCase();
  //     }

  //     if (getExtension() === "xls" || getExtension() === "xlsx") {
  //       try {
  //         const result = await fetch("https://localhost:44300/upload", {
  //           method: "POST",
  //           body: formData,
  //           success: function (fileData) {
  //             alert(fileData)
  //           },
  //         });

  //         // Download file
  //         // const data = await result.json();
  //         // console.log("Data:" + data);

  //         // Read the content of the file using FileReader
  //         const reader = new FileReader();

  //         reader.onload = (event) => {
  //           // Set the file content to state
  //           setFileContent(event.target.result);
  //         };

  //         // Start reading the file as text
  //         reader.readAsText(file);

  //         // Set the file to state if needed for further processing
  //         setFile(file);
  //         // console.log("setFile is" + file);
  //         // console.log(setFile());

  //         const excelJSON = JSON.stringify(file);
  //         console.log(typeof (excelJSON));

  //         let xl2json = new ExcelToJSON();
  //         console.log(typeof (xl2json));
  //         let excelArray = xl2json.parseExcel(file);
  //         console.log(typeof (file));

  //         // let excelObject = excelArray.reduce(function (o, val) { o[val] = val; return o; }, {});
  //         // console.log(JSON.stringify(excelObject));
  //       }
  //       catch (error) {
  //         console.error("Lỗi: " + error);
  //       }
  //     } else {
  //       console.error("Chỉ cho phép nhập dữ liệu từ file Excel (*.xls, *.xlsx)")
  //     }
  //   } else {
  //     console.error("Bạn chưa lựa chọn file excel!")
  //   }
  // };

  const onSaving = React.useCallback((e) => {
    e.cancel = true;

    if (e.changes.length) {
      e.promise = processBatchRequest(`${URL}/Batch`, e.changes, e.component);
    }
  }, []);

  const [selectedItemKeys, setSelectedItemKeys] = useState([]);

  const onSelectionChanged = useCallback((data) => {
    setSelectedItemKeys(data.selectedRowKeys);
  }, []);

  const dataGridRef = useRef(null);
  const refreshDataGrid = useCallback(() => {
    dataGridRef.current.instance.refresh();
  }, []);

  const settingsButtonOptions = {
    icon: 'preferences',
    text: 'Settings',
  }

  const renderLabel = () => <div className="toolbar-label">1.1. Quản lý thu phí</div>;

  const [isPopupVisible, setPopupVisibility] = useState(false);

  const togglePopup = () => {
    setPopupVisibility(!isPopupVisible);
  };

  return (
    <React.Fragment>
      <h2 className={'content-block'}>Demo Data Grid</h2>

      <div className={'content-block'}>
        <div onSelect={onSelected} onClick={onDelete} className={'dx-card responsive-paddings'}>

          <DataGrid
            id="gridContainer"
            ref={dataGridRef}
            dataSource={ordersStore}
            showBorders={true}
            remoteOperations={true}
            repaintChangesOnly={true}
            onSaving={onSaving}
            onSelectionChanged={onSelectionChanged}
          >

            <Column dataField="STT" width={60} allowEditing={false}></Column>
            <Column dataField="OrderID" width={100} allowEditing={false}></Column>
            <Column dataField="ShipName"></Column>
            <Column dataField="ShipCountry"></Column>
            <Column dataField="ShipCity"></Column>
            <Column dataField="ShipAddress"></Column>
            <Column dataField="OrderDate" dataType="date"></Column>
            <Column dataField="Freight"></Column>

            {/* <Editing
              mode="batch"
              location="center"
              locateInMenu="auto"
              allowAdding={true}
              allowDeleting={true}
              allowUpdating={true}
            /> */}
            <Selection mode="multiple" />
            <Toolbar>
              <Item
                location="left"
                locateInMenu="never"
                render={renderLabel}
              />

              <Item location="after" widget="dxButton" >
                <Button text="Nhập từ excel" onClick={togglePopup} />
              </Item>

              <Item
                location="after"
                name="columnChooserButton"
              />
            </Toolbar>




          </DataGrid>

          <Popup
            id="popup"
            showTitle={true}
            title="Nhập từ excel"
            contentRender={renderContent}
            visible={isPopupVisible}
            hideOnOutsideClick={true}
            showCloseButton={true}
            onHiding={togglePopup}
            width={1000}
            height={500}
            position="center"
            dragEnabled={false}
            resizeEnabled={false}
          />

        </div>
      </div>
    </React.Fragment>
  );
}

export default DemoDataGrid;