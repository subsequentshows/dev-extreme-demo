import React from 'react';
import { PivotGrid, Scrolling } from 'devextreme-react/pivot-grid';
import PivotGridDataSource from 'devextreme/ui/pivot_grid/data_source';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import { baseURL } from '../../api/api';
import { Data } from './data.js';

let api_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOZ3VvaUR1bmdJZCI6IjEiLCJNQV9IVVlFTiI6IjAwMSIsIk1BX1RJTkgiOiIwMSIsIk1BX1hBIjoiMDAwMDciLCJuYmYiOjE3MDM4MjA5NDksImV4cCI6MTc2MzgyMDg4OSwiaWF0IjoxNzAzODIwOTQ5LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjQ0MzAwIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo0NDMwMCJ9.m-PSJWciAyy9VwezqvX6A2RFqe9WiEiST8htiMeTHYQ";

const dataSource = new PivotGridDataSource({
  fields: [
    {
      caption: 'Region',
      width: 120,
      dataField: 'region',
      area: 'row',
    },
    {
      caption: 'City',
      dataField: 'city',
      width: 150,
      area: 'row',
      selector(data) {
        return `${data.city} (${data.country})`;
      },
    },
    {
      dataField: 'date',
      dataType: 'date',
      area: 'column',
    },
    {
      caption: 'Sales',
      dataField: 'amount',
      dataType: 'number',
      summaryType: 'sum',
      format: 'currency',
      area: 'data',
    },
  ],
  store: Data,
});

const App = () => (
  <div className='responsive-paddings'>
    <PivotGrid
      allowSorting={true}
      allowSortingBySummary={true}
      allowFiltering={true}
      remoteOperations={false}
      height={620}
      showBorders={true}
      rowHeaderLayout="tree"
      dataSource={dataSource}
    >
      {/* <Scrolling mode="virtual" /> */}
    </PivotGrid>
  </div>
);
export default App;
