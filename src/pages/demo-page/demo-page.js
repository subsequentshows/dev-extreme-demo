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
  Page,
  Button
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
        <Editing
          mode="row"
          useIcons={true}
          allowUpdating={true}
          allowDeleting={false}
        />
        <Column type="buttons" width={110}>
          <Button name="edit" />
          <Button name="delete" />

        </Column>
      </DataGrid>
    </>
  );
};

export default DemoPage;