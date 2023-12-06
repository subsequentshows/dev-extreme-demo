import React, { useEffect } from 'react';

import 'devextreme/data/odata/store';
import {
  Column,
  DataGrid,
  FilterRow,
  HeaderFilter,
  GroupPanel,
  Scrolling,
  Editing,
  Grouping,
  Paging,
  Lookup,
  MasterDetail,
  Summary,
  RangeRule,
  RequiredRule,
  StringLengthRule,
  GroupItem,
  TotalItem,
  ValueFormat,
  ColumnFixing,
  Export,
  Selection
} from 'devextreme-react/data-grid';

import { createStore } from 'devextreme-aspnet-data-nojquery';
import DetailGrid from './detail-grid';

// Export to excel library
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { exportDataGrid } from 'devextreme/excel_exporter';

// Export to pdf library
import { jsPDF } from "jspdf";
// Default export is a4 paper, portrait, using millimeters for units

const url = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';

const dataSource = createStore({
  key: 'OrderID',
  loadUrl: `${url}/Orders`,
  insertUrl: `${url}/InsertOrder`,
  updateUrl: `${url}/UpdateOrder`,
  deleteUrl: `${url}/DeleteOrder`,
  onBeforeSend: (method, ajaxOptions) => {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

const customersData = createStore({
  key: 'Value',
  loadUrl: `${url}/CustomersLookup`,
  onBeforeSend: (method, ajaxOptions) => {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

const shippersData = createStore({
  key: 'Value',
  loadUrl: `${url}/ShippersLookup`,
  onBeforeSend: (method, ajaxOptions) => {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

// Export to Excel
function onExportingExcel(e) {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('Main sheet');

  exportDataGrid({
    component: e.component,
    worksheet,
    autoFilterEnabled: true,
  }).then(() => {
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'DataGrid.xlsx');
    });
  });
}

// Export to pdf
const exportFormats = ['pdf'];
const doc = new jsPDF();

const onExporting = ((e) => {
  const doc = new jsPDF();

  exportDataGrid({
    jsPDFDocument: doc,
    component: e.component,
    indent: 5,
  }).then(() => {
    doc.save('Companies.pdf');
  });
});

const MasterDetailGrid = () => {
  return (
    <>
      <DataGrid
        dataSource={dataSource}
        showBorders={true}
        width="100%"
        height={600}
        remoteOperations={true}
        onExporting={onExportingExcel, onExporting}
      >

        <MasterDetail
          enabled={true}
          component={DetailGrid}
        />

        <Selection mode="multiple" />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <GroupPanel visible={false} />
        <Scrolling mode="virtual" />
        <Paging defaultPageSize={10} />
        <Export enabled={true} formats={exportFormats} allowExportSelectedData={true} />

        <Editing
          mode="row"
          allowAdding={true}
          allowDeleting={true}
          allowUpdating={true}
        />

        <Grouping autoExpandAll={false} />

        <Column dataField="CustomerID" caption="Customer" fixed={true}>
          <Lookup dataSource={customersData} valueExpr="Value" displayExpr="Text" />
          <StringLengthRule max={5} message="The field Customer must be a string with a maximum length of 5." />
        </Column>

        <Column dataField="OrderDate" dataType="date" width={150}>
          <RequiredRule message="The OrderDate field is required." />
        </Column>

        <Column dataField="Freight" width={130}>
          <HeaderFilter groupInterval={100} />
          <RangeRule min={0} message="The field Freight must be between 0 and 2000." />
        </Column>

        <Column dataField="ShipCountry" width={200}>
          <StringLengthRule max={15} message="The field ShipCountry must be a string with a maximum length of 15." />
        </Column>

        <Column dataField="ShipLocation" allowFiltering={false} >
          <StringLengthRule max={15} message="The field ShipLocation must be a string with a maximum length of 15." />
        </Column>

        <Column
          dataField="ShipVia"
          caption="Shipping Company"
          dataType="number"
        >
          <Lookup dataSource={shippersData} valueExpr="Value" displayExpr="Text" />
        </Column>

        <Summary>
          <TotalItem column="Freight" summaryType="sum">
            <ValueFormat type="decimal" precision={2} />
          </TotalItem>

          <GroupItem column="Freight" summaryType="sum">
            <ValueFormat type="decimal" precision={2} />
          </GroupItem>

          <GroupItem summaryType="count" >
          </GroupItem>

        </Summary>
        <ColumnFixing enabled={true} />
        <Export enabled={true} allowExportSelectedData={true} />
      </DataGrid>
    </>
  );
}

export default MasterDetailGrid;