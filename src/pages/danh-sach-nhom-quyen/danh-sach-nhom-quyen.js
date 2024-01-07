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
} from 'devextreme-react/data-grid';
import { Popup, Position, ToolbarItem } from 'devextreme-react/popup';
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

// Export to pdf library
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { jsPDF } from "jspdf";
// Default export is a4 paper, portrait, using millimeters for units

import * as XLSX from "xlsx";
import * as JSZIP from "jszip";
import $ from 'jquery';
import { formatDate } from 'devextreme/localization';

//
let api_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOZ3VvaUR1bmdJZCI6IjEiLCJNQV9IVVlFTiI6IjAwMSIsIk1BX1RJTkgiOiIwMSIsIk1BX1hBIjoiMDAwMDciLCJuYmYiOjE3MDM4MjA5NDksImV4cCI6MTc2MzgyMDg4OSwiaWF0IjoxNzAzODIwOTQ5LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjQ0MzAwIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo0NDMwMCJ9.m-PSJWciAyy9VwezqvX6A2RFqe9WiEiST8htiMeTHYQ";
const renderLabel = () => <div className="toolbar-label">1.1. Quản lý thu phí</div>;
$('.dx-datagrid-addrow-button .dx-button-text').text('Thêm');

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
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);

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
            menuId: key,
            parentId: values.parentId,
            menuCode: values.menuCode,
            levelItem: values.levelItem,
            MenuName: values.MenuName,
            Link: values.Link,
            order: values.order,
            isView: values.isView,
            status: values.status,
            menuNameEg: values.menuNameEg,
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
            // The update was successful
            console.log("Update successful:", updatedData);
            // Additional logic can be added here if needed

            // Return the updated data if needed
            return updatedData;
          } else {
            // Handle the case where the update was not successful
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
        // The deletion was successful
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
        // Handle the case where the deletion was not successful
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

      </div>
    </>
  );
};

export default DanhSachNhomQuyenPage;