import React, { useEffect, useRef, useState } from "react";
import PivotGridDataSource from "devextreme/ui/pivot_grid/data_source";
import Chart, {
  AdaptiveLayout,
  CommonSeriesSettings,
  Size,
  Tooltip,
} from "devextreme-react/chart";
import { createStore } from 'devextreme-aspnet-data-nojquery';
import PivotGrid, { FieldChooser } from "devextreme-react/pivot-grid";
import { sales } from "./data.js";
import { baseURL } from "../../api/api.js";
import { Field } from "formik";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

let api_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOZ3VvaUR1bmdJZCI6IjEiLCJNQV9IVVlFTiI6IjAwMSIsIk1BX1RJTkgiOiIwMSIsIk1BX1hBIjoiMDAwMDciLCJuYmYiOjE3MDM4MjA5NDksImV4cCI6MTc2MzgyMDg4OSwiaWF0IjoxNzAzODIwOTQ5LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjQ0MzAwIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo0NDMwMCJ9.m-PSJWciAyy9VwezqvX6A2RFqe9WiEiST8htiMeTHYQ";

const config = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${api_token}`,
  },
};

const customizeTooltip = (args) => {
  const valueText = currencyFormatter.format(args.originalValue);
  return {
    html: `${args.seriesName} | Total<div class="currency">${valueText}</div>`,
  };
};

const BaoCao3 = () => {
  const chartRef = useRef(null);
  const pivotGridRef = useRef(null);
  const [dataSource, setDataSource] = useState([]);

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
      <div className="responsive-paddings">
        {/* <Chart ref={chartRef}>
        <Size height={200} />
        <Tooltip enabled={true} customizeTooltip={customizeTooltip} />
        <CommonSeriesSettings type="bar" />
        <AdaptiveLayout width={450} />
        </Chart> */}

        <PivotGrid
          id="pivotgrid"
          dataSource={dataSource}
          ref={pivotGridRef}
          allowSortingBySummary={true}
          allowFiltering={true}
          showBorders={true}
          showColumnTotals={false}
          showColumnGrandTotals={false}
          showRowTotals={false}
          showRowGrandTotals={false}
        >
          <Field />
        </PivotGrid>
      </div>
    </>
  );
};
export default BaoCao3;
