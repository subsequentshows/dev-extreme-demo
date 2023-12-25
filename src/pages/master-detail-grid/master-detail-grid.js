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
  Form,
  Pager,
  CheckBox,
  SelectBox,
  SearchPanel,
  Lookup,
  Summary,
  RangeRule,
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
import {
  Popup, Position, ToolbarItem
} from 'devextreme-react/popup';
import { Button } from "devextreme-react/button";
import "./master-detail-grid.scss";
import notify from 'devextreme/ui/notify';
import WarningIcon from "../../asset/image/confirm.png";

import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import { createStore } from 'devextreme-aspnet-data-nojquery';

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

// Import
// const ExcelToJSON = function () {
//   this.parseExcel = function (file) {
//     let reader = new FileReader();

//     reader.onload = function (e) {
//       let data = e.target.result;
//       let workbook = XLSX.read(data, {
//         type: 'binary'
//       });
//       workbook.SheetNames.forEach(function (sheetName) {
//         // Here is your object
//         let XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
//         let json_object = JSON.stringify(XL_row_object);
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

// function handleFileSelect(evt) {
//   let files = evt.target.files; // FileList object
//   let xl2json = new ExcelToJSON();
//   xl2json.parseExcel(files[0]);
// }

// const input = document.getElementById('input')
// input.addEventListener('change', () => {
//   readXlsxFile(input.files[0]).then((rows) => {
//     // `rows` is an array of rows
//     // each row being an array of cells.
//   })
// })

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

const MasterDetailGrid = () => {
  const [data, setData] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const allowedPageSizes = [50, 100, 150, 200];
  // const [items, setItems] = useState([]);

  // File upload
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState();
  const [error, setError] = useState();
  const [fileContent, setFileContent] = useState('');

  // Delete
  const dataGridRef = useRef(null);
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);

  // Popup confirm
  const [isPopupVisible, setPopupVisibility] = useState(false);

  const customizeColumnDate = (itemInfo) => `${formatDate(itemInfo.value, 'dd/MM/yyyy')}`;
  const customizeDate = (itemInfo) => `First: ${formatDate(itemInfo.value, 'dd/MM/yyyy')}`;
  const renderLabel = () => <div className="toolbar-label">1.1. Quản lý thu phí</div>;
  $('.dx-datagrid-addrow-button .dx-button-text').text('Thêm');

  // const readExcel = (file) => {
  //   const promise = new Promise((resolve, reject) => {
  //     const fileReader = new FileReader();
  //     fileReader.readAsArrayBuffer(file);

  //     fileReader.onload = (e) => {
  //       const bufferArray = e.target.result;

  //       const wb = XLSX.read(bufferArray, { type: "buffer" });

  //       const wsname = wb.SheetNames[0];

  //       const ws = wb.Sheets[wsname];

  //       const data = XLSX.utils.sheet_to_json(ws);

  //       resolve(data);
  //     };

  //     fileReader.onerror = (error) => {
  //       reject(error);
  //     };
  //   });

  //   promise.then((d) => {
  //     setItems(d);
  //   });
  // };

  // document.getElementById('file').addEventListener('change', handleFileSelect, false);

  // $("#file").on("change", function (e) {
  //   e.preventDefault();
  //   handleFileSelect();
  // });

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
      refreshDataGrid();
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
    <>
      <DataGrid
        id="gridContainer"
        className='responsive-paddings master-detail-grid'
        allowColumnReordering={false}
        focusedRowEnabled={true}
        ref={dataGridRef}
        width="100%"
        height="100%"
        dataSource={dataSource}
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

        <Column
          caption="STT"
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
          selectedFilterOperation="contains"
          filterOperations={['contains']}
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

        <Column caption="TP đặt hàng" dataField="ShipCountry" alignment='left' selectedFilterOperation="contains" width={120} filterOperations={['contains']}></Column>
        <Column caption="TP giao hàng" dataField="ShipCity" alignment='left' selectedFilterOperation="contains" width={150} filterOperations={['contains']}></Column>
        <Column caption="Địa chỉ giao hàng" dataField="ShipAddress" alignment='left' selectedFilterOperation="contains" width={150} filterOperations={['contains']}></Column>

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

        <Column caption=""
          visible={true}
          allowEditing={false}
          allowExporting={false}
        >
        </Column>

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
        <SearchPanel
          visible={true}
          width={240}
          highlightSearchText={true}
          searchVisibleColumnsOnly={true}
          placeholder="Tìm kiếm"
        />
        <FilterRow visible={true} allowFiltering={true} showResetValues={false} />
        <HeaderFilter enabled={false} visible={false} />
        <GroupPanel visible={false} />
        <Export enabled={true} formats={exportFormats} allowExportSelectedData={true} />
        <Paging enabled={true} defaultPageSize={50} defaultPageIndex={0} />
      </DataGrid>

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