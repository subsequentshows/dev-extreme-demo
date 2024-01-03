import React, { useState, useEffect } from 'react';
import './phan-quyen.scss';
import axios from 'axios';
import { baseURL } from '../../api/api';
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
} from 'devextreme-react/data-grid';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import CustomStore from 'devextreme/data/custom_store';
import { Popup, Position, ToolbarItem } from 'devextreme-react/popup';
import SelectBox from 'devextreme-react/select-box';
import { Button } from "devextreme-react/button";
import notify from 'devextreme/ui/notify';
import MasterDetailGrid from '../error-page/error-page';
import ErrorPage from '../error-page/error-page';
import { formatDate } from 'devextreme/localization';
import 'whatwg-fetch';

const refreshModeLabel = { 'aria-label': 'Refresh Mode' };
const URL = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';

const REFRESH_MODES = ['full', 'reshape', 'repaint'];

// const dataSource = createStore({
//   key: 'name',
//   // loadUrl: `${baseURL}/DanhMuc/GetDMPhuongXa`,
//   // insertUrl: `${baseURL}/InsertOrder`,
//   // updateUrl: `${baseURL}/UpdateOrder`,
//   // deleteUrl: `${baseURL}/DeleteOrder`,

//   // onBeforeSend: (method, ajaxOptions) => {
//   //   ajaxOptions.xhrFields = { withCredentials: true };
//   // }
// });

const dataSource = createStore({
  key: "ID",
  loadUrl: `${baseURL}/DanhMuc/GetDMPhuongXa`,
  // insertUrl: `${url}/InsertOrder`,
  // updateUrl: `${url}/UpdateOrder`,
  // deleteUrl: `${url}/DeleteOrder`,

  onBeforeSend: (method, ajaxOptions) => {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

const PhanQuyen = () => {
  const [phuongXaData, setPhuongXaData] = useState([]);
  const [selectedXa, setSelectedXa] = useState('-1');
  const [requests, setRequests] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/DanhMuc/GetDMPhuongXa`);
        setPhuongXaData(response.data);

      } catch (error) {
        console.error('Error fetching PhuongXa data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div className={'content-block'}>
        <div className={'dx-card responsive-paddings'}>
          <DataGrid
            dataSource={phuongXaData.Data}
            showBorder={true}
          >
          </DataGrid>
        </div>
      </div>
    </>
  )
};


export default PhanQuyen;


