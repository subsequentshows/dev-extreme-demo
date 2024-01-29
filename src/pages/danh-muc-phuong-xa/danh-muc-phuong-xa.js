import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  Column,
  DataGrid,
  FilterRow,
  HeaderFilter,
  GroupPanel,
  Grouping,
  Paging,
  Pager,
  RequiredRule,
  StringLengthRule,
  ColumnFixing,
  Export,
  Toolbar,
  Item
} from 'devextreme-react/data-grid';
import { Popup, ToolbarItem } from 'devextreme-react/popup';
import { SelectBox } from "devextreme-react/select-box";
import $ from 'jquery';
import "whatwg-fetch";
import { baseURL } from "../../api/api";
import WarningIcon from "../../asset/image/confirm.png";
import notify from 'devextreme/ui/notify';
import { Button } from "devextreme-react/button";

// Export to excel library
import { exportDataGrid as exportDataGridToExcel } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

// Export to pdf library
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { jsPDF } from "jspdf";
// Default export is a4 paper, portrait, using millimeters for units

const renderLabel = () => <div className="toolbar-label">Danh mục phường xã</div>;
const exportFormats = ['xlsx', 'pdf'];

const statuses = ['Chọn', 'Tỉnh Sóc Trăng', 'Thành phố Hà Nội', 'Tỉnh Kiên Giang', 'Thành phố Hồ Chí Minh'];
const cityStatuses = ['Chọn', 'Huyện Gò Quao', 'Huyện Sóc Sơn', 'Quận Bắc Từ Liêm', 'Huyện Đồng Văn'];
const statusLabel = { 'aria-label': 'Status' };

$('.dx-datagrid-addrow-button .dx-button-text').text('Thêm');

const DanhMucPhuongXaPage = () => {
  //#region Property
  const dataGridRef = useRef(null);

  const [isPopupVisible, setPopupVisibility] = useState(false);
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);

  const allowedPageSizes = [50, 100, 150, 200];
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [tenQuanHuyenFilter, setTenQuanHuyenFilter] = useState('');
  const [tenTinhThanhPhoFilter, setTenTinhThanhPhoFilter] = useState("");

  const [tenXaSearch, setTenXaSearch] = useState("");

  const [filterStatus, setFilterStatus] = useState(statuses[0]);
  const [filterHuyenStatus, setFilterHuyenStatus] = useState(statuses[0]);

  const [dataSource, setDataSource] = useState([]);
  const [contentData, setContentData] = useState();
  //#endregion

  //#region Action
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

    fetchData().then(data => { setContentData(data); setDataSource(data) })
  }, []);

  function removeVietNameseAccents(str) {
    let accentsMap = [
      "aàảãáạăằẳẵắặâầẩẫấậ",
      "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
      "dđ", "DĐ",
      "eèẻẽéẹêềểễếệ",
      "EÈẺẼÉẸÊỀỂỄẾỆ",
      "iìỉĩíị",
      "IÌỈĨÍỊ",
      "oòỏõóọôồổỗốộơờởỡớợ",
      "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
      "uùủũúụưừửữứự",
      "UÙỦŨÚỤƯỪỬỮỨỰ",
      "yỳỷỹýỵ",
      "YỲỶỸÝỴ"
    ];

    for (let i = 0; i < accentsMap.length; i++) {
      let re = new RegExp('[' + accentsMap[i].substr(1) + ']', 'g');
      let char = accentsMap[i][0];
      str = str.replace(re, char);
    }
    return str;
  }

  const refreshDataGrid = useCallback(() => {
    dataGridRef.current.instance.refresh();
    console.log("Reloaded")
  }, []);

  const clearFilter = useCallback(() => {
    dataGridRef.current.instance.clearFilter();
  }, []);

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

      let selectedRows = selectedItemKeys.length;
      const customText = `Xóa thành công `;
      const customText2 = ` mục`;
      const message = customText + selectedRows + customText2;

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

  const onTenTinhFilterValueChanged = useCallback(({ value }) => {
    const dataGrid = dataGridRef.current.instance;

    if (value === 'Chọn') {
      dataGrid.clearFilter();
    } else {
      dataGrid.clearFilter();
      dataGrid.filter(['TEN_TINH', '=', value]);
    }

    setFilterStatus(value);
  }, []);

  const onTenHuyenFilterValueChanged = useCallback(({ value }) => {
    const dataGrid = dataGridRef.current.instance;

    if (value === 'Chọn') {
      dataGrid.clearFilter();
    } else {
      dataGrid.clearFilter();
      dataGrid.filter(['TEN_HUYEN', '=', value]);
    }

    setFilterHuyenStatus(value);
    console.log(value)
  }, []);

  const onTenXaValueChanged = useCallback(
    (e) => {
      const dataGrid = dataGridRef.current.instance;
      if (e.target.value === '') {
        setTenXaSearch("")
        dataGrid.clearFilter();
      } else {
        let filter = e.target.value;
        dataGrid.refresh();

        // Load data after filtering
        setTenXaSearch(filter);
      }
    }, [setTenXaSearch]);

  useEffect(() => {
    let ds = dataSource.filter(el => {
      // if (el.TEN.normalize("NFC").toLowerCase().includes(tenXaSearch.normalize("NFC").toLowerCase())) {
      if (removeVietNameseAccents(el.TEN).toLowerCase()
        .includes(removeVietNameseAccents(tenXaSearch).toLowerCase())) {
        return el;
      }
    });
    setContentData(ds);
  }, [tenXaSearch, dataSource]);

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

  const selectedRows = selectedItemKeys.length;
  function onExporting(e) {
    // if (e.format === 'xlsx') {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Danh mục');

    if (selectedRows === 0) {
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

    if (selectedRows === 0) {
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
        <div className='item-filter'>
          <label className='items-filter-label'>Tên tỉnh</label>
          <SelectBox
            className='select-wrapper'
            items={statuses}
            inputAttr={statusLabel}
            value={filterStatus}
            onValueChanged={onTenTinhFilterValueChanged}
          />
        </div>

        <div className='item-filter'>
          <label className='items-filter-label'>Tên huyện</label>
          <SelectBox
            className='select-wrapper'
            // items={cityStatuses}
            dataSource={cityStatuses}
            inputAttr={statusLabel}
            value={filterHuyenStatus}
            onValueChanged={onTenHuyenFilterValueChanged}
          />
        </div>

        <div className='item-filter'>
          <label className='items-filter-label'>Tìm Xã onChange</label>

          <div className='input-wrapper'>
            {/* <TextBox
              className='ship-country-filter search-input'
              type='text'
              value={tenXaSearch}
              valueChangeEvent="keyup"
              // onValueChanged={onTenHuyenFilterValueChanged}
              onChange={onTenHuyenFilterValueChanged}
              placeholder="Search..."
            >

            </TextBox> */}
            <input
              className='ship-country-filter search-input'
              type='text'
              value={tenXaSearch}
              onChange={onTenXaValueChanged}
              // onValueChanged={onTenXaValueChanged}
              placeholder='Search...'
            />
          </div>
        </div>

        {/* 
          <div className="item-filter">
            <label className='items-filter-label'>Tìm xã onClick</label>

            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Tìm xã onClick"
                value={searchValue}
                onChange={handleSearchInputChange}
              />
            </div>
          </div> 
        */}
      </div>

      <div className="responsive-paddings">
        <DataGrid
          id="grid-container"
          className='data-grid'
          dataSource={contentData}
          ref={dataGridRef}
          keyExpr="ID"
          width="100%"
          height="100%"
          showBorders={true}
          focusedRowEnabled={true}
          remoteOperations={false}
          repaintChangesOnly={true}
          allowColumnReordering={false}
          onExporting={onExporting}
          onSelectionChanged={onSelectionChanged}
          onPageChanged={onPageChanged}
        // loadOptions={{
        //   searchValue: tenXaSearch,
        // }}
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
          />

          <Column caption="Tên tỉnh"
            dataField="TEN_TINH"
            alignment='left'
            allowSearch={false}
            width={200}
            hidingPriority={2}
            filterOperations={['custom']}
            calculateFilterExpression={() => {
              return ['contains', 'TEN_TINH', tenTinhThanhPhoFilter, tenXaSearch];
            }}
          />

          <Column
            caption="Tên huyện"
            dataField="TEN_HUYEN"
            alignment="left"
            width={200}
            hidingPriority={1}
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

          <Column
            hidingPriority={1}
            allowSearch={false}
            allowExporting={false}
            allowEditing={false}
            allowReordering={false}
            allowFiltering={false}
          />

          <Toolbar>
            <Item location="left" locateInMenu="never" render={renderLabel} />

            {/* <Item location="after" showText="always" widget="dxButton" >
              <Button widget="dxButton" onClick={handleSearchButtonClick} text="Tìm kiếm"></Button>
            </Item> */}

            <Item location='after' name='exportExcelButton' options={exportExcelButtonOptions}>
              <Button className="export-excel-button" onClick={onExporting}>Xuất Excel</Button>
            </Item>

            <Item location='after' name='exportPdfButton' formats="pdf" options={exportPdfButtonOptions}>
              <Button className="export-pdf-button" onClick={onPdfExporting}>Xuất Pdf</Button>
            </Item>
          </Toolbar>

          <Grouping autoExpandAll={false} />
          <ColumnFixing enabled={false} />
          <FilterRow visible={false} allowFiltering={true} showResetValues={true} />
          <HeaderFilter enabled={false} visible={false} />
          <GroupPanel visible={false} />
          <Export enabled={true} formats={exportFormats} allowExportSelectedData={true} />
          <Paging enabled={true} defaultPageSize={50} defaultPageIndex={0} />
          <Pager showPageSizeSelector={true} allowedPageSizes={allowedPageSizes} showNavigationButtons={true} displayMode="full" />
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

export default DanhMucPhuongXaPage;

const exportExcelButtonOptions = {
  text: 'Xuất excel'
};

const exportPdfButtonOptions = {
  text: 'Xuất pdf'
};
