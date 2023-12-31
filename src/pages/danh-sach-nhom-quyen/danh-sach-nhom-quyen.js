import React, { useCallback, useState, useRef } from "react";
import {
  Column,
  DataGrid,
  FilterRow,
  HeaderFilter,
  GroupPanel,
  Editing,
  Grouping,
  Paging,
  Pager,
  SearchPanel,
  Summary,
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
  RemoteOperations
} from 'devextreme-react/data-grid';
import { Popup, Position, ToolbarItem } from 'devextreme-react/popup';
import FileUploader, { FileUploaderTypes } from 'devextreme-react/file-uploader';
import { Button } from "devextreme-react/button";
import { SelectBox, SelectBoxTypes } from "devextreme-react/select-box";
import CustomStore from "devextreme/data/custom_store";
import notify from 'devextreme/ui/notify';
import WarningIcon from "../../asset/image/confirm.png";
import axios, { isCancel, AxiosError } from 'axios';


import { baseURL, localApi } from "../../api/api";

// Export to excel library
import { exportDataGrid as exportDataGridToExcel } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

// Read excel file library
import readXlsxFile from 'read-excel-file';

// Export to pdf library
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { jsPDF } from "jspdf";
// Default export is a4 paper, portrait, using millimeters for units

import * as XLSX from "xlsx";
import * as JSZIP from "jszip";
import $ from 'jquery';
import { formatDate } from 'devextreme/localization';

//

const renderLabel = () => <div className="toolbar-label">Danh sách nhóm quyền</div>;
$('.dx-datagrid-addrow-button .dx-button-text').text('Thêm');
const fileExtensions = ['.xls', '.xlsx'];

// const uploadUrl = "https://localhost:44300/upload";
const uploadUrl = "https://js.devexpress.com/Demos/NetCore/FileUploader/Upload";
let api_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOZ3VvaUR1bmdJZCI6IjEiLCJNQV9IVVlFTiI6IjAwMSIsIk1BX1RJTkgiOiIwMSIsIk1BX1hBIjoiMDAwMDciLCJuYmYiOjE3MDM4MjA5NDksImV4cCI6MTc2MzgyMDg4OSwiaWF0IjoxNzAzODIwOTQ5LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjQ0MzAwIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo0NDMwMCJ9.m-PSJWciAyy9VwezqvX6A2RFqe9WiEiST8htiMeTHYQ";

const config = {
  headers: {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${api_token}`,
  }
};

const renderContent = () => {
  return (
    <>
      <div className='warning-icon'>
        <img src={WarningIcon} alt='icon-canh-bao' />
      </div>
      <p>Bạn có chắc chắn là muốn thực hiện thao tác này!</p>
    </>
  )
}

const DanhSachNhomQuyenPage = () => {
  const dataGridRef = useRef(null);
  const allowedPageSizes = [20, 50, 100, 150, 200];
  const exportFormats = ['xlsx', 'pdf'];

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPopupVisible, setPopupVisibility] = useState(false);
  const [isImportExcelPopupVisible, setImportExcelPopupVisibility] = useState(false);
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);

  const [uploadMode, setUploadMode] = useState('instantly');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedData, setUploadedData] = useState(null);

  const formElement = useRef(null);

  const [dataSource, setDataSource] = useState(
    new CustomStore({
      key: "MenuId",
      load: async () => {
        try {
          const response = await fetch(
            `${baseURL}/Manager/Menu`,
            config
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          return data.Data;
        } catch (error) {
          console.error("Error fetching data:", error);
          return [];
        }
      },
      insert: async (values) => {
        try {
          const response = await fetch(
            `${baseURL}/Manager/Menu/AddMenu`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${api_token}`,
              },
              body: JSON.stringify([values]),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const insertedData = await response.json();

          if (insertedData.Success) {
            console.log("Insertion successful:", insertedData);
            return insertedData;
          } else {
            console.error(`Error inserting item. ErrorCode: ${insertedData.ErrorCode}, ErrorMessage: ${insertedData.ErrorMessage}`);
            throw new Error("Insertion failed");
          }
        } catch (error) {
          console.error("Error inserting data:", error);
          throw error;
        }
      },
      update: async (key, values) => {
        try {
          const requestBody = {
            MenuId: key,
            ParentId: values.ParentId,
            MenuCode: values.MenuCode,
            LevelItem: values.LevelItem,
            MenuName: values.MenuName,
            Link: values.Link,
            Order: values.Order,
            IsView: values.IsView,
            Status: values.Status,
            MenuNameEg: values.MenuNameEg,
          };

          const response = await fetch(
            `${baseURL}/Manager/Menu/UpdateMenu`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${api_token}`
              },
              body: JSON.stringify([requestBody]),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const updatedData = await response.json();

          if (updatedData.Success) {
            console.log("Update successful:", updatedData);
            // Additional logic can be added here if needed

            // Return the updated data if needed
            return updatedData;
          } else {
            console.error(`Error updating item. ErrorCode: ${updatedData.ErrorCode}, ErrorMessage: ${updatedData.ErrorMessage}`);
            throw new Error("Update failed");
          }
        } catch (error) {
          console.error("Error updating data:", error);
          throw error;
        }
      }
    })
  );

  const onSelectionChanged = useCallback((data) => {
    setSelectedItemKeys(data.selectedRowKeys);
  }, []);

  const onPageChanged = (e) => {
    setCurrentPageIndex(e.component.pageIndex());
  };

  const rowIndexes = (data) => {
    const pageIndex = data.component.pageIndex();
    const pageSize = data.component.pageSize();
    const rowIndex = pageIndex * pageSize + data.rowIndex + 1;
    return <span> {rowIndex} </span>;
  }

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

  const togglePopup = useCallback(() => {
    setPopupVisibility(!isPopupVisible);
  }, [isPopupVisible]);

  const toggleImportExcelPopup = useCallback(() => {
    setImportExcelPopupVisibility(!isImportExcelPopupVisible);
  }, [isImportExcelPopupVisible]);

  const refreshDataGrid = useCallback(() => {
    dataGridRef.current.instance.refresh();
    console.log("Reloaded")
  }, []);

  const deleteRecords = useCallback(async () => {
    try {
      const response = await axios.delete(
        `${baseURL}/Manager/Menu/DeleteMenu`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${api_token}`,
          },
          data: selectedItemKeys.map(menuId => ({ menuId })),
        }
      );

      if (response.data.Success) {
        togglePopup();
        refreshDataGrid();

        const selectedAndDeletedItems = selectedItemKeys.length;
        const message = `Xóa thành công ${selectedAndDeletedItems} mục`;
        notify(
          {
            message,
            position: {
              my: 'after bottom',
              at: 'after bottom',
            },
          },
          'success',
          3000,
        );
      } else {
        console.error(`Error deleting items. ErrorCode: ${response.data.ErrorCode}, ErrorMessage: ${response.data.ErrorMessage}`);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      notify(
        {
          error,
          position: {
            my: 'after bottom',
            at: 'after bottom',
          },
        },
        `error: ${error.message}`,
        5000,
      );
    } finally {
      setSelectedItemKeys([]);
    }
  }, [selectedItemKeys, togglePopup, refreshDataGrid]);

  const getDeleteButtonOptions = useCallback(() => ({
    text: 'Đồng ý',
    stylingMode: 'contained',
    onClick: deleteRecords,
  }), [deleteRecords]);

  const getCloseButtonOptions = useCallback(() => ({
    text: 'Đóng',
    stylingMode: 'outlined',
    type: 'normal',
    onClick: togglePopup,
  }), [togglePopup]);

  const onSelectedFilesChanged = useCallback((e) => {
    setSelectedFiles(e.value);
    if (e.value.length > 0) {
      handleFileUpload(e.value[0]);
    }
  }, [setSelectedFiles]);

  const handleFileUpload = async (file) => {
    try {
      const data = await readXlsxFile(file);
      setUploadedData(data);
    } catch (error) {
      console.error('Error reading file:', error);
      notify('Error reading file. Please check the file format.');
    }
  };

  const onFormSubmitClick = useCallback(() => {
    formElement.current.submit();
  }, []);

  return (
    <>
      <div className="responsive-paddings">

        <DataGrid
          id="grid-container"
          className='master-detail-grid'
          dataSource={dataSource}
          ref={dataGridRef}
          width="100%"
          height="100%"
          showBorders={true}
          focusedRowEnabled={true}
          repaintChangesOnly={true}
          allowColumnReordering={false}
          remoteOperations={false}
          onExporting={onExporting}
          selectedRowKeys={selectedItemKeys}
          edi
          onSelectionChanged={onSelectionChanged}
          onPageChanged={onPageChanged}
        >
          <Editing mode="popup"
            allowAdding={true}
            allowDeleting={false}
            allowUpdating={true}
          />

          <Column caption="STT"
            dataField="STT"
            fixed={true}
            fixedPosition="left"
            alignment='center'
            width={80}
            allowEditing={false}
            allowSorting={false}
            allowReordering={false}
            allowSearch={false}
            allowFiltering={false}
            allowExporting={true}
            cellRender={rowIndexes}
            headerCellTemplate="STT"
          >
            <StringLengthRule max={3} message="" />
          </Column>

          <Column caption="MenuID"
            dataField="MenuId"
            fixed={true}
            fixedPosition="left"
            alignment='center'
            width={100}
            allowEditing={false}
            allowSorting={false}
            allowReordering={false}
            allowSearch={false}
            allowFiltering={false}
            allowExporting={true}
            headerCellTemplate="MenuID"
          >
            <StringLengthRule max={3} message="" />
          </Column>

          <Column caption="Sửa"
            type="buttons"
            width={80}
            fixed={true}
            fixedPosition="left"
          >
            <Button name="edit" />
          </Column>

          <Column caption="Tên"
            dataField="MenuName"
            fixed={true}
            fixedPosition="left"
            alignment='left'
            width={300}
            allowEditing={true}
            allowSorting={false}
            allowReordering={false}
            allowSearch={false}
            allowFiltering={false}
            allowExporting={true}
            headerCellTemplate="Tên"
          >
          </Column>

          <Column caption="Đường dẫn"
            dataField="Link"
            fixed={false}
            fixedPosition="left"
            alignment='left'
            width={80}
            allowEditing={true}
            allowSorting={false}
            allowReordering={false}
            allowSearch={false}
            allowFiltering={false}
            allowExporting={true}
            headerCellTemplate="Đường dẫn"
          >
          </Column>

          <Toolbar>
            <Item location="left" locateInMenu="never" render={renderLabel} />

            <Item location="after" name="addRowButton" caption="Thêm" />
            <Item location="after" showText="always" name='mutiple-delete' widget="dxButton">
              <Button
                onClick={togglePopup}
                widget="dxButton"
                icon="trash"
                disabled={!selectedItemKeys.length}
                text="Xóa mục đã chọn"
              />
            </Item>

            <Item location="after" widget="dxButton" >
              <Button text="Nhập từ excel" onClick={toggleImportExcelPopup} />
            </Item>

            <Item location='after' name='exportButton' />
          </Toolbar>

          <Grouping autoExpandAll={false} />
          <ColumnFixing enabled={false} />
          <Selection mode="multiple" />
          <FilterRow visible={false} allowFiltering={false} showResetValues={false} />
          <HeaderFilter enabled={false} visible={false} />
          <GroupPanel visible={false} />
          <Export enabled={true} formats={exportFormats} allowExportSelectedData={true} />
          <Paging enabled={true} defaultPageSize={20} defaultPageIndex={0} />
          <Pager showPageSizeSelector={true} allowedPageSizes={allowedPageSizes} />

        </DataGrid>

        {/* Delete confirm popup */}
        <Popup
          id="popup"
          contentRender={renderContent}
          visible={isPopupVisible}
          hideOnOutsideClick={true}
          onHiding={togglePopup}
          dragEnabled={false}
          showCloseButton={true}
          showTitle={true}
          title="Thông báo"
          container=".dx-viewport"
          width={500}
          height={300}
        >
          <ToolbarItem
            widget="dxButton"
            toolbar="bottom"
            location="center"
            options={getDeleteButtonOptions()}
          />
          <ToolbarItem
            widget="dxButton"
            toolbar="bottom"
            location="center"
            options={getCloseButtonOptions()}
          />
        </Popup>

        {/* Upload popup */}
        <Popup
          id="popup"
          showTitle={true}
          title="Nhập từ excel"
          visible={isImportExcelPopupVisible}
          hideOnOutsideClick={false}
          showCloseButton={true}
          onHiding={toggleImportExcelPopup}
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

              <Button className="submit-button" text="Thêm" type="success" onClick={onFormSubmitClick} />
            </form>
          </div>
        </Popup>

      </div>
    </>
  );
};

export default DanhSachNhomQuyenPage;