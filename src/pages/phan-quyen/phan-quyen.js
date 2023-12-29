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

const dataSource2 = createStore({
  key: 'OrderID',
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

  useEffect(() => {
    // const fetchData = () => {
    //   axios.get(`${baseURL}/DanhMuc/GetDMPhuongXa`)
    //     .then(response => setPhuongXaData(response.data))
    //     .catch(ex => console.error('Error fetching PhuongXa data:', ex));
    // };

    axios.get(`${baseURL}/DanhMuc/GetDMPhuongXa`)
      .then(response => setPhuongXaData(response.data))
      .catch(ex => console.error('Error fetching PhuongXa data:', ex));

    // fetchData();
  }, []);

  return (
    <>
      <div className={'content-block'}>
        <div className={'dx-card responsive-paddings'}>
          <DataGrid dataSource={phuongXaData.Data} >
          </DataGrid>
        </div>
      </div>
    </>
  )
};


export default PhanQuyen;


