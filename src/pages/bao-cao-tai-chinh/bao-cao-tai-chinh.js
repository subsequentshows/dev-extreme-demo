import React, { useEffect, useState, useCallback, useRef } from 'react';
import { baseURL } from '../../api/api';
import $ from 'jquery';
import { formatDate, formatNumber } from 'devextreme/localization';
import notify from 'devextreme/ui/notify';
import parse from 'html-react-parser';
import './bao-cao-tai-chinh.scss';

import DataGrid, {
  Paging,
  Pager, Column, Summary,
  TotalItem,
  KeyboardNavigation,
  Editing
} from 'devextreme-react/data-grid';

import CustomStore from "devextreme/data/custom_store";

let api_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOZ3VvaUR1bmdJZCI6IjEiLCJNQV9IVVlFTiI6IjAwMSIsIk1BX1RJTkgiOiIwMSIsIk1BX1hBIjoiMDAwMDciLCJuYmYiOjE3MDM4MjA5NDksImV4cCI6MTc2MzgyMDg4OSwiaWF0IjoxNzAzODIwOTQ5LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjQ0MzAwIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo0NDMwMCJ9.m-PSJWciAyy9VwezqvX6A2RFqe9WiEiST8htiMeTHYQ";

const BaoCaoTaiChinh = () => {
  // #region Properties
  const [dataSource, setDataSource] = useState([]);
  const dataGridRef = useRef(null);

  const [editOnKeyPress, setEditOnKeyPress] = useState(true);
  const [enterKeyAction, setEnterKeyAction] = useState('startEdit');
  const [enterKeyDirection, setEnterKeyDirection] = useState('row');

  // #endregion

  // #region Event
  const customizeDate = (itemInfo) => {
    return `First: ${formatDate(itemInfo.value, "MMM dd, yyyy")}`;
  }

  const customizeText = (itemInfo) => {
    return `${formatNumber(itemInfo.value, "#,###,##0,000")}`;
  }

  const sumText = () => {
    return `Tổng:`;
  }

  const rowIndexes = (data) => {
    const pageIndex = data.component.pageIndex();
    const pageSize = data.component.pageSize();
    const rowIndex = pageIndex * pageSize + data.rowIndex + 1;
    return <span> {rowIndex} </span>;
  }

  const onFocusedCellChanging = (e) => {
    e.isHighlighted = true;
  };

  // Handle when pressing up and down arrow to move between editable row that have allowEditing == true
  const onKeyDown = useCallback((e) => {
    const isUpArrow = e.event.keyCode === 38;
    const isDownArrow = e.event.keyCode === 40;

    // if (e.event.keyCode === 37 || e.event.keyCode === 39) {
    //   e.event.preventDefault();
    //   e.event.stopImmediatePropagation();
    // }
    // else 
    if (isUpArrow || isDownArrow) {
      e.event.preventDefault();
      e.event.stopImmediatePropagation();

      const dataGridInstance = dataGridRef.current.instance;
      const columns = dataGridInstance.getVisibleColumns();

      const currentRowIndex = dataGridInstance.option('focusedRowIndex');
      const visibleRows = dataGridInstance.getVisibleRows();

      const currentRow = visibleRows.find(row => row.rowIndex === currentRowIndex);
      const currentColumnIndex = dataGridInstance.option('focusedColumnIndex');

      if (currentRow) {
        let nextColumnIndex = currentColumnIndex;

        if (isUpArrow) {
          nextColumnIndex = currentColumnIndex - 1;
        } else {
          nextColumnIndex = currentColumnIndex + 1;
        }

        // Find the previous editable cell in the current row
        while (
          nextColumnIndex >= 0 &&
          nextColumnIndex < columns.length &&
          !columns[nextColumnIndex].allowEditing
        ) {
          if (isUpArrow) {
            nextColumnIndex--;
          } else {
            nextColumnIndex++;
          }
        }

        if (nextColumnIndex >= 0 && nextColumnIndex < columns.length) {
          // Edit the previous editable cell in the current row
          dataGridInstance.option('focusedColumnIndex', nextColumnIndex);
          dataGridInstance.editCell(currentRowIndex, nextColumnIndex);

          return;
        } else if (isUpArrow && currentRowIndex > 0) {
          // Move to the previous row
          const previousRowIndex = currentRowIndex - 1;
          dataGridInstance.option('focusedRowIndex', previousRowIndex);
          const newCurrentRow = visibleRows.find(row => row.rowIndex === previousRowIndex);

          // Find the last editable cell in the previous row
          if (newCurrentRow) {
            for (let i = columns.length - 1; i >= 0; i--) {
              if (columns[i].allowEditing) {
                dataGridInstance.option('focusedColumnIndex', i);
                dataGridInstance.editCell(previousRowIndex, i);
                break;
              }
            }
          }
          return;
        }
      }

      // If no editable cell is found in the current row, proceed to the next or previous row
      const nextRowIndex = isUpArrow ? currentRowIndex - 1 : isDownArrow ? currentRowIndex + 1 : currentRowIndex;

      if (nextRowIndex >= 0 && nextRowIndex < visibleRows.length) {
        dataGridInstance.option('focusedRowIndex', nextRowIndex);
        const newCurrentRow = visibleRows.find(row => row.rowIndex === nextRowIndex);

        // Find the first editable cell in the next row
        if (newCurrentRow) {
          for (let i = 0; i < columns.length; i++) {
            if (columns[i].allowEditing) {
              dataGridInstance.option('focusedColumnIndex', i);
              dataGridInstance.editCell(nextRowIndex, i);
              break;
            }
          }
        }
      }
    }
  }, []);

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
  // #endregion

  // #region Method
  useEffect(() => {
    var fetchData = async () => {
      try {
        const response = await fetch(
          `${baseURL}/MN/BaoCaoTaiChinh/Get`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${api_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.Data.Details;
      } catch (error) {
        console.error("Error fetching data:", error);
        return [];
      }
    }

    fetchData().then(data => {
      setDataSource(data)
    })
  }, []);
  // #endregion

  return (
    <>
      <div className='responsive-paddings'>
        <DataGrid
          dataSource={dataSource}
          remoteOperations={false}
          showBorders={true}
          keyExpr="ID"
          focusedRowEnabled={true}
          allowColumnReordering={true}
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
            headerCellTemplate="STT"
          >
          </Column>

          <Column dataField="NOI_DUNG_CHA" caption="Nội dung cha" width={120} allowEditing={false}></Column>
          <Column dataField="NOI_DUNG" caption="Nội dung" alignment='left' width={600} allowEditing={false}></Column>
          <Column dataField="DON_VI" caption="Đơn vị" width={100} allowEditing={false} alignment='center'></Column>

          {/* <Column dataField="NOI_DUNG_CHA_1" width={100} format={"currency"}></Column>
          <Column dataField="NOI_DUNG_CHA_2" width={150} alignment='center' allowResizing={false}></Column> */}

          <Column cssClass='editable-data' dataField="" caption='Tổng số' width={100} format={"currency"} alignment='right'></Column>

          <Column caption='Chia ra theo các năm' alignment='center'>
            <Column cssClass='editable-data' dataField='2019' alignment='right' width={100} ></Column>
            <Column cssClass='editable-data' dataField='2020' alignment='right' width={100}></Column>
            <Column cssClass='editable-data' dataField='2021' alignment='right' width={100}></Column>
            <Column cssClass='editable-data' dataField='2022' alignment='right' width={100}></Column>
            <Column cssClass='editable-data' dataField='2023' alignment='right' width={100}></Column>
            <Column cssClass='editable-data' dataField="GHI_CHU" caption='Ghi chú' width={400} alignment="left" allowSorting={false} />
          </Column>

          <Summary>
            <TotalItem column="TEN" customizeText={sumText} />
            <TotalItem column="MA_HUYEN" summaryType="sum" customizeText={customizeText} />
            <TotalItem column="MA_TINH" summaryType="sum" customizeText={customizeText} />
          </Summary>

          <Pager visible={true} defaultPageSize={10} showInfo={true} showPageSizeSelector={false} showNavigationButtons={true} displayMode='full' />

          <Paging defaultPageSize={10} />
        </DataGrid >
      </div>
    </>
  )
}

export default BaoCaoTaiChinh;