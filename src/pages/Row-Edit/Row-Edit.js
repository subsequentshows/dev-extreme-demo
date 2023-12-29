import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import {
  Column,
  DataGrid,
  FilterRow,
  HeaderFilter,
  GroupPanel,
  Editing,
  Grouping,
  Paging,
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
import SelectBox from 'devextreme-react/select-box';
import { Button } from "devextreme-react/button";
import notify from 'devextreme/ui/notify';

import axios from 'axios';
import { baseURL } from '../../api/api';

import { createStore } from 'devextreme-aspnet-data-nojquery';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';

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

const url = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';

// const remoteDataSource = createStore({
//   key: 'ID',
//   loadUrl: serviceUrl + '/DanhMuc/GetDMPhuongXa',
//   // insertUrl: serviceUrl + '/InsertAction',
//   // updateUrl: serviceUrl + '/UpdateAction',
//   // deleteUrl: serviceUrl + '/DeleteAction',

//   onBeforeSend: (method, ajaxOptions) => {
//     ajaxOptions.xhrFields = { withCredentials: true };
//   },
// });

const dataSource = createStore({
  key: 'ID',
  loadUrl: `${baseURL}/DanhMuc/GetDMPhuongXa`,
  // insertUrl: `${url}/InsertOrder`,
  // updateUrl: `${url}/UpdateOrder`,
  // deleteUrl: `${url}/DeleteOrder`,

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



// const customDataSource = new CustomStore({
//   key: 'ID',
//   load: (loadOptions) => {
//     // ...
//   },
//   insert: (values) => {
//     return fetch('https://mydomain.com/MyDataService', {
//       method: 'POST',
//       body: JSON.stringify(values),
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     })
//       .then(handleErrors)
//       .catch(() => { throw 'Network error' });
//   },
//   remove: (key) => {
//     return fetch(`https://mydomain.com/MyDataService/${encodeURIComponent(key)}`, {
//       method: 'DELETE'
//     })
//       .then(handleErrors)
//       .catch(() => { throw 'Network error' });
//   },
//   update: (key, values) => {
//     return fetch(`https://mydomain.com/MyDataService/${encodeURIComponent(key)}`, {
//       method: 'PUT',
//       body: JSON.stringify(values),
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     })
//       .then(handleErrors)
//       .catch(() => { throw 'Network error' });
//   }
// });

const RowEdit = () => {
  const customStore = useMemo(() => {
    return new CustomStore({
      key: 'ID',
      load: (loadOptions) => {
        // Import data loading fromdataSource
        return dataSource.load(loadOptions);
      },
      // filter for ShipCountry
      // byKey: (key) => {
      //   return dataSource.byKey(key);
      // },
      // Implement the custom filter function for ShipCountry
      // filter: [shipCityFilter],
      filter: [],
    });
  }, []);

  const renderLabel = () => <div className="toolbar-label">1.1. Quản lý thu phí</div>;
  const statuses = ['All', 'France', 'Germany', 'Brazil', 'Belgium'];
  const cityStatuses = ['All', 'Reims', 'Rio de Janeiro', 'Lyon', 'Charleroi'];


  const dataGridRef = useRef(null);
  const [phuongXaData, setPhuongXaData] = useState([]);

  // Delete
  // const dataGridRef = useRef < DataGrid > (null);
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);

  // Popup confirm
  const [isPopupVisible, setPopupVisibility] = useState(false);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const [filterStatus, setFilterStatus] = useState(statuses[0]);
  const [filterCityStatus, setFilterCityStatus] = useState(statuses[0]);
  const [shipCountryFilter, setShipCountryFilter] = useState('');
  const [shipCityFilter, setShipCityFilter] = useState("");

  const [citySearchTerm, setCitySearchTerm] = useState('');

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get(`${baseURL}/DanhMuc/GetDMPhuongXa`);
  //       setPhuongXaData(response.data);

  //     } catch (error) {
  //       console.error('Error fetching PhuongXa data:', error);
  //     }
  //   };
  //   fetchData();
  // }, []);

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

  const togglePopup = useCallback(() => {
    setPopupVisibility(!isPopupVisible);
  }, [isPopupVisible]);

  const refreshDataGrid = useCallback(() => {
    dataGridRef.current.instance.refresh();
  }, []);

  const deleteRecords = useCallback(() => {
    try {
      selectedItemKeys.forEach((key) => {
        dataSource.remove(key);
      });
      togglePopup();
      refreshDataGrid();

      let selectedAndDeletedItems = selectedItemKeys.length;
      const customText = `Xóa thành công `;
      const customText2 = ` mục`;
      const message = customText + selectedAndDeletedItems + customText2;

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
    }
    catch (error) {
      notify(
        {
          error,
          position: {
            my: 'after botom',
            at: 'after botom',
          },
        },
        `error` + { error },
        5000,
      )
    }
    finally {
      setSelectedItemKeys([]);
      // refreshDataGrid();
    }
  }, [selectedItemKeys, togglePopup, refreshDataGrid]);

  const onSelectionChanged = useCallback((data) => {
    setSelectedItemKeys(data.selectedRowKeys);
  }, []);

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

  const onPageChanged = (e) => {
    setCurrentPageIndex(e.component.pageIndex());
  };

  const rowIndexes = (data) => {
    const pageIndex = data.component.pageIndex();
    const pageSize = data.component.pageSize();
    const rowIndex = pageIndex * pageSize + data.rowIndex + 1;
    return <span> {rowIndex} </span>;
  }

  return (
    <React.Fragment>
      <div className={'content-block responsive-paddings'}>
        <div>
          <DataGrid
            id="gridContainer"
            width="100%"
            height="100%"
            ref={dataGridRef}
            dataSource={customStore}
            allowColumnReordering={false}
            focusedRowEnabled={true}
            showBorders={true}
            remoteOperations={true}
            repaintChangesOnly={true}
            onExporting={onExporting}
            selectedRowKeys={selectedItemKeys}
            onSelectionChanged={onSelectionChanged}
            onPageChanged={onPageChanged}
          >

            <Editing
              mode="popup"
              location="center"
              locateInMenu="auto"
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

            <Column caption="Sửa"
              type="buttons"
              width={80}
              fixed={true}
              fixedPosition="left"
            >
              <Button name="edit" />
            </Column>

            <Column
              dataField="TEN"
              caption='Tên'
              fixed={true}
              fixedPosition="left"
              width={150}
            >
            </Column>

            {/* <Column caption="ID"
              dataField="ID"
              alignment='left'
              width={100}
              allowEditing={false}
              allowFiltering={false}
              fixed={true}
              fixedPosition="left"
            >
              <StringLengthRule max={5} message="The field OrderID must be a string with a maximum length of 5." />
            </Column> */}

            <Column dataField="MA" caption='Mã' width={80}></Column>
            <Column dataField="MA_HUYEN" caption='Mã huyện' width={80}></Column>
            <Column dataField="MA_TINH" caption='Mã tỉnh' width={80}></Column>
            <Column dataField="TEN_TINH" caption='Tên tỉnh' width={120}></Column>
            <Column dataField="TEN_HUYEN" caption='Tên huyện' width={120}></Column>

            <Toolbar>
              <Item location="left" locateInMenu="never" render={renderLabel} />
              <Item location="after" name="addRowButton" />
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
              {/* <Item location='after' name='searchPanel' /> */}
            </Toolbar>

            <Grouping autoExpandAll={false} />
            <ColumnFixing enabled={false} />
            <Selection mode="multiple" />
            <SearchPanel
              visible={true}
              width={240}
              highlightSearchText={true}
              searchVisibleColumnsOnly={true}
              placeholder="Tìm kiếm"
            />
            <FilterRow visible={false} allowFiltering={false} showResetValues={false} />
            <HeaderFilter enabled={false} visible={false} />
            <GroupPanel visible={false} />
            <Export enabled={true} formats={exportFormats} allowExportSelectedData={true} />
            <Paging enabled={true} defaultPageSize={50} defaultPageIndex={0} />

          </DataGrid>

          <Selection mode="multiple" />
          <FilterRow visible={true} />
        </div>
      </div>
    </React.Fragment>
  )
}

export default RowEdit;