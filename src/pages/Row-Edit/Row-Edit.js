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
  RemoteOperations
} from 'devextreme-react/data-grid';
import axios from 'axios';
import { Popup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';

const url = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';

const serviceUrl = 'https://localhost:44300';

const remoteDataSource = createStore({
  key: 'ID',
  loadUrl: serviceUrl + '/api/DanhMuc/GetDMPhuongXa',
  insertUrl: serviceUrl + '/InsertAction',
  updateUrl: serviceUrl + '/UpdateAction',
  deleteUrl: serviceUrl + '/DeleteAction'
});

const dataSource = new DataSource({
  // key: 'ID',
  data: `${url}/api/DanhMuc/GetDMPhuongXa`,
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

const customDataSource = new CustomStore({
  key: 'ID',
  load: (loadOptions) => {
    // ...
  },
  insert: (values) => {
    return fetch('https://mydomain.com/MyDataService', {
      method: 'POST',
      body: JSON.stringify(values),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(handleErrors)
      .catch(() => { throw 'Network error' });
  },
  remove: (key) => {
    return fetch(`https://mydomain.com/MyDataService/${encodeURIComponent(key)}`, {
      method: 'DELETE'
    })
      .then(handleErrors)
      .catch(() => { throw 'Network error' });
  },
  update: (key, values) => {
    return fetch(`https://mydomain.com/MyDataService/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify(values),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(handleErrors)
      .catch(() => { throw 'Network error' });
  }
});

const RowEdit = () => {
  const renderLabel = () => <div className="toolbar-label">1.1. Quản lý thu phí</div>;

  return (
    <React.Fragment>
      <div className={'content-block responsive-paddings'}>
        <div>
          <DataGrid
            id="gridContainer"
            // ref={dataGridRef}
            dataSource={remoteDataSource}
            showBorders={true}
            remoteOperations={true}
            repaintChangesOnly={true}
          >
            <RemoteOperations groupPaging={true} />

            <Column dataField="STT" width={60} allowEditing={false}></Column>
            <Column dataField="ID" width={100} allowEditing={false}></Column>
            <Column dataField="MA"></Column>
            <Column dataField="TEN"></Column>
            <Column dataField="MA_HUYEN"></Column>
            <Column dataField="MA_TINH"></Column>
            <Column dataField="TEN_TINH" caption='Tên tỉnh'></Column>
            <Column dataField="TEN_HUYEN" caption='Tên huyện'></Column>

            <Editing
              mode="row"
              location="center"
              locateInMenu="auto"
              allowAdding={true}
              allowDeleting={true}
              allowUpdating={true}
            />

            <Toolbar>
              <Item
                location="left"
                locateInMenu="never"
                render={renderLabel}
              />
            </Toolbar>
          </DataGrid>

          <Selection mode="multiple" />
          <FilterRow visible={true} />
        </div>
      </div>
    </React.Fragment>
  )
}

export default RowEdit;