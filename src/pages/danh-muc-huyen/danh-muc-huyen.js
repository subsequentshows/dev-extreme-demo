import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Column,
  DataGrid,
  FilterRow,
  HeaderFilter,
  GroupPanel,
  Grouping,
  Paging,
  Pager,
  ColumnFixing,
  Export,
  Toolbar,
  Item
} from 'devextreme-react/data-grid';
import './danh-muc-huyen.scss';
import notify from 'devextreme/ui/notify';
import axios, { isCancel, AxiosError } from 'axios';
import CustomStore from "devextreme/data/custom_store";
import { baseURL } from '../../api/api';
import { Popup, ToolbarItem } from 'devextreme-react/popup';
import { SelectBox } from "devextreme-react/select-box";
import LoadIndicator from "devextreme-react/load-indicator";
import {
  Validator,
  RequiredRule,
  CompareRule,
  EmailRule,
  PatternRule,
  StringLengthRule,
  RangeRule,
  AsyncRule,
  CustomRule,
} from "devextreme-react/validator";
import { fetchAllTinh } from "../../api/DmTinh";
import { fetchHuyenByMaTinh } from "../../api/DmHuyen";
import { fetchXaByMaHuyenByMaTinh } from "../../api/DmXa";

const DanhMucHuyenPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [contentData, setContentData] = useState();
  const dataGridRef = useRef(null);

  const [tenQuanHuyenFilter, setTenQuanHuyenFilter] = useState('');
  const [tenTinhThanhPhoFilter, setTenTinhThanhPhoFilter] = useState("");

  const [tenXaSearch, setTenXaSearch] = useState("");

  const [filterStatus, setFilterStatus] = useState();
  const [filterCityStatus, setFilterCityStatus] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingTinh, setLoadingTinh] = useState(false);
  const [loadingHuyen, setLoadingHuyen] = useState(false);
  const [loadingXa, setLoadingXa] = useState(false);
  const [dmTinh, setDmTinh] = useState({});
  const [dmHuyen, setDmHuyen] = useState({});
  const [dmXa, setDmXa] = useState({});
  const [maTinh, setMaTinh] = useState("");
  const [maHuyen, setMaHuyen] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [maXa, setMaXa] = useState("");

  useEffect(() => {
    var fetchData = async () => {
      try {
        const response = await fetch(
          `${baseURL}/DanhMuc/GetDMPhuongXa`
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
    }

    fetchData().then(data => { setContentData(data); setDataSource(data) })
  }, []);

  useEffect(() => {
    getDmTinh();
  }, []);

  useEffect(() => {
    let arr = [];
    maTinh.MA && arr.push(maTinh.MA);
    if (arr && arr.length) {
      setLoadingHuyen(true);
      setLoadingXa(true);
      getDmHuyen(arr);
      setTimeout(() => {
        setLoadingHuyen(false);
        setLoadingXa(false);
      }, 500);
    }
  }, [maTinh]);

  useEffect(() => {
    let arrMaTinh = [];
    let arrMaHuyen = [];
    maTinh.MA && arrMaTinh.push(maTinh.MA);
    maHuyen.MA && arrMaHuyen.push(maHuyen.MA);
    if (arrMaTinh && arrMaTinh.length && arrMaHuyen && arrMaHuyen.length) {
      setLoadingXa(true);
      getDmXa(arrMaTinh, arrMaHuyen);
      setTimeout(() => {
        setLoadingXa(false);
      }, 500);
    }
  }, [maTinh, maHuyen]);

  const getDmTinh = async () => {
    let res = await fetchAllTinh();
    if (res && res.Data) {
      setDmTinh(res.Data);
    }
  };

  const getDmHuyen = async (arr) => {
    let res = await fetchHuyenByMaTinh(0, 0, arr, "");
    if (res && res.Data && res.Data.Data) {
      setDmHuyen(res.Data.Data);
    }
  };

  const getDmXa = async (arrMaTinh, arrMaHuyen) => {
    let res = await fetchXaByMaHuyenByMaTinh(
      0,
      0,
      arrMaTinh,
      arrMaHuyen,
      "",
      ""
    );
    if (res && res.Data && res.Data.Data) {
      setDmXa(res.Data.Data);
    }
  };

  const onTenXaFilterValueChanged = useCallback(({ value }) => {
    const dataGrid = dataGridRef.current.instance;

    if (value === 'Chọn') {
      dataGrid.clearFilter();
    } else {
      dataGrid.clearFilter();
      dataGrid.filter(['TEN_HUYEN', '=', value]);
    }

    setFilterCityStatus(value);
  }, []);

  const onTenXaValueChanged = useCallback(
    (e) => {
      const dataGrid = dataGridRef.current.instance;
      if (e.target.value === '') {
        setTenXaSearch("")
        dataGrid.clearFilter();
      } else {
        let filter = e.target.value;
        dataGrid.refresh();

        // Load data after filtering
        setTenXaSearch(filter);

      }
    }, [setTenXaSearch]);

  return (
    <>
      <div className="item-filter-wrapper responsive-paddings">
        {/* Tinh/TP */}
        <div className="item-filter">
          <label className="items-filter-label">Tỉnh/ Thành phố</label>
          <SelectBox
            dataSource={dmTinh}
            displayExpr="TEN"
            searchEnabled={true}
            placeholder="Chọn Tỉnh"
            searchMode="contains"
            searchExpr="TEN"
            searchTimeout={200}
            minSearchLength={0}
            onValueChanged={(e) => setMaTinh(e.value)}
            disabled={loadingTinh}
            validationMessageMode="always"
          >
            <Validator>
              <RequiredRule message="Không được để trống" />
            </Validator>
            {loadingTinh && (
              <LoadIndicator width={"24px"} height={"24px"} visible={true} />
            )}
          </SelectBox>
        </div>

        {/* Huyen */}
        <div className="item-filter">
          <label className="items-filter-label">Mã Huyện</label>
          <SelectBox
            dataSource={dmHuyen}
            displayExpr="TEN"
            searchEnabled={true}
            placeholder="Chọn Huyện"
            searchMode="contains"
            searchExpr="TEN"
            searchTimeout={200}
            minSearchLength={0}
            onValueChanged={(e) => setMaHuyen(e.value)}
            disabled={loadingHuyen}
            validationMessagePosition="bottom"
            validationMessageMode="always"
          >
            <Validator>
              <RequiredRule message="Không được để trống" />
            </Validator>
            {loadingHuyen && (
              <LoadIndicator width={"24px"} height={"24px"} visible={true} />
            )}
          </SelectBox>
        </div>

        <div className="item-filter">
          <label className="items-filter-label">Mã Xã</label>
          <SelectBox
            dataSource={dmXa}
            displayExpr="TEN"
            searchEnabled={true}
            placeholder="Chọn Xã"
            searchMode="contains"
            searchExpr="TEN"
            searchTimeout={200}
            minSearchLength={0}
            disabled={loadingXa}
            validationMessageMode="always"
            value={filterCityStatus}
            // onValueChanged={(e) => setMaXa(e.value)}
            onValueChanged={onTenXaFilterValueChanged}
          >
            <Validator>
              <RequiredRule message="Không được để trống" />
            </Validator>
            {loadingXa && (
              <LoadIndicator width={"24px"} height={"24px"} visible={true} />
            )}
          </SelectBox>
        </div>

        <div className='item-filter'>
          <label className='items-filter-label'>Tìm Xã onChange</label>

          <div className='input-wrapper'>
            <input
              className='ship-country-filter search-input'
              type='text'
              value={tenXaSearch}
              onChange={onTenXaValueChanged}
              placeholder='Search...'
            />
          </div>
        </div>
      </div>

      <div className='responsive-paddings'>
        <DataGrid
          id="grid-container"
          className='master-detail-grid'
          key="ID"
          width="100%"
          height="100%"
          dataSource={contentData}
          ref={dataGridRef}
        >

        </DataGrid>
      </div>
    </>
  )
}



export default DanhMucHuyenPage;