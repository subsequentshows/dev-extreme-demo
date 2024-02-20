import React from 'react';
import { PivotGrid, Scrolling, FieldPanel } from 'devextreme-react/pivot-grid';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import { baseURL } from '../../api/api';

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
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${api_token}`
    }
  }
  return options;
}

const dataSource = createStore({
  key: 'ID',
  loadUrl: `${baseURL}/MN/BaoCaoTaiChinh/Get`,
  // insertUrl: `${url}/InsertOrder`,
  // updateUrl: `${url}/UpdateOrder`,
  // deleteUrl: `${url}/DeleteOrder`,

  onBeforeSend: (method, ajaxOptions) => {
    ajaxOptions.headers = {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${api_token}`,
      withCredentials: true
    };
  },

  fields: [
    {
      caption: 'NOI_DUNG_CHA',
      dataField: 'NOI_DUNG_CHA',
      width: 250,
      expanded: true,
      sortBySummaryField: 'SalesAmount',
      sortBySummaryPath: [],
      sortOrder: 'desc',
      area: 'row',
    },
    {
      caption: 'NOI_DUNG',
      dataField: 'NOI_DUNG',
      width: 250,
      sortBySummaryField: 'SalesAmount',
      sortBySummaryPath: [],
      sortOrder: 'desc',
      area: 'row',
    },
    {
      caption: 'DON_VI',
      dataField: 'DON_VI',
      area: 'row',
      sortBySummaryField: 'SalesAmount',
      sortBySummaryPath: [],
      sortOrder: 'desc',
      width: 250,
    },
    {
      caption: 'Date',
      dataField: 'DateKey',
      dataType: 'date',
      area: 'column',
    },
    {
      caption: 'Amount',
      dataField: 'SalesAmount',
      summaryType: 'sum',
      format: 'currency',
      area: 'data',
    },
    {
      caption: 'Store',
      dataField: 'StoreName',
    },
    {
      caption: 'Quantity',
      dataField: 'SalesQuantity',
      summaryType: 'sum',
    },
    {
      caption: 'Unit Price',
      dataField: 'UnitPrice',
      format: 'currency',
      summaryType: 'sum',
    },
    {
      dataField: 'Id',
      visible: false,
    },
  ],
});

const dataSource2 = {
  remoteOperations: false,
  store: createStore({
    key: 'OrderID',
    loadUrl: `${baseURL}/MN/BaoCaoTaiChinh/Get`,

    onBeforeSend: (method, ajaxOptions) => {
      ajaxOptions.headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${api_token}`,
        // withCredentials: true
      };
    },
  }),

  fields: [
    {
      caption: 'Nội dung cha',
      dataField: "[Details].[NOI_DUNG_CHA]",
      width: 250,
      expanded: false,
      sortOrder: 'desc',
      area: 'row',
    },
    {
      caption: 'Nội dung',
      dataField: "[Details].[NOI_DUNG]",
      width: 250,
      sortOrder: 'desc',
      area: 'row',
    },
    // {
    //   caption: 'DON_VI',
    //   dataField: 'DON_VI',
    //   area: 'row',
    //   sortBySummaryField: 'SalesAmount',
    //   sortBySummaryPath: [],
    //   sortOrder: 'desc',
    //   width: 250,
    // },
    // {
    //   caption: 'GHI_CHU',
    //   dataField: 'GHI_CHU',
    //   // dataType: 'date',
    //   area: 'column',
    // },
    // {
    //   caption: 'Amount',
    //   dataField: 'SalesAmount',
    //   summaryType: 'sum',
    //   format: 'currency',
    //   area: 'data',
    // },
    // {
    //   caption: 'Store',
    //   dataField: 'StoreName',
    // },
    // {
    //   caption: 'Quantity',
    //   dataField: 'SalesQuantity',
    //   summaryType: 'sum',
    // },
    // {
    //   caption: 'Unit Price',
    //   dataField: 'UnitPrice',
    //   format: 'currency',
    //   summaryType: 'sum',
    // },
    // {
    //   dataField: 'Id',
    //   visible: false,
    // },
  ],
};

const App = () => {
  return (
    <div className='responsive-paddings'>
      <PivotGrid
        dataSource={dataSource2}
        height={620}
        showBorders={true}
        rowHeaderLayout="tree"
        allowSorting={false}
        allowSortingBySummary={false}
        allowFiltering={false}
      >
        <FieldPanel
          // showColumnFields={showColumnFields}
          // showDataFields={showDataFields}
          // showFilterFields={showFilterFields}
          // showRowFields={showRowFields}
          allowFieldDragging={true}
          visible={true}
        />
      </PivotGrid>
    </div>
  );
}
export default App;
