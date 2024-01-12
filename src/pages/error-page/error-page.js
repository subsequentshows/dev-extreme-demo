// import React from "react";

// const ErrorPage = () => {
//   return (
//     <>
//       <div className="responsive-paddings">
//         <h5>Trang không tồn tại</h5>
//       </div>
//     </>
//   )
// }

// export default ErrorPage;

import React, { useCallback, useState, useRef } from "react";
import DataGrid, { Column, DataGridTypes, Editing } from 'devextreme-react/data-grid';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import 'whatwg-fetch';
import { baseURL } from '../../api/api';
import CustomStore from "devextreme/data/custom_store";

let api_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOZ3VvaUR1bmdJZCI6IjEiLCJNQV9IVVlFTiI6IjAwMSIsIk1BX1RJTkgiOiIwMSIsIk1BX1hBIjoiMDAwMDciLCJuYmYiOjE3MDM4MjA5NDksImV4cCI6MTc2MzgyMDg4OSwiaWF0IjoxNzAzODIwOTQ5LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjQ0MzAwIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo0NDMwMCJ9.m-PSJWciAyy9VwezqvX6A2RFqe9WiEiST8htiMeTHYQ";

const config = {
  headers: {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${api_token}`,
  }
};

function getConfig(options) {
  options.onBeforeSend = function (method, ajaxOptions) {
    ajaxOptions.headers = {
      "Authorization": `Bearer ${api_token}`
    }
  }
  return options;
}

// const dataSource = createStore(getConfig(
//   {
//     key: 'MenuId',
//     loadUrl: `${baseURL}/Manager/Menu`,
//   }
// ));

async function sendBatchRequest(url, changes) {
  const result = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(changes),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8', //'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${api_token}`,
    },
    credentials: 'include',
  });

  if (!result.ok) {
    throw new Error(`HTTP error! Status: ${result.status}`);
    // throw result.Message;
  }

  const data = await result.json();
  return data.Data;
}

async function processBatchRequest(url, changes, component) {
  await sendBatchRequest(url, changes);
  await component.refresh(true);

  component.cancelEditData();
}

const onSaving = (e) => {
  e.cancel = true;

  if (e.changes.length) {
    e.promise = processBatchRequest(`${baseURL}/Manager/Menu/UpdateMenu`, e.changes, e.component);
    console.log(e.changes)
    console.log(e.component)
  }
};

const App = () => {
  const [dataSource, setDataSource] = useState(
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
          console.error("Error fetching data:", error);
          return [];
        }
      },
    })
  );

  return (
    <DataGrid
      id="gridContainer"
      dataSource={dataSource}
      key="MenuID"
      showBorders={true}
      remoteOperations={false}
      repaintChangesOnly={true}
      width="100%"
      onSaving={onSaving}
    >

      <Editing
        mode="batch"
        allowAdding={true}
        allowDeleting={true}
        allowUpdating={true}
      />

      <Column dataField="MenuId" allowEditing={false} width={100}></Column>
      <Column dataField="MenuName" width={180}></Column>
      <Column dataField="Link" alignment="left"></Column>
    </DataGrid>
  );
}

export default App;
