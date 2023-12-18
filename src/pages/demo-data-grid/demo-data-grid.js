import React, { useRef, useCallback, useEffect, useState } from 'react';
import DataGrid, { Column, Editing, Paging, Popup, Form, Selection, Lookup, LoadPanel, Toolbar, Item, DataGridTypes }
  from 'devextreme-react/data-grid';
import Button from 'devextreme-react/button';
import { createStore } from 'devextreme-aspnet-data-nojquery';
import 'whatwg-fetch';
import notify from 'devextreme/ui/notify';
import './demo-data-grid.scss';

const URL = 'https://js.devexpress.com/Demos/Mvc/api/DataGridBatchUpdateWebApi';

const ordersStore = createStore({
  key: 'OrderID',
  loadUrl: `${URL}/Orders`,
  onBeforeSend: (method, ajaxOptions) => {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

async function sendBatchRequest(url, changes) {
  const result = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(changes),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    credentials: 'include',
  });

  if (!result.ok) {
    const json = await result.json();

    throw json.Message;
  }
}


async function processBatchRequest(url, changes, component) {
  await sendBatchRequest(url, changes);
  await component.refresh(true);
  component.cancelEditData();
}

const DemoDataGrid = ({ onSelected, onDelete }) => {
  const onSaving = React.useCallback((e) => {
    e.cancel = true;

    if (e.changes.length) {
      e.promise = processBatchRequest(`${URL}/Batch`, e.changes, e.component);
    }
  }, []);

  const [selectedItemKeys, setSelectedItemKeys] = useState([]);

  const onSelectionChanged = useCallback((data) => {
    setSelectedItemKeys(data.selectedRowKeys);
  }, []);

  const dataGridRef = useRef(null);
  const refreshDataGrid = useCallback(() => {
    dataGridRef.current.instance.refresh();
  }, []);

  const settingsButtonOptions = {
    icon: 'preferences',
    text: 'Settings',
  }

  const renderLabel = () => <div className="toolbar-label">1.1. Quản lý thu phí</div>;

  return (
    <React.Fragment>
      <h2 className={'content-block'}>Demo Data Grid</h2>

      <div className={'content-block'}>
        <div onSelect={onSelected} onClick={onDelete} className={'dx-card responsive-paddings'}>

          <DataGrid
            id="gridContainer"
            ref={dataGridRef}
            dataSource={ordersStore}
            showBorders={true}
            remoteOperations={true}
            repaintChangesOnly={true}
            onSaving={onSaving}
            onSelectionChanged={onSelectionChanged}
          >

            <Column dataField="STT" width={60} allowEditing={false}></Column>
            <Column dataField="OrderID" width={100} allowEditing={false}></Column>
            <Column dataField="ShipName"></Column>
            <Column dataField="ShipCountry"></Column>
            <Column dataField="ShipCity"></Column>
            <Column dataField="ShipAddress"></Column>
            <Column dataField="OrderDate" dataType="date"></Column>
            <Column dataField="Freight"></Column>

            {/* <Editing
              mode="batch"
              location="center"
              locateInMenu="auto"
              allowAdding={true}
              allowDeleting={true}
              allowUpdating={true}
            /> */}
            <Selection mode="multiple" />
            <Toolbar>
              <Item
                location="left"
                locateInMenu="never"
                render={renderLabel}
              />

              <Item
                location="after">
                <Button
                  icon='refresh'
                  options={settingsButtonOptions}
                  widget="dxButton"
                  onClick={refreshDataGrid} />
              </Item>

              <Item
                location="after"
                name="columnChooserButton"
              />
            </Toolbar>


          </DataGrid>

        </div>
      </div>
    </React.Fragment>
  );
}

export default DemoDataGrid;