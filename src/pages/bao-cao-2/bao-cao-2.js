import React, { useEffect, useState } from 'react';
import { baseURL } from '../../api/api';
import $ from 'jquery';
import { formatDate, formatNumber } from 'devextreme/localization';
import notify from 'devextreme/ui/notify';

import DataGrid, {
  Paging,
  Pager, Column, Summary,
  TotalItem,
} from 'devextreme-react/data-grid';

import CustomStore from "devextreme/data/custom_store";


let api_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOZ3VvaUR1bmdJZCI6IjEiLCJNQV9IVVlFTiI6IjAwMSIsIk1BX1RJTkgiOiIwMSIsIk1BX1hBIjoiMDAwMDciLCJuYmYiOjE3MDM4MjA5NDksImV4cCI6MTc2MzgyMDg4OSwiaWF0IjoxNzAzODIwOTQ5LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjQ0MzAwIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo0NDMwMCJ9.m-PSJWciAyy9VwezqvX6A2RFqe9WiEiST8htiMeTHYQ";

const BaoCao2 = () => {
  const [dataSource, setDataSource] = useState([]);

  const customizeDate = (itemInfo) => {
    return `First: ${formatDate(itemInfo.value, "MMM dd, yyyy")}`;
  }

  const customizeText = (itemInfo) => {
    return `${formatNumber(itemInfo.value, "#,###,##0,000")}`;
  }

  const sumText = () => {
    return `Tổng:`;
  }

  useEffect(() => {
    var fetchData = async () => {
      try {
        const response = await fetch(
          `${baseURL}/MN/BaoCaoTaiChinh/Get`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${api_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.Data.Details;
      } catch (error) {
        console.error("Error fetching data:", error);
        return [];
      }
    }

    fetchData().then(data => {
      setDataSource(data)
    })
  }, []);

  return (
    <>
      <div className='responsive-paddings'>
        <DataGrid
          dataSource={dataSource}
          remoteOperations={false}
          keyExpr="ID"
          focusedRowEnabled={true}
          allowColumnReordering={true}
        >
          <Column dataField="NOI_DUNG" caption="Nội dung" alignment='right' format="currency" width={300} hidingPriority={2}></Column>
          <Column dataField="DON_VI" caption="Đơn vị" width={180} hidingPriority={4}></Column>
          <Column dataField="NOI_DUNG_CHA" caption="Nội dung cha" width={180}></Column>
          <Column dataField="NOI_DUNG_CHA_1" width={100} hidingPriority={1} format={"currency"}></Column>
          <Column dataField="NOI_DUNG_CHA_2" width={150} hidingPriority={0} alignment='center' allowResizing={false}></Column>
          <Column dataField="GHI_CHU" width={160} alignment="right" format="currency" />

          <Column caption='Năm học'>

            <Column dataField='CHI_TIET'></Column>
            <Column dataField='CHI_TIET'></Column>
          </Column>
          <Column className="text" allowHiding={false} hidingPriority={0} />

          <Summary>
            <TotalItem column="TEN" customizeText={sumText} />
            <TotalItem column="MA_HUYEN" summaryType="sum" customizeText={customizeText} />
            <TotalItem column="MA_TINH" summaryType="sum" customizeText={customizeText} />
          </Summary>

          <Pager visible={true} defaultPageSize={10} showInfo={true} showPageSizeSelector={false} showNavigationButtons={true} displayMode='full' />

          <Paging defaultPageSize={10} />
        </DataGrid >
      </div>
    </>
  )
}

export default BaoCao2;