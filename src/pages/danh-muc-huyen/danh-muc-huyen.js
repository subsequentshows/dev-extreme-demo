import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Column,
  DataGrid,
  FilterRow,
  HeaderFilter,
  GroupPanel,
  Grouping,
  Paging,
  Pager,
  ColumnFixing,
  Export,
  Toolbar,
  Selection,
  Item
} from 'devextreme-react/data-grid';
import './danh-muc-huyen.scss';
import notify from 'devextreme/ui/notify';
import axios, { isCancel, AxiosError } from 'axios';
import CustomStore from "devextreme/data/custom_store";
import { baseURL } from '../../api/api';
import { Popup, ToolbarItem } from 'devextreme-react/popup';
import { SelectBox } from "devextreme-react/select-box";
import LoadIndicator from "devextreme-react/load-indicator";
import {
  Validator,
  RequiredRule,
  CompareRule,
  EmailRule,
  PatternRule,
  StringLengthRule,
  RangeRule,
  AsyncRule,
  CustomRule,
} from "devextreme-react/validator";
import { Button } from "devextreme-react/button";

// Export to excel library
import { exportDataGrid as exportDataGridToExcel } from 'devextreme/excel_exporter';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

// Export to pdf library
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { jsPDF } from "jspdf";
// Default export is a4 paper, portrait, using millimeters for units

import { fetchAllTinh } from "../../api/DmTinh";
import { fetchHuyenByMaTinh } from "../../api/DmHuyen";
import { fetchXaByMaHuyenByMaTinh } from "../../api/DmXa";

const statusLabel = { 'aria-label': 'Status' };
const allowedPageSizes = [50, 100, 150, 200];
const exportFormats = ['xlsx', 'pdf'];
const renderLabel = () => <div className="toolbar-label">Danh mục huyện</div>;

const DanhMucHuyenPage = () => {
  //#region Property
  const [dataSource, setDataSource] = useState([]);
  const [contentData, setContentData] = useState();
  const dataGridRef = useRef(null);

  const [tenXaFilter, setTenXaFilter] = useState('');
  const [tenQuanHuyenFilter, setTenQuanHuyenFilter] = useState('');
  const [tenTinhThanhPhoFilter, setTenTinhThanhPhoFilter] = useState("");

  const [tenHuyenSearch, setTenHuyenSearch] = useState("");

  const [filterTenXaStatus, setFilterTenXaStatus] = useState();
  const [filterCityStatus, setFilterCityStatus] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingTinh, setLoadingTinh] = useState(false);
  const [loadingHuyen, setLoadingHuyen] = useState(false);
  const [loadingXa, setLoadingXa] = useState(false);
  const [dmTinh, setDmTinh] = useState({});
  const [dmHuyen, setDmHuyen] = useState({});
  const [dmXa, setDmXa] = useState({});
  const [maTinh, setMaTinh] = useState("");
  const [maHuyen, setMaHuyen] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [maXa, setMaXa] = useState("");

  const [filterStatus, setFilterStatus] = useState(dmTinh);
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);
  //#endregion

  //#region Action
  const rowIndexes = (data) => {
    const pageIndex = data.component.pageIndex();
    const pageSize = data.component.pageSize();
    const rowIndex = pageIndex * pageSize + data.rowIndex + 1;
    return <span> {rowIndex} </span>;
  }

  // Datagrid dataSource
  useEffect(() => {
    var fetchData = async () => {
      try {
        const response = await fetch(
          `${baseURL}/DanhMuc/GetDMPhuongXa`
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
    }

    fetchData().then(data => {
      setContentData(data);
      setDataSource(data)
    })
  }, []);

  useEffect(() => {
    getDmTinh();
  }, []);

  useEffect(() => {
    let arr = [];
    maTinh.MA && arr.push(maTinh.MA);
    if (arr && arr.length) {
      setLoadingHuyen(true);
      setLoadingXa(true);
      getDmHuyen(arr);
      setTimeout(() => {
        setLoadingHuyen(false);
        setLoadingXa(false);
      }, 500);
    }
  }, [maTinh]);

  useEffect(() => {
    let arrMaTinh = [];
    let arrMaHuyen = [];
    maTinh.MA && arrMaTinh.push(maTinh.MA);
    maHuyen.MA && arrMaHuyen.push(maHuyen.MA);
    if (arrMaTinh && arrMaTinh.length && arrMaHuyen && arrMaHuyen.length) {
      setLoadingXa(true);
      getDmXa(arrMaTinh, arrMaHuyen);
      setTimeout(() => {
        setLoadingXa(false);
      }, 500);
    }
  }, [maTinh, maHuyen]);

  const getDmTinh = async () => {
    let res = await fetchAllTinh();

    if (res && res.Data) {
      setDmTinh(res.Data);
    }
  };

  const getDmHuyen = async (arr) => {
    let res = await fetchHuyenByMaTinh(0, 0, arr, "");
    if (res && res.Data && res.Data.Data) {
      setDmHuyen(res.Data.Data);
    }
  };

  const getDmXa = async (arrMaTinh, arrMaHuyen) => {
    let res = await fetchXaByMaHuyenByMaTinh(
      0,
      0,
      arrMaTinh,
      arrMaHuyen,
      "",
      ""
    );
    if (res && res.Data && res.Data.Data) {
      setDmXa(res.Data.Data);
    }
  };

  const onTenXaFilterValueChanged = useCallback(({ value }) => {
    const dataGrid = dataGridRef.current.instance;

    if (value === 'Chọn') {
      dataGrid.clearFilter();
    } else {
      dataGrid.clearFilter();
      dataGrid.filter(['TEN', '=', value]);
    }

    setFilterTenXaStatus(value);
  }, []);

  const onTenHuyenValueChanged = useCallback(
    (e) => {
      const dataGrid = dataGridRef.current.instance;
      if (e.target.value === '') {
        setTenHuyenSearch("")
        dataGrid.clearFilter();
      } else {
        let filter = e.target.value;
        dataGrid.refresh();

        // Load data after filtering
        setTenHuyenSearch(filter);

      }
    }, [setTenHuyenSearch]);

  const onTenTinhFilterValueChanged = useCallback(({ value }) => {
    const dataGrid = dataGridRef.current.instance;

    if (value === 'Chọn') {
      dataGrid.clearFilter();
    } else {
      dataGrid.clearFilter();
      dataGrid.filter(['TEN_TINH', '=', value]);
    }

    setFilterStatus(value);
  }, []);

  const onSelectionChanged = useCallback((data) => {
    setSelectedItemKeys(data.selectedRowKeys);
  }, []);

  const selectedAndDeletedItems = selectedItemKeys.length;

  function onExporting(e) {
    // if (e.format === 'xlsx') {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Danh mục');

    if (selectedAndDeletedItems === 0) {
      exportDataGridToExcel({
        component: dataGridRef.current.instance,
        worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Danh mục.xlsx');
        });
      });
    } else {
      exportDataGridToExcel({
        component: dataGridRef.current.instance,
        selectedRowsOnly: true,
        worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Danh mục.xlsx');
        });
      });
    }
  }

  function onPdfExporting(e) {
    const doc = new jsPDF();

    if (selectedAndDeletedItems === 0) {
      exportDataGridToPdf({
        jsPDFDocument: doc,
        component: dataGridRef.current.instance
      }).then(() => {
        doc.save('Danh mục.pdf');
      })
    } else {
      exportDataGridToPdf({
        jsPDFDocument: doc,
        selectedRowsOnly: true,
        component: dataGridRef.current.instance
      }).then(() => {
        doc.save('Danh mục.pdf');
      })
    }
  }
  //#endregion

  return (
    <>
      <div className="item-filter-wrapper responsive-paddings">
        {/* Tinh/TP */}
        <div className="item-filter">
          <label className="items-filter-label">Tỉnh/ Thành phố</label>

          <SelectBox
            dataSource={dmTinh}
            displayExpr="TEN_TINH"
            // searchEnabled={true}
            placeholder="Chọn Tỉnh"
            // searchMode="contains"
            // searchExpr="TEN"
            // searchTimeout={200}
            // minSearchLength={0}
            // onValueChanged={(e) => setMaTinh(e.value)}
            // disabled={loadingTinh}
            // validationMessageMode="always"

            inputAttr={statusLabel}
            value={filterStatus}
            onValueChanged={onTenTinhFilterValueChanged}
          >
            <Validator>
              <RequiredRule message="Không được để trống" />
            </Validator>

            {loadingTinh && (
              <LoadIndicator className='loading-icon' visible={true} />
            )}
          </SelectBox>
        </div>

        {/* Huyen */}
        <div className="item-filter">
          <label className="items-filter-label">Huyện</label>

          <SelectBox
            dataSource={dmHuyen}
            displayExpr="TEN"
            searchEnabled={true}
            placeholder="Chọn Huyện"
            searchMode="contains"
            searchExpr="TEN"
            searchTimeout={200}
            minSearchLength={0}
            onValueChanged={(e) => setMaHuyen(e.value)}
            disabled={loadingHuyen}
            validationMessagePosition="bottom"
            validationMessageMode="always"
          >
            <Validator>
              <RequiredRule message="Không được để trống" />
            </Validator>
            {loadingHuyen && (
              <LoadIndicator className='loading-icon' visible={true} />
            )}
          </SelectBox>
        </div>

        {/* Xa */}
        <div className="item-filter">
          <label className="items-filter-label">Xã</label>

          <SelectBox
            dataSource={dmXa}
            displayExpr="TEN"
            placeholder="Chọn Xã"
            searchMode="contains"
            searchExpr="TEN"
            searchTimeout={200}
            minSearchLength={0}
            // searchEnabled={true}
            disabled={loadingXa}
            validationMessageMode="always"
            value={filterTenXaStatus}
            inputAttr={statusLabel}
            // onValueChanged={(e) => setMaXa(e.value)}
            onValueChanged={onTenXaFilterValueChanged}
          >
            <Validator>
              <RequiredRule message="Không được để trống" />
            </Validator>
            {loadingXa && (
              <LoadIndicator className='loading-icon' visible={true} />
            )}
          </SelectBox>
        </div>

        <div className='item-filter'>
          <label className='items-filter-label'>Tìm huyện</label>

          <div className='input-wrapper'>
            <input
              className='ship-country-filter search-input'
              type='text'
              value={tenHuyenSearch}
              onChange={onTenHuyenValueChanged}
              placeholder='Tìm huyện'
            />
          </div>
        </div>
      </div>

      <div className='responsive-paddings'>
        <DataGrid
          id="grid-container"
          className='data-grid'
          keyExpr="ID"
          dataSource={dataSource}
          ref={dataGridRef}
          width="100%"
          height="100%"
          showBorders={false}
          focusedRowEnabled={true}
          onExporting={onExporting}
          selectedRowKeys={selectedItemKeys}
          onSelectionChanged={onSelectionChanged}
        >

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

          <Column caption="Tên"
            dataField="TEN"
            width={200}
            allowEditing={false}
            allowFiltering={true}
            fixed={false}
            fixedPosition="left"
            allowSearch={false}
            allowExporting={true}
            filterOperations={['custom']}
            calculateFilterExpression={() => {
              return ['contains', 'TEN', tenXaFilter];
            }}
          />

          <Column caption="Tên tỉnh"
            dataField="TEN_TINH"
            alignment='left'
            allowSearch={false}
            width={200}
            hidingPriority={2}
            allowExporting={true}
            filterOperations={['custom']}
            calculateFilterExpression={() => {
              return ['contains', 'TEN_TINH', tenTinhThanhPhoFilter];
            }}
          />

          <Column caption="Tên huyện"
            dataField="TEN_HUYEN"
            alignment="left"
            width={200}
            hidingPriority={1}
            allowSearch={false}
            allowExporting={true}
            filterOperations={['custom']}
            calculateFilterExpression={() => {
              return ['contains', 'TEN_HUYEN', tenQuanHuyenFilter];
            }}
          >
          </Column>

          <Column caption=""
            hidingPriority={1}
            allowSearch={false}
            allowExporting={false}
          />

          <Toolbar>
            <Item location="left" locateInMenu="never" render={renderLabel} />

            <Item location='after' name='exportExcelButton' options={exportExcelButtonOptions}>
              <Button className="export-excel-button" tabIndex={0} onClick={onExporting}>Xuất Excel</Button>
            </Item>
            <Item location='after' name='exportPdfButton' formats="pdf" options={exportPdfButtonOptions}>
              <Button className="export-pdf-button" tabIndex={1} onClick={onPdfExporting}>Xuất Pdf</Button>
            </Item>
          </Toolbar>

          <Selection mode="multiple" />
          <Export enabled={true} formats={exportFormats} allowExportSelectedData={true} />
          <Paging enabled={true} defaultPageSize={50} defaultPageIndex={0} />
          <Pager showPageSizeSelector={true} allowedPageSizes={allowedPageSizes} displayMode="full" />
        </DataGrid>
      </div>
    </>
  )
}



export default DanhMucHuyenPage;

const exportExcelButtonOptions = {
  text: 'Xuất excel'
};

const exportPdfButtonOptions = {
  text: 'Xuất excel'
};