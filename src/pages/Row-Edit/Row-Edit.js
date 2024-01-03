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
  Pager
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

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

const RowEdit = ({ itemsPerPage }) => {
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
  const allowedPageSizes = [50, 100, 150, 200];

  const [filterStatus, setFilterStatus] = useState(statuses[0]);
  const [filterCityStatus, setFilterCityStatus] = useState(statuses[0]);
  const [shipCountryFilter, setShipCountryFilter] = useState('');
  const [shipCityFilter, setShipCityFilter] = useState("");

  const [citySearchTerm, setCitySearchTerm] = useState('');

  //
  const [itemOffset, setItemOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // File upload
  // const [file, setFile] = useState();
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState();
  const [error, setError] = useState();

  // Delete
  const [selectedItems, setSelectedItems] = useState([]);
  const [editedItems, setEditedItems] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/DanhMuc/GetDMPhuongXa`
        );
        // setPhuongXaData(response.data);
        setPhuongXaData(response.data.Data)

      } catch (error) {
        console.error('Error fetching PhuongXa data:', error);
      }
    };
    fetchData();
  }, []);

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

  const onPageChanged = (e) => {
    setCurrentPageIndex(e.component.pageIndex());
  };

  const rowIndexes = (data) => {
    const pageIndex = data.component.pageIndex();
    const pageSize = data.component.pageSize();
    const rowIndex = pageIndex * pageSize + data.rowIndex + 1;
    return <span> {rowIndex} </span>;
  }

  //
  const handlePageClick = (event) => {
    const newOffset = event.selected * itemsPerPage;

    setItemOffset(newOffset);
  };

  // Search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Delete
  const handleSelectChange = (event, id) => {
    if (event.target.checked) {
      // Add the selected item to the array
      setSelectedItems([...selectedItems, id]);
    } else {
      // Remove the item from the array
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    }
  };

  // Update
  const handleEditItem = (id) => {
    // Set the item to be edited
    setEditedItems((prevEditedItems) => ({
      ...prevEditedItems,
      [id]: { ...phuongXaData.find((phuongXa) => phuongXa.id === id) },
    }));
  };

  const handleUpdateItem = (id) => {
    // Implement your logic for updating the item on the backend
    // Send a request to your backend with the edited item

    // After successful update, clear the edited item
    setEditedItems((prevEditedItems) => {
      const updatedItems = { ...prevEditedItems };
      delete updatedItems[id];
      return updatedItems;
    });
  };

  // Modify the handleInputChange function to update the edited items
  const handleInputChange = (event, id, field) => {
    const { value } = event.target;
    setEditedItems((prevEditedItems) => ({
      ...prevEditedItems,
      [id]: { ...prevEditedItems[id], [field]: value },
    }));
  };
  const handleUpdateSelected = () => {
    // Implement your logic for updating the selected items on the backend
    // Send a request to your backend with the editedItems array

    // After successful update, clear the selected and edited items
    setSelectedItems([]);
    setEditedItems({});
  };

  // const handleDeleteSelected = () => {
  //   // Filter out the selected items from the 'phuongXaData' array
  //   const updatedPokemons = phuongXaData.filter((phuongXa) => !selectedItems.includes(phuongXa.id));

  //   // Update the state with the modified array
  //   setPhuongXaData(updatedPokemons);

  //   // Clear the selected items
  //   setSelectedItems([]);
  // };

  // const filteredPokemons = phuongXaData.filter((phuongXa) =>
  //   phuongXa.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  function Items({ currentItems, startIndex, searchTerm, onDelete, onSelectChange, selectedItems, onInputChange, onUpdateSelected, onEditItem, onUpdateItem, }) {
    return (
      <>
        {currentItems &&
          currentItems.map((phuongXa, index) => (
            <tr className='items' key={phuongXa.id}>
              <td className={`stt-${startIndex + index + 1}`}>{startIndex + index + 1}</td>
              {/* <td>
                <input
                  type="checkbox"
                  name={phuongXa.name}
                  checked={selectedItems.includes(phuongXa.id)}
                  onChange={(event) => handleSelectChange(event, phuongXa.id)}
                />
              </td> */}
              {/* <td>
                {editedItems[phuongXa.id] ? (
                  <button className='edit-btn ' onClick={() => handleUpdateItem(phuongXa.id)}>Update</button>
                ) : (
                  <button className='edit-btn' onClick={() => handleEditItem(phuongXa.id)}>
                    <Icon.Gear />
                  </button>
                )}
              </td> */}
              <td>{phuongXa.name}</td>
              <td>{phuongXa.ID}</td>
              <td>{phuongXa.MA}</td>
            </tr>
          ))}
      </>
    );
  }

  // Calculating the end offset for the current page
  const endOffset = itemOffset + itemsPerPage;

  // Get the current items for the current page
  // const currentItems = filteredPokemons.slice(itemOffset, endOffset);
  // const pageCount = Math.ceil(filteredPokemons.length / itemsPerPage);

  return (
    <React.Fragment>
      <div className={'content-block responsive-paddings'}>
        <div>
          <div className='item-filter'>
            <div className='search-field'>
              <label>Tên</label>
              <input
                type='text'
                placeholder='Tên'
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <Items
            // currentItems={currentItems}
            startIndex={itemOffset}
            searchTerm={searchTerm}
            // onDelete={handleDeleteSelected}
            onSelectChange={handleSelectChange}
            selectedItems={selectedItems}
            onInputChange={handleInputChange}
            onUpdateSelected={handleUpdateSelected}
            onEditItem={handleEditItem}
            onUpdateItem={handleUpdateItem}
          />
          <DataGrid
            id="gridContainer"
            width="100%"
            height="100%"
            ref={dataGridRef}
            dataSource={phuongXaData}
            allowColumnReordering={false}
            focusedRowEnabled={false}
            showBorders={true}
            remoteOperations={true}
            repaintChangesOnly={true}
            onExporting={onExporting}
            selectedRowKeys={selectedItemKeys}
            onPageChanged={onPageChanged}
          ></DataGrid>

          {/* 

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
              width={180}
              allowEditing={false}
            >
            </Column>

            <Column dataField="MA" caption='Mã' width={120} allowEditing={false}></Column>
            <Column dataField="MA_HUYEN" caption='Mã huyện' width={80} allowEditing={false}></Column>
            <Column dataField="MA_TINH" caption='Mã tỉnh' width={80} allowEditing={false}></Column>
            <Column dataField="TEN_TINH" caption='Tên tỉnh' width={180} allowEditing={false}></Column>
            <Column dataField="TEN_HUYEN" caption='Tên huyện' width={150} allowEditing={false}></Column>

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
            <SearchPanel visible={false} width={240} highlightSearchText={true} searchVisibleColumnsOnly={true} placeholder="Tìm kiếm" />
            <FilterRow visible={false} allowFiltering={false} showResetValues={false} />
            <HeaderFilter enabled={false} visible={false} />
            <GroupPanel visible={false} />
            <Export enabled={true} formats={exportFormats} allowExportSelectedData={true} />
            <Paging enabled={true} defaultPageSize={5} defaultPageIndex={0} />
            <Pager showPageSizeSelector={true} allowedPageSizes={allowedPageSizes} />
          </DataGrid> */}
        </div>
      </div>
    </React.Fragment>
  )
}

export default RowEdit;