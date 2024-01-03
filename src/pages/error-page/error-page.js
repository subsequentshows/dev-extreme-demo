/* global RequestInit */
import React, { useCallback, useState } from "react";
import {
  DataGrid,
  Column,
  Editing,
  Scrolling,
  Lookup,
  Summary,
  TotalItem,
  DataGridTypes,
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react/button";
import { SelectBox, SelectBoxTypes } from "devextreme-react/select-box";

import CustomStore from "devextreme/data/custom_store";
import { formatDate } from "devextreme/localization";
import "whatwg-fetch";
import { baseURL } from "../../api/api";

const refreshModeLabel = { "aria-label": "Refresh Mode" };

const REFRESH_MODES = ["full", "reshape", "repaint"];

const App = () => {
  const [requests, setRequests] = useState([]);
  const [refreshMode, setRefreshMode] = useState("reshape");

  const [ordersData] = useState(
    new CustomStore({
      key: "ID",
      load: () => sendRequest(`${baseURL}/DanhMuc/GetDMPhuongXa`),
      // insert: (values) =>
      //   sendRequest(`${baseURL}/InsertOrder`, "POST", {
      //     values: JSON.stringify(values),
      //   }),
      // update: (key, values) =>
      //   sendRequest(`${baseURL}/UpdateOrder`, "PUT", {
      //     key,
      //     values: JSON.stringify(values),
      //   }),
      // remove: (key) =>
      //   sendRequest(`${baseURL}/DeleteOrder`, "DELETE", {
      //     key,
      //   }),
    })
  );

  console.table(ordersData)
  console.log(typeof (ordersData))

  const handleRefreshModeChange = useCallback(
    (e) => {
      setRefreshMode(e.value);
    },
    []
  );

  const clearRequests = useCallback(() => {
    setRequests([]);
  }, []);

  const logRequest = useCallback(
    (method, url, data) => {
      const args = Object.keys(data || {})
        .map((key) => `${key}=${data[key]}`)
        .join(" ");

      const time = formatDate(new Date(), "HH:mm:ss");
      const request = [time, method, url.slice(URL.length), args].join(" ");

      setRequests((prevRequests) =>
        [request].concat(prevRequests)
      );
    },
    []
  );

  const sendRequest = useCallback(
    async (url, method = "GET", data = {}) => {
      logRequest(method, url, data);

      const request = {
        method,
        credentials: "include",
      };

      if (["DELETE", "POST", "PUT"].includes(method)) {
        const params = Object.keys(data)
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
          )
          .join("&");

        request.body = params;
        request.headers = {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        };
      }

      const response = await fetch(url, request);

      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const result = isJson ? await response.json() : {};

      if (!response.ok) {
        throw result.Message;
      } else {
        console.log(result.data)
      }

      return method === "GET" ? result.data : {};

    },
    [logRequest]
  );

  return (
    <>
      <div className="responsive-paddings">
        <DataGrid
          id="grid"
          showBorders={true}
          dataSource={ordersData}
          repaintChangesOnly={true}
        >
          {/* <Editing
          refreshMode={refreshMode}
          mode="batch"
          allowAdding={true}
          allowDeleting={true}
          allowUpdating={true}
        /> */}

          {/* <Column dataField="CustomerID" caption="Customer">
          <Lookup
            dataSource={customersData}
            valueExpr="Value"
            displayExpr="Text"
          />
        </Column> */}

          {/* <Column dataField="OrderDate" dataType="date" />
        <Column dataField="Freight" />
        <Column dataField="ShipCountry" />
        <Column
          dataField="ShipVia"
          caption="Shipping Company"
          dataType="number"
        >
          <Lookup
            dataSource={shippersData}
            valueExpr="Value"
            displayExpr="Text"
          />
        </Column> */}

          {/* <Summary>
          <TotalItem column="CustomerID" summaryType="count" />
          <TotalItem column="Freight" summaryType="sum" valueFormat="#0.00" />
        </Summary> */}
        </DataGrid>
        <br />
        <br />
        <br />
        <div className="options" >
          <div className="caption">Options</div>
          <div className="option">
            <span>Refresh Mode: </span>
            <SelectBox
              value={refreshMode}
              inputAttr={refreshModeLabel}
              items={REFRESH_MODES}
              onValueChanged={handleRefreshModeChange}
            />
          </div>
          <div id="requests">
            <div>
              <div className="caption">Network Requests</div>
              <Button id="clear" text="Clear" onClick={clearRequests} />
            </div>
            <ul>
              {requests.map((request, index) => (
                <li key={index}>{request}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
