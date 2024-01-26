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
  RemoteOperations,
  KeyboardNavigation,
} from 'devextreme-react/data-grid';
import { Popup, Position, ToolbarItem } from 'devextreme-react/popup';
import FileUploader, { FileUploaderTypes } from 'devextreme-react/file-uploader';
import CheckBox, { CheckBoxTypes } from 'devextreme-react/check-box';
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
  //#region Property
  const dataGridRef = useRef(null);
  const allowedPageSizes = [20, 50, 100, 150, 200];

  const exportFormats = ['xlsx', 'pdf'];
  const [exportDataFieldHeaders, setExportDataFieldHeaders] = useState(false);
  const [exportRowFieldHeaders, setExportRowFieldHeaders] = useState(false);
  const [exportColumnFieldHeaders, setExportColumnFieldHeaders] = useState(false);
  const [exportFilterFieldHeaders, setExportFilterFieldHeaders] = useState(false);

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
  //#endregion

  const [editOnKeyPress, setEditOnKeyPress] = useState(true);
  const [enterKeyAction, setEnterKeyAction] = useState('startEdit');
  const [enterKeyDirection, setEnterKeyDirection] = useState('row');

  //#region Action
  const logEvent = useCallback((e) => {
    console.log(e);
    // setEvents((previousEvents) => [e, ...previousEvents]);
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
          const ErrorMessage = `Đã xảy ra lỗi khi tải dữ liệu: `;
          notify(
            {
              ErrorMessage,
              position: {
                my: 'bottom right',
                at: 'bottom right',
              },
            },
            `error: ${error.message}`,
            5000,
          );
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

  const onExporting = useCallback(
    (e) => {
      if (e.format === 'xlsx') {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet("Danh sách");

        worksheet.columns = [
          { width: 15 },
          { width: 15 },
          { width: 60 },
          { width: 60 },
        ];

        exportDataGridToExcel({
          component: e.component,
          worksheet,
          autoFilterEnabled: true,
          topLeftCell: { row: 4, column: 1 },
          keepColumnWidths: false,
          exportDataFieldHeaders,
          exportRowFieldHeaders,
          exportColumnFieldHeaders,
          exportFilterFieldHeaders,
        })
          .then((cellRange) => {
            // header
            const headerRow = worksheet.getRow(2);
            headerRow.height = 30;
            worksheet.mergeCells(2, 1, 2, 8);

            headerRow.getCell(1).value = 'Danh sách nhóm quyền';
            headerRow.getCell(1).font = { name: 'Arial', size: 14 };
            headerRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

            // footer
            const footerRowIndex = cellRange.to.row + 2;
            const footerRow = worksheet.getRow(footerRowIndex);
            worksheet.mergeCells(footerRowIndex, 1, footerRowIndex, 8);

            footerRow.getCell(1).value = 'www.wikipedia.org';
            footerRow.getCell(1).font = { color: { argb: 'BFBFBF' }, italic: true };
            footerRow.getCell(1).alignment = { horizontal: 'right' };

            workbook.xlsx.writeBuffer().then((buffer) => {
              saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Danh sách.xlsx');
            });
          })
      }
      else if (e.format === 'pdf') {
        const doc = new jsPDF();

        // doc.addFileToVFS('Roboto-Regular-normal.ttf');
        // doc.addFont('Roboto-Regular-normal.ttf', 'Roboto-Regular', 'normal');
        doc.setFont("Arial");

        const firstPoint = { x: -300, y: -300 };
        const lastPoint = { x: 0, y: 0 };

        exportDataGridToPdf({
          jsPDFDocument: doc,
          component: e.component,
          topLeft: { x: 1, y: 15 },
          columnWidths: [15, 15, 60, 60],

          customDrawCell({ rect }) {
            if (lastPoint.x < rect.x + rect.w) {
              lastPoint.x = rect.x + rect.w;
            }
            if (lastPoint.y < rect.y + rect.h) {
              lastPoint.y = rect.y + rect.h;
            }
          },
        }).then(() => {
          // header
          const header = 'Danh sách';
          const headerWidth = doc.getTextDimensions(header).w;
          // const pageHeight = doc.internal.pageSize.getHeight();
          const pageWidth = doc.internal.pageSize.getWidth();

          doc.setFontSize(10);
          // doc.text(header, (pageWidth - headerWidth) / 2, 20);
          doc.text(header, firstPoint.x - headerWidth, -50);

          // footer
          const footer = 'Demo Footer';
          const footerWidth = doc.getTextDimensions(footer).w;

          doc.setFontSize(9);
          doc.setTextColor('#cccccc');
          doc.text(footer, ((pageWidth - footerWidth) / 2), lastPoint.y + 5);

          doc.save('Danh sách.pdf');
        })
      }
    },
    [
      exportColumnFieldHeaders,
      exportDataFieldHeaders,
      exportFilterFieldHeaders,
      exportRowFieldHeaders
    ]
  )

  const toggleEditAllPopup = useCallback(() => {
    setEditAllPopupVisibility(!isEditAllPopupVisible);

  }, [isEditAllPopupVisible]);

  const toggleDeletePopup = useCallback(() => {
    setPopupVisibility(!isPopupVisible);
  }, [isPopupVisible]);

  const toggleImportExcelPopup = useCallback(() => {
    setImportExcelPopupVisibility(!isImportExcelPopupVisible);
  }, [isImportExcelPopupVisible]);

  const refreshDataGrid = useCallback(() => {
    dataGridRef.current.instance.refresh();
  }, []);

  const onEditValueChanged = useCallback((e) => {
    const { MenuId } = e.data;
    const columnName = e.column.dataField;
    // const key = `${MenuId}-${columnName}`;
    const { key, value } = e;

    setEditedValues((prevValues) => ({
      ...prevValues,
      [key]: e.value,
    }));

    console.log(`Edited row: ${MenuId}, Column: ${columnName}, Value: ${e.value}`);
  }, []);

  const editOrAddRecords = useCallback(
    async (key, values) => {
      try {
        const updatedData = await dataSource.load();

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
              my: 'bottom right',
              at: 'bottom right',
            },
          },
          `error: ${error.message}`,
          5000,
        );
      }
    }, [toggleEditAllPopup, refreshDataGrid, dataSource, editedValues, editedRows]);

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
        toggleDeletePopup();
        refreshDataGrid();

        const selectedAndDeletedItems = selectedItemKeys.length;
        const message = `Xóa thành công ${selectedAndDeletedItems} mục`;
        notify(
          {
            message,
            position: {
              my: 'bottom right',
              at: 'bottom right',
            },
          },
          'success',
          3000,
        );
      } else {
        console.error(`Error deleting items. ErrorCode: ${response.data.ErrorCode}, ErrorMessage: ${response.data.ErrorMessage}`);
      }
    } catch (error) {
      console.error("Đã xảy ra lỗi khi xóa dữ liệu:", error);
      notify(
        {
          error,
          position: {
            my: 'bottom right',
            at: 'bottom right',
          },
        },
        // `error: ${error.message}`,
        `Đã xảy ra lỗi khi xóa dữ liệu.`,
        5000,
      );
    } finally {
      setSelectedItemKeys([]);
    }
  }, [selectedItemKeys, toggleDeletePopup, refreshDataGrid]);

  const getDeleteButtonOptions = useCallback(() => ({
    text: 'Đồng ý',
    stylingMode: 'contained',
    onClick: deleteRecords,
  }), [deleteRecords]);

  const getCloseButtonOptions = useCallback(() => ({
    text: 'Đóng',
    stylingMode: 'outlined',
    type: 'normal',
    onClick: toggleDeletePopup,
  }), [toggleDeletePopup]);

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

  const sendBatchRequest = useCallback(
    async (url, changes) => {
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
        const ErrorMessage = `Đã xảy ra lỗi : `;
        notify(
          {
            ErrorMessage,
            position: {
              my: 'bottom right',
              at: 'bottom right',
            },
          },
          `error`,
          5000,
        );
        throw new Error(`HTTP error! Status: ${result.status}`);
        // throw result.Message;
      }

      const message = `Cập nhật thành công`;
      notify(
        {
          message,
          position: {
            my: 'bottom right',
            at: 'bottom right',
          },
        },
        `success`,
        5000,
      );

      const data = await result.json();
      return data.Data;
    }, []);

  const processBatchRequest = useCallback(
    async (url, changes, component) => {
      await sendBatchRequest(url, changes);
      await component.refresh(true);

      component.cancelEditData();
    }, [sendBatchRequest]);

  const onSaving = useCallback(
    (e) => {
      e.cancel = true;

      if (e.changes.length) {
        const addedRows = e.changes.filter(change => change.type === 'insert');
        const updatedRows = e.changes.filter(change => change.type === 'update');

        const handleAddedRows = (changes) => {
          const changesWithData = changes.map(change => {
            // handle the default values or other logic
            return {
              ...change.data,
              MenuId: 0,
              order: "",
              status: 0,
              IsView: 0,
              MenuNameEg: ""
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
    }, [processBatchRequest]);

  // const onSaving = useCallback(async (e) => {
  //   // e.cancel = true;

  //   if (e.changes && e.changes.length) {
  //     const addedRows = e.changes.filter(change => change.type === 'insert');
  //     const updatedRows = e.changes.filter(change => change.type === 'update');

  //     // Process added rows
  //     if (addedRows.length) {
  //       const changesWithData = addedRows.map(change => {
  //         return {
  //           ...change.data,
  //           MenuId: 0,
  //           order: "",
  //           status: 0,
  //           IsView: 0,
  //           MenuNameEg: ""
  //         };
  //       });

  //       // Send the changes to the server
  //       await processBatchRequest(`${baseURL}/Manager/Menu/AddMenu`, changesWithData, e.component);
  //     }

  //     // Process updated rows
  //     if (updatedRows.length) {
  //       const changesWithData = updatedRows.map(change => {
  //         return {
  //           ...change.data,
  //           MenuId: change.key,
  //         };
  //       });

  //       // Send the changes to the server
  //       await processBatchRequest(`${baseURL}/Manager/Menu/UpdateMenu`, changesWithData, e.component);
  //     }
  //   }
  // }, [processBatchRequest]);

  const getEditAllButtonOptions = useCallback(() => ({
    text: 'Đồng ý',
    stylingMode: 'contained',
    onClick: () => {
      toggleEditAllPopup();

      onSaving();
    },
  }), [toggleEditAllPopup, onSaving]);

  const getEditAllCloseButtonOptions = useCallback(() => ({
    text: 'Đóng',
    stylingMode: 'outlined',
    type: 'normal',
    onClick: toggleEditAllPopup,
  }), [toggleEditAllPopup]);

  const handleUpdate = useCallback(async (updatedData) => {
    try {
      // Ensure that updatedData is an array
      const dataArray = Array.isArray(updatedData) ? updatedData : [updatedData];

      const updateResponse = await axios.post(
        `${baseURL}/Manager/Menu/UpdateMenu`,
        dataArray,
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
        console.error(`Error updating items. ErrorCode: ${updateResponse.data.ErrorCode}, ErrorMessage: ${updateResponse.data.ErrorMessage}`);
      }
    } catch (error) {
      console.error("Xảy ra lỗi khi cập nhật dữ liệu: - ", error);
      notify(
        {
          error,
          position: {
            my: 'bottom right',
            at: 'bottom right',
          },
        },
        `error: ${error.message}`,
        5000,
      );
    }
  }, [toggleEditAllPopup, refreshDataGrid]);

  // const handleConfirmation = useCallback(() => {
  //   confirm(
  //     'Xác nhận',
  //     'Bạn có chắc chắn muốn thực hiện thao tác này?',
  //     'warning'
  //   ).then((result) => {
  //     if (result) {
  //       // Handle updating changed and current values
  //       const updatedData = dataSource.load().then((data) => {
  //         return data.map((item) => {
  //           const changedData = item.data;

  //           if (changedData) {
  //             // Convert data to the desired format
  //             return {
  //               menuId: item.MenuId,
  //               parentId: item.ParentId,
  //               menuCode: changedData.menuCode || item.MenuCode,
  //               levelItem: changedData.levelItem || item.LevelItem,
  //               MenuName: changedData.MenuName || item.MenuName,
  //               icon: changedData.icon || item.Icon,
  //               link: changedData.link || item.Link,
  //               typeHelp: changedData.typeHelp || item.TypeHelp,
  //               desHelp: changedData.desHelp || item.DesHelp,
  //               linkYoutube: changedData.linkYoutube || item.LinkYoutube,
  //               order: changedData.order || item.Order,
  //               isView: changedData.isView || item.IsView,
  //               status: changedData.status || item.Status,
  //               menuNameEg: changedData.menuNameEg || item.MenuNameEg,
  //             };
  //           }

  //           return item;
  //         });
  //       });

  //       // await this if it's asynchronous
  //       handleUpdate(updatedData);

  const handleConfirmation = useCallback(() => {
    confirm(
      'Xác nhận',
      'Bạn có chắc chắn muốn thực hiện thao tác này?',
      'warning'
    ).then(async (result) => {
      if (result) {
        try {
          // const updatedData = dataSource.load().then((data) => {
          //   return data.map((item) => {
          //     const changedData = item.data;
          //     console.log(item.MenuName + "c")

          //     if (changedData) {
          //     Convert data to the desired format
          //     return {
          //       menuId: item.MenuId,
          //       parentId: item.ParentId,
          //       MenuName: changedData.MenuName || item.menuName,
          //       menuCode: changedData.menuCode || item.MenuCode,
          //       levelItem: changedData.levelItem || item.LevelItem,

          //       icon: changedData.icon || item.Icon,
          //       link: changedData.link || item.Link,
          //       typeHelp: changedData.typeHelp || item.TypeHelp,
          //       desHelp: changedData.desHelp || item.DesHelp,
          //       linkYoutube: changedData.linkYoutube || item.LinkYoutube,
          //       order: changedData.order || item.Order,
          //       isView: changedData.isView || item.IsView,
          //       status: changedData.status || item.Status,
          //       menuNameEg: changedData.menuNameEg || item.MenuNameEg,
          //     };
          //     }

          //     return item;
          //   });
          // });

          // Handle updating changed and current values
          const data = await dataSource.load();
          const updatedData = data.map((item) => {

            // const changedData = item.data || {};
            const changedData = {
              ...item.data,
              MenuId: item.key,
            };

            // console.log(changedData.Data.menuName + "c")
            console.log(changedData)
            console.log(item.MenuId)

            // return {
            //   menuId: item.MenuId,
            //   parentId: item.ParentId,
            //   menuCode: changedData.menuCode || item.MenuCode,
            //   levelItem: changedData.levelItem || item.LevelItem,
            //   MenuName: changedData.MenuName || item.MenuName,
            //   icon: changedData.icon || item.Icon,
            //   link: changedData.link || item.Link,
            //   typeHelp: changedData.typeHelp || item.TypeHelp,
            //   desHelp: changedData.desHelp || item.DesHelp,
            //   linkYoutube: changedData.linkYoutube || item.LinkYoutube,
            //   order: changedData.order || item.Order,
            //   isView: changedData.isView || item.IsView,
            //   status: changedData.status || item.Status,
            //   menuNameEg: changedData.menuNameEg || item.MenuNameEg,
            // };
          });

          console.log(updatedData + "updateData")

          // Call your custom update function or modify as needed
          // await handleUpdate(updatedData);
        } catch (error) {
          console.error("Xảy ra lỗi khi cập nhật dữ liệu: - ", error);
          notify(
            {
              error,
              position: {
                my: 'bottom right',
                at: 'bottom right',
              },
            },
            `error: ${error.message}`,
            5000
          );
        }
      }
    });
  }, [dataSource]);
  //#endregion

  const onFocusedCellChanging = (e) => {
    e.isHighlighted = true;
  };

  const onKeyDown = (e) => {
    if (e.event.keyCode === 37 || e.event.keyCode === 39) {
      e.event.preventDefault();
      e.event.stopImmediatePropagation();
      console.log("pressed")
    } else {
      console.log("not-pressed")
    }
  }

  const editOnKeyPressChanged = useCallback((e) => {
    setEditOnKeyPress();
  }, []);

  const enterKeyActionChanged = useCallback((e) => {
    setEnterKeyAction();
  }, []);

  const enterKeyDirectionChanged = useCallback((e) => {
    setEnterKeyDirection();
  }, []);

  const onFocusedRowChanging = (e) => {
    var rowsCount = e.component.getVisibleRows().length,
      pageCount = e.component.pageCount(),
      pageIndex = e.component.pageIndex(),
      key = e.event && e.event.key;

    if (key && e.prevRowIndex === e.newRowIndex) {
      if (e.newRowIndex === rowsCount - 1 && pageIndex < pageCount - 1) {
        e.component.pageIndex(pageIndex + 1).done(function () {
          e.component.option("focusedRowIndex", 0);
        });
      } else if (e.newRowIndex === 0 && pageIndex > 0) {
        e.component.pageIndex(pageIndex - 1).done(function () {
          e.component.option("focusedRowIndex", rowsCount - 1);
        });
      }
    }
  }

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
          onSaving={onSaving}
          onFocusedCellChanging={onFocusedCellChanging}
          onFocusedRowChanging={onFocusedRowChanging}
          focusedRowIndex={0} //{/* focus the first row */}
          focusedColumnIndex={0} //{/* focus the first cell */}
          onKeyDown={onKeyDown}
        >
          <KeyboardNavigation
            editOnKeyPress={editOnKeyPress}
            editOnKeyPressChanged={editOnKeyPressChanged}
            enterKeyAction={enterKeyAction}
            enterKeyActionChanged={enterKeyActionChanged}
            enterKeyDirection={enterKeyDirection}
            enterKeyDirectionChanged={enterKeyDirectionChanged}
            onKeyDown={onKeyDown}
          />

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
            allowSorting={true}
            allowReordering={false}
            allowSearch={false}
            allowFiltering={false}
            allowExporting={true}
            cellRender={rowIndexes}
            headerCellTemplate="STT"
            all
          >
          </Column>

          <Column caption="MenuID"
            dataField="MenuId"
            fixed={true}
            fixedPosition="left"
            alignment='center'
            width={100}
            hidingPriority={2}
            allowEditing={false}
            allowSorting={true}
            allowReordering={false}
            allowSearch={false}
            allowFiltering={false}
            allowExporting={true}
            headerCellTemplate="MenuID"
          >
          </Column>

          <Column caption="Tên"
            dataField="MenuName"
            fixed={true}
            fixedPosition="left"
            alignment='left'
            width={300}
            allowEditing={true}
            allowSorting={true}
            allowReordering={false}
            allowSearch={false}
            allowFiltering={false}
            allowExporting={true}
            headerCellTemplate="Tên"
            onEditorPreparing={(e) => {
              e.editorOptions.onValueChanged = (args) => {
                onEditValueChanged({
                  key: `${e.data.MenuId}-MenuName`,
                  value: args.value,
                });
              };
            }}
          >
            <RequiredRule message="Bạn chưa nhập vào tên" />
            {/* <PatternRule message="Tên thư mục không được để trống" pattern={namePattern} /> */}
            <StringLengthRule message="Tên thư mục phải chứa tối thiểu 2 ký tự" min={2} max={50} />
          </Column>

          <Column caption="Đường dẫn"
            dataField="Link"
            fixed={false}
            fixedPosition="left"
            alignment='left'
            width={80}
            hidingPriority={1}
            allowEditing={true}
            allowSorting={true}
            allowReordering={false}
            allowSearch={false}
            allowFiltering={false}
            allowExporting={true}
            headerCellTemplate="Đường dẫn"
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
            <Item
              location="left"
              locateInMenu="never"
              render={renderLabel}
            />

            <Item location="after"
              name="addRowButton"
              caption="Thêm"
              options={addButtonOptions}
              locateInMenu="auto"
            />

            <Item
              location="after"
              name="saveButton"
              showText="always"
              widget="dxButton"
              options={saveButtonOptions}
              locateInMenu="never"
            />

            {/* <Item location="after" name="saveButton" showText="always" widget="dxButton" options={saveButtonOptions} locateInMenu="never">
              <Button
                onClick={toggleEditAllPopup}
                widget="dxButton"
                text="Ghi"
              />
            </Item> */}

            {/* <Item
              widget="dxButton"
              location="after"
              options={{
                text: 'Xác nhận',
                onClick: () => handleConfirmation(),
              }}
            /> */}

            <Item
              location="after"
              name="revertButton"
              showText="always"
              widget="dxButton"
              options={cancelButtonOptions}
              locateInMenu="never"
            />

            <Item
              location="after"
              showText="always"
              name='mutiple-delete'
              widget="dxButton"
              locateInMenu="never">
              <Button
                onClick={toggleDeletePopup}
                widget="dxButton"
                icon="trash"
                disabled={!selectedItemKeys.length}
                text="Xóa mục đã chọn"
              />
            </Item>

            <Item location="after" widget="dxButton" locateInMenu="auto">
              <Button text="Nhập từ excel" onClick={toggleImportExcelPopup} />
            </Item>

            <Item location='after' name='exportButton' options={exportButtonOptions} locateInMenu="auto" />
          </Toolbar>

          <Grouping autoExpandAll={false} />
          <ColumnFixing enabled={false} />
          <Selection mode="multiple" />
          <FilterRow visible={false} allowFiltering={false} showResetValues={false} />
          <HeaderFilter enabled={false} visible={false} />
          <GroupPanel visible={false} />
          <Export enabled={true} formats={exportFormats} allowExportSelectedData={true} />
          <Paging enabled={true} defaultPageSize={20} defaultPageIndex={0} />
          <Pager allowedPageSizes={allowedPageSizes} showPageSizeSelector={true} showNavigationButtons={true} displayMode="compact" />
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
            <p>Bạn có chắc chắn là muốn thực hiện thao tác này !!!</p>
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
          onHiding={toggleDeletePopup}
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

const addButtonOptions = {
  text: 'Thêm'
};

const saveButtonOptions = {
  text: 'Ghi'
};

const cancelButtonOptions = {
  text: 'Hủy thay đổi'
};

const exportButtonOptions = {
  text: 'Xuất file'
};