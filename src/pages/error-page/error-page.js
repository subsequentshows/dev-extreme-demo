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

import React, { useRef, useState, useEffect } from 'react';

import DataGrid from 'devextreme-react/data-grid';
import Button from 'devextreme-react/button';

import { jsPDF } from 'jspdf';
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { baseURL } from '../../api/api';

export default function App() {
  const [contentData, setContentData] = useState();
  const dataGridRef = useRef(null);

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
      setContentData(data);
      // setDataSource(data)
    })
  }, []);

  function exportGrid() {
    const doc = new jsPDF();
    const dataGrid = dataGridRef.current.instance;

    exportDataGridToPdf({
      jsPDFDocument: doc,
      component: dataGrid
    }).then(() => {
      doc.save('Customers.pdf');
    });
  }

  return (
    <React.Fragment>
      <div>
        <Button
          onClick={exportGrid}
          text='he'
        />
        <DataGrid
          dataSource={contentData}
          ref={dataGridRef}
        >
          {/* ... */}
        </DataGrid>
      </div>
    </React.Fragment>
  );
}