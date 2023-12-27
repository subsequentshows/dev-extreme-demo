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
import { Popup, Position, ToolbarItem } from 'devextreme-react/popup';
import SelectBox from 'devextreme-react/select-box';
import { Button } from "devextreme-react/button";
import notify from 'devextreme/ui/notify';

const PhanQuyen = () => {
  const [phuongXaData, setPhuongXaData] = useState([]);
  const [selectedXa, setSelectedXa] = useState('-1');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/DanhMuc/GetDMPhuongXa`);
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
            showBorders={true}
          >
          </DataGrid>

          <div className="margin_top_line required rcbTruong-wrapper">
            <select
              placeholder='Chọn xã'
              value={selectedXa}
              onChange={(e) => setSelectedXa(e.target.value)}
            >
              <option value="-1">Chọn xã</option>

              {Array.isArray(phuongXaData.Data) &&
                phuongXaData.Data.map((value) => (
                  <option key={value.MA} value={value.MA}>
                    {value.TEN}
                  </option>
                ))
              }
            </select>
          </div>

        </div>
      </div>
    </>
  )
};


export default PhanQuyen;


