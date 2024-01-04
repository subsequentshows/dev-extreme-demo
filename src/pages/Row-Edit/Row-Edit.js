/* global RequestInit */
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
import { formatDate } from "devextreme/localization";
import "whatwg-fetch";
import { baseURL } from "../../api/api";
import WarningIcon from "../../asset/image/confirm.png";
import notify from 'devextreme/ui/notify';

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

// import readXlsxFile from 'read-excel-file';

const refreshModeLabel = { "aria-label": "Refresh Mode" };
const REFRESH_MODES = ["full", "reshape", "repaint"];
const renderLabel = () => <div className="toolbar-label">1.1. Quản lý thu phí</div>;
const exportFormats = ['xlsx', 'pdf'];

const statuses = ['Chọn', 'Tỉnh Sóc Trăng', 'Thành phố Hà Nội', 'Tỉnh Kiên Giang', 'Thành phố Hồ Chí Minh'];
const cityStatuses = ['Chọn', 'Huyện Gò Quao', 'Huyện Sóc Sơn', 'Quận Bắc Từ Liêm', 'Huyện Đồng Văn'];
const statusLabel = { 'aria-label': 'Status' };

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

const RowEdit = () => {
  const [requests, setRequests] = useState([]);
  const [refreshMode, setRefreshMode] = useState("reshape");
  const [searchValue, setSearchValue] = useState("");
  const dataGridRef = useRef(null);

  const [isPopupVisible, setPopupVisibility] = useState(false);
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);
  const allowedPageSizes = [50, 100, 150, 200];

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [tenQuanHuyenFilter, setTenQuanHuyenFilter] = useState('');
  const [tenTinhThanhPhoFilter, setTenTinhThanhPhoFilter] = useState("");
  const [tenXaSearch, setTenXaSearch] = useState('');

  const [filterStatus, setFilterStatus] = useState(statuses[0]);
  const [filterCityStatus, setFilterCityStatus] = useState(statuses[0]);

  //
  const [contentData, setContentData] = useState(
    new CustomStore({
      key: "ID",
      load: async () => {
        try {
          const response = await fetch(
            `${baseURL}/DanhMuc/GetDMPhuongXa`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          console.log(data.Data.find(o => o.TEN === "xá"))
          // Apply search filter
          if (searchValue) {
            return data.Data.filter((item) =>
              item.TEN.toLowerCase().includes(searchValue.toLowerCase())
            );
          }

          return data.Data;
          // Assuming the API response is an array of objects
        } catch (error) {
          console.error("Error fetching data:", error);
          return [];
        }
      },
      update: async (key, values) => {
        try {
          const response = await fetch(
            `${baseURL}/Manager/Menu/UpdateMenu/${key}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(values),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const updatedData = await response.json();
          // Return the updated data if needed
          return updatedData;
        } catch (error) {
          console.error("Error updating data:", error);
          throw error;
        }
      },
      remove: async (key) => {
        try {
          const response = await fetch(
            `${baseURL}/Manager/Menu/DeleteMenu/${key}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const deletedData = await response.json();
          return deletedData; // Return the deleted data if needed
        } catch (error) {
          console.error("Error deleting data:", error);
          throw error;
        }
      },

      // insert: (values) =>
      //   sendRequest(`${baseURL}/InsertOrder`, "POST", {
      //     values: JSON.stringify(values),
      //   }),
      // update: (key, values) =>
      //   sendRequest(`${baseURL}/UpdateOrder`, "PUT", {
      //     key,
      //     values: JSON.stringify(values),
      //   }),
      // remove: (key) =>
      //   sendRequest(`${baseURL}/DeleteOrder`, "DELETE", {
      //     key,
      //   }),
    })
  );

  const handleRefreshModeChange = useCallback(
    (e) => {
      setRefreshMode(e.value);
    },
    []
  );

  const clearRequests = useCallback(() => {
    setRequests([]);
  }, []);

  const logRequest = useCallback(
    (method, url, data) => {
      const args = Object.keys(data || {})
        .map((key) => `${key}=${data[key]}`)
        .join(" ");

      const time = formatDate(new Date(), "HH:mm:ss");
      const request = [time, method, url.slice(URL.length), args].join(" ");

      setRequests((prevRequests) =>
        [request].concat(prevRequests)
      );
    },
    []
  );

  const sendRequest = useCallback(
    async (url, method = "GET", data = {}) => {
      logRequest(method, url, data);

      const request = {
        method,
        credentials: "include",
      };

      if (["DELETE", "POST", "PUT"].includes(method)) {
        const params = Object.keys(data)
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
          )
          .join("&");

        request.body = params;
        request.headers = {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        };
      }

      const response = await fetch(url, request);

      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const result = isJson ? await response.json() : {};

      if (!response.ok) {
        throw result.Message;
      } else {
        console.log(result.data)
      }

      return method === "GET" ? result.data : {};

    },
    [logRequest]
  );

  const refreshDataGrid = useCallback(() => {
    dataGridRef.current.instance.refresh();
    console.log("Reloaded")
  }, []);

  // const handleSearchButtonClick = async () => {
  //   // Trigger a reload of the data with the new search value
  //   refreshDataGrid();
  //   await contentData.load({ searchValue });
  // };

  // const handleSearchInputChange = (e) => {
  //   setSearchValue(e.target.value);
  //   console.log((e.target.value))
  // };

  const onCityValueChanged = useCallback(({ value }) => {
    const dataGrid = dataGridRef.current.instance;

    if (value === '') {
      // dataGrid.reload();
      // dataGrid.clearFilter();
      console.log("hehe")
    } else {
      // Apply custom filter
      dataGrid.filter(['TEN_HUYEN', '=', value]);
      setTenXaSearch(value);
      contentData.load({ tenXaSearch });
    }
  }, [setTenXaSearch, contentData, tenXaSearch]);

  const togglePopup = useCallback(() => {
    setPopupVisibility(!isPopupVisible);
  }, [isPopupVisible]);

  const rowIndexes = (data) => {
    const pageIndex = data.component.pageIndex();
    const pageSize = data.component.pageSize();
    const rowIndex = pageIndex * pageSize + data.rowIndex + 1;
    return <span> {rowIndex} </span>;
  }

  const deleteRecords = useCallback(() => {
    try {
      selectedItemKeys.forEach((key) => {
        // dataSource.remove(key);
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

  const onSelectionChanged = useCallback((data) => {
    setSelectedItemKeys(data.selectedRowKeys);
  }, []);

  const onPageChanged = (e) => {
    setCurrentPageIndex(e.component.pageIndex());
  };

  const onFilterValueChanged = useCallback(({ value }) => {
    const dataGrid = dataGridRef.current.instance;

    if (value === 'Chọn') {
      dataGrid.clearFilter();
    } else {
      setFilterCityStatus("Chọn");
      dataGrid.filter(['TEN_TINH', '=', value]);
    }

    setFilterStatus(value);
  }, []);

  const onCityFilterValueChanged = useCallback(({ value }) => {
    const dataGrid = dataGridRef.current.instance;

    if (value === 'Chọn') {
      dataGrid.clearFilter();
    } else {
      setFilterStatus("Chọn");
      dataGrid.filter(['TEN_HUYEN', '=', value]);
    }

    setFilterCityStatus(value);
  }, []);

  return (
    <>
      {/* <div className="search-container responsive-paddings">
        <button icon='refresh' widget="dxButton" onClick={refreshDataGrid} text="Tải lại" > Reload </button>

        <input
          type="text"
          placeholder="Search by TEN"
          value={searchValue}
          onChange={handleSearchInputChange}
        />
        <button onClick={handleSearchButtonClick}>Tên xã</button>
      </div> */}

      <div className="item-filter-wrapper responsive-paddings">
        <div className='item-filter'>
          <label className='items-filter-label'>Tên tỉnh</label>
          <SelectBox
            items={statuses}
            inputAttr={statusLabel}
            value={filterStatus}
            onValueChanged={onFilterValueChanged}
          />
        </div>

        <div className='item-filter'>
          <label className='items-filter-label'>Tên huyện</label>
          <SelectBox
            items={cityStatuses}
            inputAttr={statusLabel}
            value={filterCityStatus}
            onValueChanged={onCityFilterValueChanged}
          />
        </div>

        <div className='item-filter'>
          <label className='items-filter-label'>Tên xã</label>

          <div className='input-wrapper'>
            <input
              className='ship-country-filter search-input'
              type='text'
              value={tenXaSearch}

              // shipCityTerm 
              onChange={onCityValueChanged}
              placeholder='Search...'
            />
          </div>
        </div>
      </div>

      <div className="responsive-paddings">
        <DataGrid
          id="grid-container"
          className='master-detail-grid'
          dataSource={contentData}
          ref={dataGridRef}
          width="100%"
          height="100%"
          showBorders={true}
          focusedRowEnabled={true}
          // remoteOperations={true}
          repaintChangesOnly={true}
          allowColumnReordering={false}
          onExporting={onExporting}
          selectedRowKeys={selectedItemKeys}
          onSelectionChanged={onSelectionChanged}
          onPageChanged={onPageChanged}
        >
          <Editing
            refreshMode={refreshMode}
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

          <Column caption="Mã"
            dataField="MA"
            alignment='left'
            width={80}
            allowEditing={false}
            allowFiltering={false}
            fixed={true}
            fixedPosition="left"
          />

          <Column caption="Sửa"
            type="buttons"
            width={80}
            fixed={true}
            fixedPosition="left"
          >
            <Button name="edit" />
          </Column>

          <Column caption="Tên"
            dataField="TEN"
            width={180}
            allowEditing={false}
            allowFiltering={false}
            fixed={true}
            fixedPosition="left"
          />

          <Column caption="Tên tỉnh"
            dataField="TEN_TINH"
            alignment='left'
            allowSearch={false}
            width={180}
            filterOperations={['custom']}
            calculateFilterExpression={() => {
              return ['contains', 'TEN_TINH', tenTinhThanhPhoFilter, tenXaSearch];
            }}
          />

          <Column
            caption="Tên huyện"
            dataField="TEN_HUYEN"
            alignment="left"
            width={120}
            allowSearch={false}
            filterOperations={['custom']}
            calculateFilterExpression={() => {
              return ['contains', 'TEN_HUYEN', tenQuanHuyenFilter];
            }}
          // calculateFilterExpression={() => {
          //   return ['custom', tenQuanHuyenFilter];
          // }}
          // calculateFilterExpression={() => ['contains', 'ShipCountry', tenQuanHuyenFilter]}
          >
          </Column>

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
          <FilterRow visible={false} allowFiltering={false} showResetValues={false} />
          <HeaderFilter enabled={false} visible={false} />
          <GroupPanel visible={false} />
          <Export enabled={true} formats={exportFormats} allowExportSelectedData={true} />
          <Paging enabled={true} defaultPageSize={50} defaultPageIndex={0} />
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

        <br />
        <div className="options" >
          {/* <div className="caption">Options</div>
          <div className="option">
            <span>Refresh Mode: </span>
            <SelectBox
              value={refreshMode}
              inputAttr={refreshModeLabel}
              items={REFRESH_MODES}
              onValueChanged={handleRefreshModeChange}
            />
          </div> */}
          <div id="requests">
            <div>
              <div className="caption">Network Requests</div>
              <Button id="clear" text="Clear" onClick={clearRequests} />
            </div>
            <ul>
              {requests.map((request, index) => (
                <li key={index}>{request}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default RowEdit;
