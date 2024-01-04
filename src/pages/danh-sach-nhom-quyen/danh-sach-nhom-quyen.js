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

import { baseURL } from "../../api/api";

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

let api_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOZ3VvaUR1bmdJZCI6IjEiLCJNQV9IVVlFTiI6IjAwMSIsIk1BX1RJTkgiOiIwMSIsIk1BX1hBIjoiMDAwMDciLCJuYmYiOjE3MDM4MjA5NDksImV4cCI6MTc2MzgyMDg4OSwiaWF0IjoxNzAzODIwOTQ5LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjQ0MzAwIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo0NDMwMCJ9.m-PSJWciAyy9VwezqvX6A2RFqe9WiEiST8htiMeTHYQ";

const config = {
  headers: { Authorization: `Bearer ${api_token}` }
};

const DanhSachNhomQuyenPage = () => {
  const dataGridRef = useRef(null);
  const allowedPageSizes = [50, 100, 150, 200];
  const exportFormats = ['xlsx', 'pdf'];

  const [currentPageIndex, setCurrentPageIndex] = useState(0);


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

          // Assuming the API response is an array of objects
        } catch (error) {
          console.error("Error fetching data:", error);
          return [];
        }
      },
      // update: async (key, values) => {
      //   try {
      //     const response = await fetch(
      //       `${baseURL}/Manager/Menu/UpdateMenu/${key}`,
      //       {
      //         method: "POST",
      //         headers: {
      //           "Content-Type": "application/json",
      //         },
      //         body: JSON.stringify(values),
      //       }
      //     );

      //     if (!response.ok) {
      //       throw new Error(`HTTP error! Status: ${response.status}`);
      //     }

      //     const updatedData = await response.json();
      //     // Return the updated data if needed
      //     return updatedData;
      //   } catch (error) {
      //     console.error("Error updating data:", error);
      //     throw error;
      //   }
      // },
      // remove: async (key) => {
      //   try {
      //     const response = await fetch(
      //       `${baseURL}/Manager/Menu/DeleteMenu/${key}`,
      //       {
      //         method: "DELETE",
      //         headers: {
      //           "Content-Type": "application/json",
      //         },
      //       }
      //     );

      //     if (!response.ok) {
      //       throw new Error(`HTTP error! Status: ${response.status}`);
      //     }

      //     const deletedData = await response.json();
      //     return deletedData; // Return the deleted data if needed
      //   } catch (error) {
      //     console.error("Error deleting data:", error);
      //     throw error;
      //   }
      // },
    })
  );

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
          // selectedRowKeys={selectedItemKeys}
          // onSelectionChanged={onSelectionChanged}
          onPageChanged={onPageChanged}
        >

          <Editing
            mode="row"
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

          <Column caption="Tên"
            dataField="MenuName"
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
            headerCellTemplate="Tên"
          >
            <StringLengthRule max={3} message="" />
          </Column>

          <Column caption="Đường dẫn"
            dataField="Link"
            fixed={false}
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
            headerCellTemplate="Đường dẫn"
          >
            <StringLengthRule max={3} message="" />
          </Column>

          <Grouping autoExpandAll={false} />
          <ColumnFixing enabled={false} />
          <Selection mode="multiple" />
          <FilterRow visible={false} allowFiltering={false} showResetValues={false} />
          <HeaderFilter enabled={false} visible={false} />
          <GroupPanel visible={false} />
          <Export enabled={true} formats={exportFormats} allowExportSelectedData={true} />
          <Paging enabled={true} defaultPageSize={50} defaultPageIndex={0} />
          <Pager showPageSizeSelector={true} allowedPageSizes={allowedPageSizes} />

        </DataGrid>



      </div>
    </>
  );
};

export default DanhSachNhomQuyenPage;