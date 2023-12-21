import React, { useState, useCallback } from 'react';
import './phan-quyen.scss';
import DataGrid, { Column, Editing, Paging, Form, Selection, Lookup, LoadPanel, Toolbar, Item, DataGridTypes }
  from 'devextreme-react/data-grid';
import {
  Popup, Position, ToolbarItem
} from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';

// Export to excel library
import { exportDataGrid as exportDataGridToExcel } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

// Export to pdf library
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { jsPDF } from "jspdf";
// Default export is a4 paper, portrait, using millimeters for units

import * as XLSX from "xlsx";
import * as JSZIP from "jszip";
import $ from 'jquery';
import { Modal } from "react-bootstrap-v5";

import readXlsxFile from 'read-excel-file';

const renderContent = () => {
  return (
    <>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
        sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Penatibus et magnis dis parturient. Eget
        dolor morbi non arcu risus. Tristique magna sit amet
        purus gravida quis blandit. Auctor urna nunc id cursus
        metus aliquam eleifend mi in. Tellus orci ac auctor
        augue mauris augue neque gravida. Nullam vehicula ipsum
        a arcu. Nullam ac tortor vitae purus faucibus ornare
        suspendisse sed nisi. Cursus in hac habitasse platea
        dictumst. Egestas dui id ornare arcu. Dictumst
        vestibulum rhoncus est pellentesque elit ullamcorper
        dignissim.
      </p>
      <p>
        Mauris rhoncus aenean vel elit scelerisque mauris
        pellentesque pulvinar. Neque volutpat ac tincidunt vitae
        semper quis lectus. Sed sed risus pretium quam vulputate
        dignissim suspendisse in. Urna nec tincidunt praesent
        semper feugiat nibh sed pulvinar. Ultricies lacus sed
        turpis tincidunt id aliquet risus feugiat. Amet cursus
        sit amet dictum sit amet justo donec enim. Vestibulum
        rhoncus est pellentesque elit ullamcorper. Id aliquet
        risus feugiat in ante metus dictum at.
      </p>
    </>
  )
}

const PhanQuyen = () => {
  const [isPopupVisible, setPopupVisibility] = useState(false);
  const [positionOf, setPositionOf] = React.useState('');

  const togglePopup = useCallback(() => {
    // const message = `Email is sent to ${currentEmployee.FirstName} ${currentEmployee.LastName}`;
    setPopupVisibility(!isPopupVisible);
  }, [isPopupVisible]);

  const sendEmail = React.useCallback(() => {
    // const message = `Email is sent to ${currentEmployee.FirstName} ${currentEmployee.LastName}`;
    const message = `Email is sent to`;
    notify(
      {
        message,
        position: {
          my: 'center top',
          at: 'center top',
        },
      },
      'success',
      3000,
    );
  }, []);
  // }, [currentEmployee]);

  const getEmailButtonOptions = useCallback(() => ({
    icon: 'email',
    stylingMode: 'contained',
    text: 'Send',
    onClick: sendEmail,
  }), [sendEmail]);

  const getCloseButtonOptions = useCallback(() => ({
    text: 'Close',
    stylingMode: 'outlined',
    type: 'normal',
    onClick: togglePopup,
  }), [togglePopup]);

  return (
    <>
      <h2 className={'content-block'}>Phan Quyen</h2>
      <div className={'content-block'}>
        <div className={'dx-card responsive-paddings'}>
          <Popup
            id="popup"
            contentRender={renderContent}
            visible={isPopupVisible}
            hideOnOutsideClick={true}
            onHiding={togglePopup}
            dragEnabled={false}
            showCloseButton={true}
            showTitle={true}
            title="Nhập từ excel"
            container=".dx-viewport"
            width={1000}
            height={400}
          >
            <Position at="center" my="center" of={positionOf} collision="fit" />

            <ToolbarItem
              widget="dxButton"
              toolbar="bottom"
              location="before"
              options={getEmailButtonOptions()}
            />
            <ToolbarItem
              widget="dxButton"
              toolbar="top"
              location="after"
              options={getCloseButtonOptions()}
            />
          </Popup>

          <Button
            text="Open popup"
            onClick={togglePopup}
          />

        </div>
      </div>
    </>
  )
};


export default PhanQuyen;