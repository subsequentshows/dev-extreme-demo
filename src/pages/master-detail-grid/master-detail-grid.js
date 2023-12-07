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

// Export to excel library
import { exportDataGrid as exportDataGridToExcel } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

// Export to pdf library
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
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


// let exportFormats = [];
// const onExporting = ((e) => {
//   e.cancel = true;

//   switch (e.format) {
//     case "xlsx":
//       const workbook = new Workbook();
//       const worksheet = workbook.addWorksheet("Companies");
//       exportFormats = ['xlsx'];
//       // exportDataGridToExcel({
//       exportDataGrid({
//         component: e.component,
//         worksheet: worksheet,
//         autoFilterEnabled: true
//       }).then(() => {
//         workbook.xlsx.writeBuffer().then((buffer) => {
//           saveAs(
//             new Blob([buffer], { type: "application/octet-stream" }),
//             "Companies.xlsx"
//           );
//         });
//       });
//       break;

//     case "pdf":
//       const doc = new jsPDF();
//       exportFormats = ['pdf'];
//       // exportDataGridToPDF({
//       exportDataGrid({
//         jsPDFDocument: doc,
//         component: e.component,
//         indent: 5
//       }).then(() => {
//         doc.save("Companies.pdf");
//       });
//       break;

//     default:
//       console.error("Đã xảy ra lỗi khi xuất dữ liệu")
//   }
// })

const exportFormats = ['xlsx', 'pdf'];

function onExporting(e) {
  if (e.format === 'xlsx') {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Companies');
    exportDataGridToExcel({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Companies.xlsx');
      });
    });
  }
  else if (e.format === 'pdf') {
    const doc = new jsPDF();
    exportDataGridToPdf({
      jsPDFDocument: doc,
      component: e.component
    }).then(() => {
      doc.save('Companies.pdf');
    })
  };
}

const MasterDetailGrid = () => {
  return (
    <>
      <DataGrid
        dataSource={dataSource}
        showBorders={true}
        width="100%"
        height={600}
        remoteOperations={true}
        onExporting={onExporting}
      >
        {/* <MasterDetail
          enabled={true}
          component={DetailGrid}
        /> */}

        <Selection mode="multiple" />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <GroupPanel visible={false} />
        <Scrolling mode="virtual" />
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

        <Column dataField="OrderDate" dataType="date" width={150} allowExporting={false}>
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
        <Paging defaultPageSize={10} />
      </DataGrid>
    </>
  );
}

export default MasterDetailGrid;