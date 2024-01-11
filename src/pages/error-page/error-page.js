// import React from "react";

// const ErrorPage = () => {
//   return (
//     <>
//       <div className="responsive-paddings">
//         <h5>Trang không tồn tại</h5>
//       </div>
//     </>
//   )
// }

// export default ErrorPage;

import React, { useCallback, useRef, useState } from "react";
import DataGrid, {
  Column,
  FilterRow,
  HeaderFilter,
  Search,
  SearchPanel,
} from "devextreme-react/data-grid";
import SelectBox, { SelectBoxTypes } from "devextreme-react/select-box";
import CheckBox, { CheckBoxTypes } from "devextreme-react/check-box";
import CustomStore from "devextreme/data/custom_store";
import { baseURL } from "../../api/api.js";

const filterLabel = { "aria-label": "Filter" };

const applyFilterTypes = [
  {
    key: "auto",
    name: "Immediately",
  },
  {
    key: "onClick",
    name: "On Button Click",
  },
];


const App = () => {
  const [showFilterRow, setShowFilterRow] = useState(true);
  const [showHeaderFilter, setShowHeaderFilter] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [currentFilter, setCurrentFilter] = useState(applyFilterTypes[0].key);
  const dataGridRef = useRef(null);

  const [contentData, setContentData] = useState(
    new CustomStore({
      key: "ID",
      load: async (options) => {
        try {
          const response = await fetch(
            `${baseURL}/DanhMuc/GetDMPhuongXa`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();

          return data.Data;
          // Assuming the API response is an array of objects
        } catch (error) {
          console.error("Error fetching data:", error);
          return [];
        }
      },
    })
  );

  const clearFilter = useCallback(() => {
    dataGridRef.current.instance.clearFilter();
  }, []);

  const onShowFilterRowChangedOld = useCallback(
    (e, { target: { value } }) => {
      setFilterText(value)
      setShowFilterRow(e.value);
      console.log(e.value)
      clearFilter();
    },
    [clearFilter]
  );

  const onShowFilterRowChanged = useCallback(
    // ({ value }) => {
    (e) => {
      const dataGrid = dataGridRef.current.instance;

      if (e.value === "") {
        clearFilter();
      } else {
        console.log(e.value)
        dataGrid.filter(["TEN", "=", e.value]);
      }

      setShowFilterRow(e.value);
    }, [clearFilter]);

  const onCurrentFilterChanged = useCallback(
    (e) => {
      setCurrentFilter(e.value);
    },
    []
  );

  return (
    <div>
      <div className='item-filter'>
        <label className='items-filter-label'>Tìm Xã onChange</label>

        <div className='input-wrapper'>
          <input
            className='ship-country-filter search-input'
            type='text'
            value={filterText}
            onChange={onShowFilterRowChanged}
            placeholder='Search...'
          />
        </div>
      </div>

      <DataGrid
        id="gridContainer"
        ref={dataGridRef}
        dataSource={contentData}
        height={400}
        keyExpr="ID"
        showBorders={true}
      >
        <FilterRow visible={showFilterRow} applyFilter={currentFilter} />
        <HeaderFilter visible={showHeaderFilter} />
        <SearchPanel visible={true} width={240} placeholder="Search..." />

        <Column dataField="MA" width={140} caption="Invoice Number">
          <HeaderFilter groupInterval={10000} />
        </Column>

        <Column dataField="TEN" />

        <Column dataField="TEN_HUYEN">
          <HeaderFilter>
            <Search enabled={false} />
          </HeaderFilter>
        </Column>
      </DataGrid>

      <div className="options">
        <div className="caption">Options</div>
        <div className="option">
          <span>Apply Filter </span>
          <SelectBox
            items={applyFilterTypes}
            value={currentFilter}
            onValueChanged={onCurrentFilterChanged}
            valueExpr="key"
            inputAttr={filterLabel}
            displayExpr="name"
            disabled={!showFilterRow}
          />
        </div>
        <div className="option">
          <CheckBox
            text="Filter Row"
            value={showFilterRow}
            onValueChanged={onShowFilterRowChanged}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
