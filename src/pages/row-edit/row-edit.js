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
  HttpParams,
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
import { confirm } from 'devextreme/ui/dialog';

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

const RowEdit = () => {
  const dataGridRef = useRef(null);
  const allowedPageSizes = [20, 50, 100, 150, 200];
  const exportFormats = ['xlsx', 'pdf'];

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isEditAllPopupVisible, setEditAllPopupVisibility] = useState(false);
  const [isPopupVisible, setPopupVisibility] = useState(false);
  const [isImportExcelPopupVisible, setImportExcelPopupVisibility] = useState(false);
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);
  const [editedItemKeys, setEditedItemKeys] = useState([]);


  const [uploadMode, setUploadMode] = useState('instantly');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedData, setUploadedData] = useState(null);

  const [editedMenuName, setEditedMenuName] = useState('');
  const [editedLink, setEditedLink] = useState('');

  const [editedValues, setEditedValues] = useState({});
  const [editedRows, setEditedRows] = useState([]);
  const [editedColumns, setEditedColumns] = useState([]);

  const formElement = useRef(null);

  const [events, setEvents] = useState([]);

  const logEvent = useCallback((e) => {
    console.log(e);
    // setEvents((previousEvents) => [e, ...previousEvents]);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

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
    })
  );

  const onSelectionChanged = useCallback((data) => {
    setSelectedItemKeys(data.selectedRowKeys);

    setEditedValues({});
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

  const toggleEditAllPopup = useCallback(() => {
    setEditAllPopupVisibility(!isEditAllPopupVisible);
  }, [isEditAllPopupVisible]);

  const togglePopup = useCallback(() => {
    setPopupVisibility(!isPopupVisible);
  }, [isPopupVisible]);

  const toggleImportExcelPopup = useCallback(() => {
    setImportExcelPopupVisibility(!isImportExcelPopupVisible);
  }, [isImportExcelPopupVisible]);

  const refreshDataGrid = useCallback(() => {
    dataGridRef.current.instance.refresh();
  }, []);

  // const onEditValueChanged = useCallback((e) => {
  //   // Update the corresponding state variable based on the edited column
  //   const key = `${e.data.MenuId}-${e.column.dataField}`;
  //   setEditedValues((prevValues) => ({
  //     ...prevValues,
  //     [key]: e.value,
  //   }));
  // }, []);

  const onEditValueChanged = useCallback((e) => {
    const { MenuId } = e.data;
    const columnName = e.column.dataField;
    // const key = `${MenuId}-${columnName}`;
    const { key, value } = e;

    setEditedValues((prevValues) => ({
      ...prevValues,
      [key]: e.value,
    }));

    // Track the edited row
    // if (!editedRows.includes(MenuId)) {
    //   setEditedRows([...editedRows, MenuId]);
    // }

    // Track the edited column
    // if (!editedColumns.includes(columnName)) {
    //   setEditedColumns([...editedColumns, columnName]);
    // }
    console.log(`Edited row: ${MenuId}, Column: ${columnName}, Value: ${e.value}`);
  }, []);

  const editOrAddRecords = useCallback(
    async (key, values) => {
      try {
        const updatedData = await dataSource.load();

        // const updatedItems = updatedData.map((item) => {
        //   const keyMenuName = `${item.MenuId}-MenuName`;
        //   const keyLink = `${item.MenuId}-Link`;

        //   if (
        //     editedItemKeys.includes(item.MenuId) &&
        //     (editedValues[keyMenuName] !== undefined || editedValues[keyLink] !== undefined)
        //   ) {
        //     return {
        //       ...item,
        //       MenuName: editedValues[keyMenuName] !== undefined ? editedValues[keyMenuName] : item.MenuName,
        //       Link: editedValues[keyLink] !== undefined ? editedValues[keyLink] : item.Link,
        //     };
        //   }
        //   return item;
        // });

        // const updatedItems = updatedData.map((item) => {
        //   const keyMenuName = `${item.MenuId}-MenuName`;
        //   const keyLink = `${item.MenuId}-Link`;

        //   console.log(keyMenuName, keyLink)

        //   if (editedRows.includes(item.MenuId)) {
        //     return {
        //       ...item,
        //       MenuName: editedValues[keyMenuName] !== undefined ? editedValues[keyMenuName] : item.MenuName,
        //       Link: editedValues[keyLink] !== undefined ? editedValues[keyLink] : item.Link,
        //     };
        //   }
        //   return item;
        // });

        const updatedItems = updatedData.map((item) => {
          const keyMenuName = `${item.MenuId}-MenuName`;
          const keyLink = `${item.MenuId}-Link`;

          if (
            editedRows.includes(item.MenuId) &&
            (editedValues[keyMenuName] || editedValues[keyLink])

          ) {
            return {
              ...item,
              MenuName: editedValues[keyMenuName] ? editedValues[keyMenuName] : item.MenuName,
              Link: editedValues[keyLink] ? editedValues[keyLink] : item.Link,
            };
          }
          return item;
        });
        // console.log("Edited Columns and Values:", editedColumns.map(column => ({ column, value: editedValues[column] })));

        // Check if add or update
        // const addResponse = await axios.post(
        //   `${baseURL}/Manager/Menu/UpdateMenu`,
        //   updatedItems,
        //   {
        //     headers: {
        //       'Content-Type': 'application/json',
        //       Authorization: `Bearer ${api_token}`,
        //     },
        //   }
        // );

        const updateResponse = await axios.post(
          `${baseURL}/Manager/Menu/UpdateMenu`,
          updatedItems,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${api_token}`,
            },
          }
        );

        if (updateResponse.data.Success) {
          toggleEditAllPopup();
          refreshDataGrid();

          // Reset the state variables after the update operation
          setEditedValues({});
          setEditedRows([]);
          setEditedColumns([]);
        } else {
          console.error(`Error deleting items. ErrorCode:
          ${updateResponse.data.ErrorCode}, ErrorMessage: ${updateResponse.data.ErrorMessage}`);
        }
      } catch (error) {
        console.error("Xảy ra lỗi khi cập nhật dữ liệu: - ", error);
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
      }
    }, [toggleEditAllPopup, refreshDataGrid, dataSource, editedValues, editedRows]);

  const getEditAllButtonOptions = useCallback(() => ({
    text: 'Đồng ý',
    stylingMode: 'contained',
    onClick: editOrAddRecords,
  }), [editOrAddRecords]);

  const getEditAllCloseButtonOptions = useCallback(() => ({
    text: 'Đóng',
    stylingMode: 'outlined',
    type: 'normal',
    onClick: toggleEditAllPopup,
  }), [toggleEditAllPopup]);

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



  async function sendBatchRequest(url, changes) {
    const result = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(changes),
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        //'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${api_token}`,
      },
      credentials: 'include',
    });

    if (!result.ok) {
      throw new Error(`HTTP error! Status: ${result.status}`);
      // throw result.Message;
    }

    const data = await result.json();
    return data.Data;
  }

  async function processBatchRequest(url, changes, component) {
    await sendBatchRequest(url, changes);
    await component.refresh(true);

    component.cancelEditData();
  }

  const onSaving = (e) => {
    e.cancel = true;

    if (e.changes.length) {
      const addedRows = e.changes.filter(change => change.type === 'insert');
      const updatedRows = e.changes.filter(change => change.type === 'update');

      const handleAddedRows = (changes) => {
        const changesWithData = changes.map(change => {
          // For added rows, you may want to handle the default values or other logic
          // For example, here, I'm setting MenuId to 0 and using the current timestamp as order
          return {
            ...change.data,
            MenuId: 0,
            order: new Date().getTime().toString(),
          };
        });

        // Send the changes to the server
        return processBatchRequest(`${baseURL}/Manager/Menu/AddMenu`, changesWithData, e.component);
      };

      const handleUpdatedRows = (changes) => {
        const changesWithData = changes.map(change => {
          const changedData = {
            ...change.data,
            MenuId: change.key,
          };

          // Get the current item from the data source
          const currentItem = e.component.getDataSource().items().find(item => item.MenuId === changedData.MenuId);

          // Include all current values in the request body
          Object.keys(currentItem).forEach(key => {
            if (!(key in changedData)) {
              changedData[key] = currentItem[key];
            }
          });

          return changedData;
        });

        // Send the changes to the server
        return processBatchRequest(`${baseURL}/Manager/Menu/UpdateMenu`, changesWithData, e.component);
      };

      // Process added rows
      if (addedRows.length) {
        handleAddedRows(addedRows);
      }

      // Process updated rows
      if (updatedRows.length) {
        handleUpdatedRows(updatedRows);
      }
    }
  };

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
          key="ID"
          showBorders={true}
          focusedRowEnabled={true}
          repaintChangesOnly={true}
          allowColumnReordering={false}
          remoteOperations={false}
          onExporting={onExporting}
          selectedRowKeys={selectedItemKeys}
          onSelectionChanged={onSelectionChanged}
          onPageChanged={onPageChanged}
          onEditValueChanged={onEditValueChanged}

          onEditingStart={logEvent}
          // onInitNewRow={logEvent}
          // onRowInserting={logEvent}
          // onRowInserted={logEvent}
          // onRowUpdating={logEvent}
          onRowUpdating={logEvent}
          onRowUpdated={logEvent}
          // onRowRemoving={logEvent}
          // onRowRemoved={logEvent}
          onSaving={onSaving}
          onSaved={() => logEvent('Saved')}
        // onEditCanceling={logEvent}
        // onEditCanceled={logEvent}
        >
          <Editing mode="batch"
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
            // onEditorPreparing={(e) => e.editorOptions.onValueChanged = onEditValueChanged}
            onEditorPreparing={(e) => {
              e.editorOptions.onValueChanged = (args) => {
                onEditValueChanged({
                  key: `${e.data.MenuId}-MenuName`,
                  value: args.value,
                });
              };
            }}
          >
            <StringLengthRule min={1} message="Toi thieu 1 ky tu" />
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
            // onEditorPreparing={(e) => e.editorOptions.onValueChanged = onEditValueChanged}
            onEditorPreparing={(e) => {
              e.editorOptions.onValueChanged = (args) => {
                onEditValueChanged({
                  key: `${e.data.MenuId}-Link`,
                  value: args.value,
                });
              };
            }}
          >
          </Column>

          <Toolbar>
            <Item location="left" locateInMenu="never" render={renderLabel} />

            <Item location="after" name="addRowButton" caption="Thêm" >
            </Item>

            <Item location="after" name="saveButton" showText="always" widget="dxButton"></Item>
            <Item location="after" name="revertButton" showText="always" widget="dxButton"></Item>

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

        {/* Update all confirm popup */}
        <Popup
          id="popup"
          visible={isEditAllPopupVisible}
          hideOnOutsideClick={true}
          onHiding={toggleEditAllPopup}
          dragEnabled={false}
          showCloseButton={true}
          showTitle={true}
          title="Thông báo"
          container=".dx-viewport"
          width={500}
          height={300}
        >
          <div className="">
            <div className='warning-icon'>
              <img src={WarningIcon} alt='icon-canh-bao' />
            </div>
            <p>Bạn có chắc chắn là muốn thực hiện thao tác này!</p>
          </div>

          <ToolbarItem
            widget="dxButton"
            toolbar="bottom"
            location="center"
            options={getEditAllButtonOptions()}
          />
          <ToolbarItem
            widget="dxButton"
            toolbar="bottom"
            location="center"
            options={getEditAllCloseButtonOptions()}
          />
        </Popup>

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

export default RowEdit;