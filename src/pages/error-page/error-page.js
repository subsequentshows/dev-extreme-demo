/* global RequestInit */
import React, { useCallback, useState, useRef } from "react";
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
  const [searchValue, setSearchValue] = useState("");
  const dataGridRef = useRef(null);

  const [ordersData, setOrdersData] = useState(
    new CustomStore({
      key: "ID",
      load: async () => {
        try {
          const response = await fetch(
            `${baseURL}/DanhMuc/GetDMPhuongXa`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          console.log(data.Data.find(o => o.TEN === "xá"))
          // Apply search filter
          if (searchValue) {
            return data.Data.filter((item) =>
              item.TEN.toLowerCase().includes(searchValue.toLowerCase())
            );
          }

          return data.Data;
          // Assuming the API response is an array of objects
        } catch (error) {
          console.error("Error fetching data:", error);
          return [];
        }
      },
      update: async (key, values) => {
        try {
          const response = await fetch(
            `${baseURL}/Manager/Menu/UpdateMenu/${key}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(values),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const updatedData = await response.json();
          // Return the updated data if needed
          return updatedData;
        } catch (error) {
          console.error("Error updating data:", error);
          throw error;
        }
      },
      remove: async (key) => {
        try {
          const response = await fetch(
            `${baseURL}/Manager/Menu/DeleteMenu/${key}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const deletedData = await response.json();
          return deletedData; // Return the deleted data if needed
        } catch (error) {
          console.error("Error deleting data:", error);
          throw error;
        }
      },

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

  const refreshDataGrid = useCallback(() => {
    dataGridRef.current.instance.refresh();
    console.log("Reloaded")
  }, []);

  const handleSearchButtonClick = async () => {
    // Trigger a reload of the data with the new search value
    refreshDataGrid();
    await ordersData.load({ searchValue });
  };

  const handleSearchInputChange = (e) => {
    setSearchValue(e.target.value);


    console.log((e.target.value))
  };

  return (
    <>
      <div className="search-container">
        <button icon='refresh' widget="dxButton" onClick={refreshDataGrid} text="Tải lại" > Reload </button>

        <input
          type="text"
          placeholder="Search by TEN"
          value={searchValue}
          onChange={handleSearchInputChange}
        />
        <button onClick={handleSearchButtonClick}>Search</button>
      </div>

      <div className="responsive-paddings">
        <DataGrid
          id="grid"
          showBorders={true}
          dataSource={ordersData}
          repaintChangesOnly={true}
          ref={dataGridRef}
        >
          <Editing
            refreshMode={refreshMode}
            mode="row"
            allowAdding={true}
            allowDeleting={true}
            allowUpdating={true}
          />

          <Column dataField="MA" />
          <Column dataField="TEN" />
          <Column dataField="MA_HUYEN" />
          <Column dataField="MA_TINH" />
          <Column dataField="TEN_TINH" />
          <Column dataField="TEN_HUYEN" />
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
