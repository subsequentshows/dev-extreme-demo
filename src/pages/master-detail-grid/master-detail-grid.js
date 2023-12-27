import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
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
import "./master-detail-grid.scss";
import notify from 'devextreme/ui/notify';
import WarningIcon from "../../asset/image/confirm.png";

import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import { createStore } from 'devextreme-aspnet-data-nojquery';
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
import { Modal } from "react-bootstrap-v5";

import readXlsxFile from 'read-excel-file';
import { formatDate } from 'devextreme/localization';

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

const statuses = ['All', 'France', 'Germany', 'Brazil', 'Belgium'];
const cityStatuses = ['All', 'Reims', 'Rio de Janeiro', 'Lyon', 'Charleroi'];

const statusLabel = { 'aria-label': 'Status' };

const MasterDetailGrid = () => {
  const [data, setData] = useState([]);

  const allowedPageSizes = [50, 100, 150, 200];
  // const [items, setItems] = useState([]);

  // File upload
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState();
  const [error, setError] = useState();
  const [fileContent, setFileContent] = useState('');

  // Delete
  // const dataGridRef = useRef < DataGrid > (null);
  const dataGridRef = useRef(null);
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

  const customizeColumnDate = (itemInfo) => `${formatDate(itemInfo.value, 'dd/MM/yyyy')}`;
  const customizeDate = (itemInfo) => `First: ${formatDate(itemInfo.value, 'dd/MM/yyyy')}`;
  const renderLabel = () => <div className="toolbar-label">1.1. Quản lý thu phí</div>;
  $('.dx-datagrid-addrow-button .dx-button-text').text('Thêm');

  // Custom filter function for ShipCountry
  // const shipCountryFilter = useCallback((data) => {
  //   const lowerCaseSearchTerm = searchTerm.toLowerCase();
  //   return data.ShipCountry.toLowerCase().includes(lowerCaseSearchTerm);
  // }, [searchTerm]);

  const shipCityTerm = useCallback((data) => {
    const lowerCaseSearchTerm = citySearchTerm.toLowerCase();
    return data.ShipCity.toLowerCase().includes(lowerCaseSearchTerm);
  }, [citySearchTerm]);



  const handleSearchTermChange = (event) => {
    setCitySearchTerm(event.target.value);
    shipCityTerm();
  };

  // Custom store for handling data and filtering
  const customStore = useMemo(() => {
    return new CustomStore({
      key: 'OrderID',
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

  const onFilterValueChanged = useCallback(({ value }) => {
    const dataGrid = dataGridRef.current.instance;

    if (value === 'All') {
      dataGrid.clearFilter();
    } else {
      setFilterCityStatus("All");
      dataGrid.filter(['ShipCountry', '=', value]);
    }

    setFilterStatus(value);
  }, []);

  const onCityFilterValueChanged = useCallback(({ value }) => {
    const dataGrid = dataGridRef.current.instance;

    if (value === 'All') {
      dataGrid.clearFilter();
    } else {
      setFilterStatus("All");
      dataGrid.filter(['ShipCity', '=', value]);
    }

    setFilterCityStatus(value);
  }, []);

  // const onFilterValueChanged = useCallback(({ value }) => {
  //   const dataGrid = dataGridRef.current.instance;

  //   if (value === 'All') {
  //     dataGrid.clearFilter();
  //   } else {
  //     // Update shipCountryFilter state

  //     // Apply custom filter
  //     dataGrid.filter(['ShipCountry', '=', value]);
  //   }
  // }, []);

  const onCityValueChanged = useCallback(({ value }) => {
    const dataGrid = dataGridRef.current.instance;

    if (value === '') {
      dataGrid.reload();
      console.log("hehe")
    } else {
      // Apply custom filter
      dataGrid.filter(['ShipCity', '=', value]);
      setCitySearchTerm(value);
      // setFilterStatus(value);
    }
  }, [setCitySearchTerm]);

  return (
    <>
      <div className="item-filter-wrapper responsive-paddings">
        <div className='item-filter'>
          <label className='items-filter-label'>Nước đặt hàng</label>
          <SelectBox
            items={statuses}
            inputAttr={statusLabel}
            value={filterStatus}
            onValueChanged={onFilterValueChanged}
          />
        </div>

        <div className='item-filter'>
          <label className='items-filter-label'>TP đặt hàng</label>
          <SelectBox
            items={cityStatuses}
            inputAttr={statusLabel}
            value={filterCityStatus}
            onValueChanged={onCityFilterValueChanged}
          />
        </div>

        <div className='item-filter'>
          <label className='items-filter-label'>Ship City Filter</label>

          <input
            type='text'
            className='ship-country-filter'
            value={citySearchTerm}
            // shipCityTerm 
            onChange={onCityValueChanged}
            placeholder='Search...'
          />
        </div>

      </div>

      <DataGrid
        id="gridContainer"
        className='responsive-paddings master-detail-grid'
        allowColumnReordering={false}
        focusedRowEnabled={true}
        ref={dataGridRef}
        width="100%"
        height="100%"
        dataSource={customStore}
        onExporting={onExporting}
        showBorders={true}
        remoteOperations={true}
        repaintChangesOnly={true}
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

        <Column caption="ID"
          dataField="OrderID"
          alignment='left'
          width={100}
          allowEditing={false}
          allowFiltering={false}
          fixed={true}
          fixedPosition="left"
        >
          <StringLengthRule max={5} message="The field OrderID must be a string with a maximum length of 5." />
        </Column>

        <Column caption="Họ tên"
          dataField="ShipName"
          allowHeaderFiltering={true}
          fixed={true}
          fixedPosition="left"
          alignment='left'
          dataType="string"
          width={200}
          allowSearch={true}
          allowReordering={false}
          selectedFilterOperation="contains"
          filterOperations={['contains']}
        >
          <StringLengthRule max={15} message="The field ShipName must be a string with a maximum length of 15." />
        </Column>

        <Column caption="Tổng tiền"
          allowHeaderFiltering={false}
          filterType='numberic'
          selectedFilterOperation="contains"
          allowFiltering={false}
          dataField="Freight" dataType="number" width={150}
          filterOperations={['contains']}>
        </Column>

        <Column
          caption="Nước đặt hàng"
          dataField="ShipCountry"
          alignment="left"
          width={120}
          allowSearch={false}
          filterOperations={['custom']}
          calculateFilterExpression={() => {
            return ['contains', 'ShipCountry', shipCountryFilter];
          }}
        // calculateFilterExpression={() => {
        //   return ['custom', shipCountryFilter];
        // }}
        // calculateFilterExpression={() => ['contains', 'ShipCountry', shipCountryFilter]}
        />

        <Column caption="TP đặt hàng"
          dataField="ShipCity"
          alignment='left'
          allowSearch={false}
          filterOperations={['custom']}
          calculateFilterExpression={() => {
            return ['contains', 'ShipCity', shipCityFilter, citySearchTerm];
          }}
        />
        <Column caption="Địa chỉ đặt hàng" dataField="ShipAddress" alignment='left' selectedFilterOperation="contains" width={150} filterOperations={['contains']}></Column>

        <Column caption="Ngày đặt hàng"
          dataField="OrderDate"
          alignment='left'
          dataType="date"
          width={150}
          customizeText={customizeColumnDate}
          selectedFilterOperation="contains"
          filterOperations={['contains']}
        >
          <RequiredRule message="The OrderDate field is required." />
        </Column>

        {/* <Column caption="" visible={true} allowEditing={false} allowExporting={false} /> */}

        <Summary>
          <TotalItem
            name="SelectedRowsSummary"
            column="Freight"
            summaryType="sum"
            valueFormat="currency" //valueFormat="#0.00"
            showInColumn="Freight"
            alignment="right"
            displayFormat="Tổng: {0}">
            <ValueFormat type="decimal" precision={2} />
          </TotalItem>

          <GroupItem column="Freight" summaryType="sum">
            <ValueFormat type="decimal" precision={2} />
          </GroupItem>

          <GroupItem summaryType="count" >
          </GroupItem>
        </Summary>

        <Toolbar>
          <Item location="left" locateInMenu="never" render={renderLabel} />

          <Item location="after" name="addRowButton" />
          <Item location="after" name='refresh' ShowTextMode="always">
            <Button icon='refresh' widget="dxButton" onClick={refreshDataGrid} text="Tải lại" />
          </Item>

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
    </>
  );
}

export default MasterDetailGrid;