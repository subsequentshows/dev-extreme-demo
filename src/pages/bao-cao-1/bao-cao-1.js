import React, { useEffect, useState } from 'react';
import { baseURL } from '../../api/api';
import $ from 'jquery';
import { formatDate, formatNumber } from 'devextreme/localization';

import DataGrid, {
  Paging,
  Pager, Column, Summary,
  TotalItem,
} from 'devextreme-react/data-grid';

const App = () => {
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
        >
          <Column dataField="ID" width={50} hidingPriority={0} alignment='center' allowResizing={false}></Column>
          <Column dataField="MA" width={80} hidingPriority={1} format={"currency"}></Column>
          <Column dataField="TEN" width={180}></Column>

          <Column caption='Huyen' alignment='center'>
            <Column dataField="MA_HUYEN" alignment='right' caption="Ma huyen" format="currency" width={150} hidingPriority={2}></Column>
            <Column dataField="TEN_HUYEN" caption="Ten huyen" width={180} hidingPriority={4}></Column>
          </Column>

          <Column caption='Tinh' alignment='center'>
            <Column dataField="TEN_TINH" caption="Ten tinh" width={180} hidingPriority={5} />
            <Column dataField="MA_TINH" width={160} alignment="right" format="currency" />
          </Column>

          <Column dataField="MA_HUYEN" alignment='right' caption="Ma huyen" format="currency" width={50} hidingPriority={2}></Column>
          <Column dataField="MA_HUYEN" alignment='right' caption="Ma huyen" format="currency" width={50} hidingPriority={2}></Column>
          <Column dataField="MA_HUYEN" alignment='right' caption="Ma huyen" format="currency" width={50} hidingPriority={2}></Column>
          <Column dataField="MA_HUYEN" alignment='right' caption="Ma huyen" format="currency" width={50} hidingPriority={2}></Column>
          <Column dataField="MA_HUYEN" alignment='right' caption="Ma huyen" format="currency" width={50} hidingPriority={2}></Column>

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

export default App;