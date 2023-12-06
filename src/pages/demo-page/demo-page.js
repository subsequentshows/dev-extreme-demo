import React from 'react';
import {
  Column,
  DataGrid,
  FilterRow,
  HeaderFilter,
  GroupPanel,
  Scrolling,
  Editing,
  Grouping,
  Lookup,
  MasterDetail,
  Summary,
  RangeRule,
  RequiredRule,
  StringLengthRule,
  GroupItem,
  TotalItem,
  ValueFormat,
  GridCompoment,
  ColumnDirective,
  Inject,
  Page
} from 'devextreme-react/data-grid';

// import { EditingState } from 'devexpress/dx-react-grid';
// import {
//   Grid,
//   Table,
//   TableHeaderRow,
//   TableEditRow,
//   TableEditColumn,
// } from '@devexpress/dx-react-grid-material-ui';

const DemoPage = () => {
  const dataSource = "https://js.devexpress.com/React/Demos/WidgetsGallery/JSDemos/data/customers.json";
  const columns = ['CompanyName', 'City', 'State', 'Phone', 'Fax'];

  return (
    <>
      <DataGrid
        dataSource={dataSource}
        showBorders={true}
        width="100%"
        height={600}
        remoteOperations={true}
      >

      </DataGrid>
    </>
  );
};

export default DemoPage;