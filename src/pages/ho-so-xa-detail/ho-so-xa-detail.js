import React, { useRef, useCallback, useEffect, useState } from 'react';
import DataGrid, { Column, Editing, Paging, Form, Selection, Lookup, LoadPanel, Toolbar, Item, DataGridTypes, FilterRow }
  from 'devextreme-react/data-grid';
import { Button } from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import 'whatwg-fetch';
import './ho-so-xa-detail.scss';
import CustomStore from 'devextreme/data/custom_store';
import axios, { isCancel, AxiosError } from 'axios';
import { baseURL } from '../../api/api';

let api_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOZ3VvaUR1bmdJZCI6IjEiLCJNQV9IVVlFTiI6IjAwMSIsIk1BX1RJTkgiOiIwMSIsIk1BX1hBIjoiMDAwMDciLCJuYmYiOjE3MDM4MjA5NDksImV4cCI6MTc2MzgyMDg4OSwiaWF0IjoxNzAzODIwOTQ5LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjQ0MzAwIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo0NDMwMCJ9.m-PSJWciAyy9VwezqvX6A2RFqe9WiEiST8htiMeTHYQ";

const config = {
  headers: {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${api_token}`,
  }
};

const HoSoXaDetailPage = () => {
  const dataGridRef = useRef(null);
  const renderLabel = () => <div className="toolbar-label">Hồ sơ xã detail</div>

  const [contentData, setContentData] = useState(
    new CustomStore({
      key: "MaPhuongXa",
      load: async () => {
        try {
          const response = await fetch(
            `${baseURL}/PhuongXa/HoSoXaDetail`, config
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
    })
  );

  const refreshDataGrid = useCallback(() => {
    dataGridRef.current.instance.refresh();
  }, []);

  const updateRecord = useCallback(
    async (key, values) => {
      try {
        const response = await axios.post(
          `${baseURL}/PhuongXa/HoSoXaDetail/${values}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${api_token}`,
            },
            body: JSON.stringify([{
              MaPhuongXa: key,
              hienThuocVungKhoKhan: values,
            }]),
          }
        );

        if (response.data.Success) {
          refreshDataGrid();

          const message = `Cập nhật thành công  mục`;
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
        } else {
          // Handle the case where the deletion was not successful
          console.error(`Cập nhật không thành công. ErrorCode: ${response.data.ErrorCode}, ErrorMessage: ${response.data.ErrorMessage}`);
          let message = response.data.ErrorMessage;
          notify(
            {
              message,
              position: {
                my: 'after bottom',
                at: 'after bottom',
              },
            },
            'error',
            3000,
          );

        }
      } catch (error) {
        console.error("Lỗi cập nhật: ", error);
        notify(
          {
            error,
            position: {
              my: 'after bottom',
              at: 'after bottom',
            },
          },
          `error: ${error.message}`,
          5000,
        );
      }
    }, [refreshDataGrid]);

  return (
    <>
      <div className={'content-block responsive-paddings'}>
        <DataGrid
          id="gridContainer"
          dataSource={contentData}
          showBorders={true}
          remoteOperations={false}
          repaintChangesOnly={true}
          allowColumnReordering={false}
          focusedRowEnabled={true}
          ref={dataGridRef}
          width="100%"
          height="100%"
        >
          <Editing
            mode="batch"
            location="center"
            locateInMenu="auto"
            allowAdding={true}
            allowUpdating={true}
            allowDeleting={false}
            confirmDelete={false}
          />

          {/* <Column caption="Mã"
            dataField="MaPhuongXa"
            fixed={false}
            alignment='left'
            width={300}
            allowEditing={false}
            allowSorting={false}
            allowReordering={false}
            allowSearch={false}
            allowFiltering={false}
            allowExporting={false}
            headerCellTemplate="Mã"
          >
          </Column>

          <Column caption="TinhThanhPho"
            dataField="TinhThanhPho"
            fixed={false}
            alignment='left'
            width={300}
            allowEditing={false}
            allowSorting={false}
            allowReordering={false}
            allowSearch={false}
            allowFiltering={false}
            allowExporting={false}
            headerCellTemplate="TinhThanhPho"
          >
          </Column>

          <Column caption="TenPhuongXa"
            dataField="TenPhuongXa"
            fixed={false}
            alignment='left'
            width={300}
            allowEditing={false}
            allowSorting={false}
            allowReordering={false}
            allowSearch={false}
            allowFiltering={false}
            allowExporting={false}
            headerCellTemplate="TenPhuongXa"
          >
          </Column>

          <Column caption="HienThuocVungKhoKhan"
            dataField="HienThuocVungKhoKhan"
            fixed={false}
            alignment='left'
            width={300}
            allowEditing={false}
            allowSorting={false}
            allowReordering={false}
            allowSearch={false}
            allowFiltering={false}
            allowExporting={false}
            headerCellTemplate="HienThuocVungKhoKhan"
          >
          </Column> */}

          <Toolbar>
            <Item location="left" locateInMenu="never" render={renderLabel} />

            <Item location="after" showText="always" name='mutiple-delete' widget="dxButton">
              <Button
                onClick={updateRecord}
                widget="dxButton"
                text="Ghi"
              />
            </Item>
          </Toolbar>
        </DataGrid>

        <Selection mode="multiple" />
        <FilterRow visible={true} />
      </div>
    </>
  );
}

export default HoSoXaDetailPage;