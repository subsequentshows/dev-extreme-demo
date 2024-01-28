import React, { useCallback, useState, useRef } from "react";
import {
  Column,
  DataGrid,
  Editing,
  RequiredRule,
  StringLengthRule,
  Toolbar,
  Item,
} from 'devextreme-react/data-grid';
import { Popup, ToolbarItem } from 'devextreme-react/popup';

import CustomStore from "devextreme/data/custom_store";
import notify from 'devextreme/ui/notify';
import WarningIcon from "../../asset/image/confirm.png";
import axios, { isCancel } from 'axios';

import { baseURL } from "../../api/api";

let api_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOZ3VvaUR1bmdJZCI6IjEiLCJNQV9IVVlFTiI6IjAwMSIsIk1BX1RJTkgiOiIwMSIsIk1BX1hBIjoiMDAwMDciLCJuYmYiOjE3MDM4MjA5NDksImV4cCI6MTc2MzgyMDg4OSwiaWF0IjoxNzAzODIwOTQ5LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjQ0MzAwIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo0NDMwMCJ9.m-PSJWciAyy9VwezqvX6A2RFqe9WiEiST8htiMeTHYQ";

// const config = {
//   headers: {
//     'Content-Type': 'multipart/form-data',
//     Authorization: `Bearer ${api_token}`,
//   }
// };

const config = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${api_token}`,
  },
};

const AccessDenied = () => {
  const dataGridRef = useRef(null);

  const rowIndexes = (data) => {
    const pageIndex = data.component.pageIndex();
    const pageSize = data.component.pageSize();
    const rowIndex = pageIndex * pageSize + data.rowIndex + 1;
    return <span> {rowIndex} </span>;
  }

  const [editedValues, setEditedValues] = useState({});
  const [isEditAllPopupVisible, setEditAllPopupVisibility] = useState(false);

  const [dataSource] = useState(
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
          const ErrorMessage = `Đã xảy ra lỗi khi tải dữ liệu: `;
          notify(
            {
              ErrorMessage,
              position: {
                my: 'bottom right',
                at: 'bottom right',
              },
            },
            `error: ${error.message}`,
            5000,
          );
          return [];
        }
      },
    })
  );

  const refreshDataGrid = useCallback(() => {
    dataGridRef.current.instance.refresh();
  }, []);

  const onEditValueChanged = useCallback((e) => {
    console.log('onEditValueChanged called:', e);

    const { MenuId } = e.data;
    const columnName = e.column.dataField;

    setEditedValues((prevValues) => {
      const existingItem = prevValues.find((item) => item.MenuId === MenuId);

      if (existingItem) {
        // Update existing item
        return prevValues.map((item) =>
          item.MenuId === MenuId ? { ...item, [columnName]: e.value } : item
        );
      } else {
        // Add a new item
        return [...prevValues, { MenuId, [columnName]: e.value }];
      }
    });
  }, []);

  const updateEditedRowsToServer = useCallback(async () => {
    try {
      console.log(editedValues)
      console.log(editedValues.length)

      // Check if there are any edited values
      if (editedValues.length === 0 && editedValues !== undefined) {
        notify("Không có giá trị nào được chỉnh sửa.", "info", 3000);
        return;
      }

      // Send the updated data to the server
      const response = await axios.post(
        `${baseURL}/Manager/Menu/UpdateMenu`, // Replace with your actual update endpoint
        [editedValues],
        config
      );

      if (response.status === 200) {
        // Handle successful response, if needed
        notify("Cập nhật dữ liệu thành công.", "success", 3000);
        // Clear edited values after successful update
        setEditedValues([]);
        // Refresh the data grid to reflect changes
        refreshDataGrid();
      } else {
        notify("Có lỗi xảy ra khi cập nhật dữ liệu.", "error", 3000);
      }
    } catch (error) {
      if (!isCancel(error)) {
        notify(`Đã xảy ra lỗi: ${error.message}`, "error", 5000);
      }
    }

  }, [editedValues, refreshDataGrid]);

  const toggleEditAllPopup = useCallback(() => {
    setEditAllPopupVisibility(!isEditAllPopupVisible);

  }, [isEditAllPopupVisible]);

  const getEditAllButtonOptions = useCallback(() => ({
    text: 'Đồng ý',
    stylingMode: 'contained',
    onClick: () => {
      toggleEditAllPopup();
      updateEditedRowsToServer();
    },
  }), [toggleEditAllPopup, updateEditedRowsToServer]);

  const getEditAllCloseButtonOptions = useCallback(() => ({
    text: 'Đóng',
    stylingMode: 'outlined',
    type: 'normal',
    onClick: toggleEditAllPopup,
  }), [toggleEditAllPopup]);

  return (
    <>
      <DataGrid
        id="grid-container"
        className='master-detail-grid'
        dataSource={dataSource}
        ref={dataGridRef}
        width="100%"
        height="100%"
        key="ID"
        showBorders={true}
        focusedRowEnabled={true}
        repaintChangesOnly={true}
        allowColumnReordering={false}
        remoteOperations={false}
        onEditValueChanged={onEditValueChanged}
      >
        <Editing mode="batch"
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
          allowSorting={true}
          allowReordering={false}
          allowSearch={false}
          allowFiltering={false}
          allowExporting={true}
          cellRender={rowIndexes}
          headerCellTemplate="STT"
          all
        >
        </Column>

        <Column caption="MenuID"
          dataField="MenuId"
          fixed={true}
          fixedPosition="left"
          alignment='center'
          width={100}
          hidingPriority={2}
          allowEditing={false}
          allowSorting={true}
          allowReordering={false}
          allowSearch={false}
          allowFiltering={false}
          allowExporting={true}
          headerCellTemplate="MenuID"
        >
        </Column>

        <Column caption="Tên"
          dataField="MenuName"
          fixed={true}
          fixedPosition="left"
          alignment='left'
          width={300}
          allowEditing={true}
          allowSorting={true}
          allowReordering={false}
          allowSearch={false}
          allowFiltering={false}
          allowExporting={true}
          headerCellTemplate="Tên"
        >
          <RequiredRule message="Bạn chưa nhập vào tên" />
          <StringLengthRule message="Tên thư mục phải chứa tối thiểu 2 ký tự" min={2} max={50} />
        </Column>

        <Column caption="Đường dẫn"
          dataField="Link"
          fixed={false}
          fixedPosition="left"
          alignment='left'
          width={300}
          hidingPriority={1}
          allowEditing={true}
          allowSorting={true}
          allowReordering={false}
          allowSearch={false}
          allowFiltering={false}
          allowExporting={true}
          headerCellTemplate="Đường dẫn"
        >
        </Column>

        <Column caption=""
          fixed={false}
          fixedPosition="left"
          alignment='left'
          hidingPriority={1}
          allowEditing={false}
          allowSorting={false}
          allowReordering={false}
          allowSearch={false}
          allowFiltering={false}
          allowExporting={false}
        >
        </Column>

        <Toolbar>
          <Item location="after"
            name="addRowButton"
            caption="Thêm"
            options={addButtonOptions}
            locateInMenu="auto"
          />

          <Item
            widget="dxButton"
            location="after"
            options={{
              text: 'Ghi',
              onClick: toggleEditAllPopup
            }}
          />
        </Toolbar>

      </DataGrid>

      {/* Update all confirm popup */}
      <Popup
        id="popup"
        visible={isEditAllPopupVisible}
        hideOnOutsideClick={true}
        onHiding={toggleEditAllPopup}
        dragEnabled={false}
        showCloseButton={true}
        showTitle={true}
        title="Thông báo"
        container=".dx-viewport"
        width={500}
        height={300}
      >
        <div className="">
          <div className='warning-icon'>
            <img src={WarningIcon} alt='icon-canh-bao' />
          </div>
          <p>Bạn có chắc chắn là muốn thực hiện thao tác này !!!</p>
        </div>

        <ToolbarItem
          widget="dxButton"
          toolbar="bottom"
          location="center"
          options={getEditAllButtonOptions()}
        />
        <ToolbarItem
          widget="dxButton"
          toolbar="bottom"
          location="center"
          options={getEditAllCloseButtonOptions()}
        />
      </Popup>
    </>
  );
}

const addButtonOptions = {
  text: 'Thêm'
};

export default AccessDenied;