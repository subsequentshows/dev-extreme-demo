import React, { useRef, useCallback, useEffect, useState } from 'react';
import DataGrid, { Column, Editing, Paging, Form, Selection, Lookup, LoadPanel, Toolbar, Item, DataGridTypes, FilterRow }
  from 'devextreme-react/data-grid';
import { Popup, Position, ToolbarItem } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import FileUploader, { FileUploaderTypes } from 'devextreme-react/file-uploader';
import TextBox from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import 'whatwg-fetch';
import './demo-data-grid.scss';
import CustomStore from 'devextreme/data/custom_store';

import { jsPDF } from "jspdf";
// Default export is a4 paper, portrait, using millimeters for units

import * as XLSX from "xlsx";
import * as JSZIP from "jszip";
import $ from 'jquery';
import { Modal } from "react-bootstrap-v5";

import readXlsxFile from 'read-excel-file';
import { baseURL } from '../../api/api';

const URL = 'https://js.devexpress.com/Demos/Mvc/api/DataGridBatchUpdateWebApi';

// const uploadUrl = "https://localhost:44300/upload";
const uploadUrl = "https://js.devexpress.com/Demos/NetCore/FileUploader/Upload";

const ordersStore = createStore({
  key: 'ID',
  loadUrl: `${baseURL}/DanhMuc/GetDMPhuongXa`,

  onBeforeSend: (method, ajaxOptions) => {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

const dataSource = new CustomStore({
  key: 'OrderID',
  load: (loadOptions) => {
    return fetch(`${baseURL}/Order`, {
      // method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(handleErrors)
      .then(response => response.json())
      .catch((error) => { throw 'Network error' + error });
  }
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

const fileExtensions = ['.xls', '.xlsx'];

const DemoDataGrid = () => {
  const [multiple, setMultiple] = useState(false);
  const [uploadMode, setUploadMode] = useState('instantly');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedData, setUploadedData] = useState(null);

  const [selectTextOnEditStart, setSelectTextOnEditStart] = useState(true);
  const [startEditAction, setStartEditAction] = useState('click');

  const dataGridRef = useRef(null);
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);
  const [isPopupVisible, setPopupVisibility] = useState(false);

  const formElement = useRef(null);

  const renderLabel = () => <div className="toolbar-label">1.1. Quản lý thu phí</div>;
  $('.dx-datagrid-addrow-button .dx-button-text').text('Thêm');

  const handleFileUpload = async (file) => {
    try {
      const data = await readXlsxFile(file);
      setUploadedData(data);
    } catch (error) {
      console.error('Error reading file:', error);
      notify('Error reading file. Please check the file format.');
    }
  };

  const onSelectedFilesChanged = useCallback((e) => {
    setSelectedFiles(e.value);
    if (e.value.length > 0) {
      handleFileUpload(e.value[0]);
    }
  }, [setSelectedFiles]);

  const onSaving = useCallback((e) => {
    e.cancel = true;

    if (e.changes.length) {
      e.promise = processBatchRequest(`${URL}/Batch`, e.changes, e.component);
    }
  }, []);

  const togglePopup = useCallback(() => {
    setPopupVisibility(!isPopupVisible);
  }, [isPopupVisible]);

  // const onSelectedFilesChanged = useCallback((e) => {
  //   setSelectedFiles(e.value);
  // }, [setSelectedFiles]);

  const onUploadModeChanged = useCallback((e) => {
    setUploadMode(e.value);
  }, [setUploadMode]);



  const onClick = useCallback(() => {
    notify('Uncomment the line to enable sending a form to the server.');
    formElement.current.submit();
  }, []);

  // Edit
  const onSelectTextOnEditStartChanged = useCallback((args) => {
    setSelectTextOnEditStart(args.value);
  }, []);

  const onStartEditActionChanged = useCallback((args) => {
    setStartEditAction(args.value);
  }, []);

  const saveButtonOptions = {
    text: 'Save',
    onClick: () => {
      notify('Save option has been clicked!');
    },
  };

  const buttonOptions = {
    text: 'Ghi'
  };

  return (
    <>
      <div className={'content-block responsive-paddings'}>

        <DataGrid
          id="gridContainer"
          dataSource={dataSource}
          showBorders={true}
          remoteOperations={false}
          repaintChangesOnly={true}
          onSaving={onSaving}
          // onSelectionChanged={onSelectionChanged}
          allowColumnReordering={false}
          focusedRowEnabled={true}
          ref={dataGridRef}
          width="100%"
          height="100%"
          selectedRowKeys={selectedItemKeys}
        >
          <Editing
            mode="batch"
            location="center"
            locateInMenu="auto"
            allowAdding={true}
            allowUpdating={true}
            allowDeleting={false}
            confirmDelete={false}
            selectTextOnEditStart={selectTextOnEditStart}
            startEditAction={startEditAction}
          />

          <Column dataField="STT" width={60} allowEditing={false}></Column>
          <Column dataField="OrderID" width={100} allowEditing={false}></Column>
          <Column dataField="ShipName" ></Column>
          <Column dataField="ShipCountry"></Column>
          <Column dataField="ShipCity"></Column>
          <Column dataField="ShipAddress"></Column>
          <Column dataField="OrderDate" dataType="date"></Column>
          <Column dataField="Freight"></Column>

          <Toolbar>
            <Item location="left" locateInMenu="never" render={renderLabel} />

            <Item location="after" name="addRowButton" />
            <Item location='after' name='saveButton' options={buttonOptions} />

            <Item location="after" widget="dxButton" >
              <Button text="Nhập từ excel" onClick={togglePopup} />
            </Item>

            <Item locateInMenu="auto" widget="dxButton">
              <Button text="Ghi 2" options={saveButtonOptions} />
            </Item>

            <Item location='after' name='exportButton' />
          </Toolbar>
        </DataGrid>

        <Popup
          id="popup"
          showTitle={true}
          title="Nhập từ excel"
          visible={isPopupVisible}
          hideOnOutsideClick={false}
          showCloseButton={true}
          onHiding={togglePopup}
          width={1000}
          height={500}
          position="center"
          dragEnabled={false}
          resizeEnabled={false}
          maxFileSize={2000000}
        >
          <div>
            <FileUploader
              multiple={false}
              // uploadMode="useButtons"
              uploadMode={uploadMode}
              uploadUrl={uploadUrl}
              allowedFileExtensions={fileExtensions}
              onValueChanged={onSelectedFilesChanged}
            />
            <span className="note">{' : '}
              <span>.xls, .xlsx</span>
            </span>
          </div>

          <div className=''>
            <form id="form" ref={formElement} method="post" action="" encType="multipart/form-data">
              <DataGrid
                className='uploaded-data'
                dataSource={uploadedData}
              >

              </DataGrid>

              <Button className="submit-button" text="Thêm" type="success" onClick={onClick} />
            </form>
          </div>
        </Popup>

        <Selection mode="multiple" />
        <FilterRow visible={true} />
      </div>
    </>
  );
}

export default DemoDataGrid;