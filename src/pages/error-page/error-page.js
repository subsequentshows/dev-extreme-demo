import React, { useEffect, useState, useRef, useCallback } from 'react';
import CustomStore from "devextreme/data/custom_store";
import { baseURL } from '../../api/api';
import $ from 'jquery';

import DataGrid, {
  Paging,
  Pager
} from 'devextreme-react/data-grid';

const App = () => {
  const [dmTinh, setDmTinh] = useState({});
  const [dataSource, setDataSource] = useState([]);
  const dataGridRef = useRef(null);
  const [pageSize, setPageSize] = useState();
  const [pageIndex, setPageIndex] = useState();

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
      setDataSource(data)
    })
  }, []);

  // const dataGrid = dataGridRef.current.instance;


  // constructor(props) {
  //   super(props);
  //   this.dataGridRef = React.createRef();
  //   this.state = {
  //     pageSize: 20,
  //     pageIndex: 0
  //   };

  //   this.changePageSize = this.changePageSize.bind(this);
  //   this.goToLastPage = this.goToLastPage.bind(this);
  //   this.handleOptionChange = this.handleOptionChange.bind(this);
  // }

  const onContentReady = (e) => {
    // let el = e.component.element().find('.dx-scrollview-content').last();
    // el.text('All');

    // el.click(function () {
    //   e.component.pageSize(0);
    //   el.text('All');
    // });

    let sizeChooser = $('<div/>', { id: 'pageSizeChooser', style: 'display:block; float:left' });
    $("#gridContainer .dx-datagrid-pager").append(sizeChooser);
    $("#pageSizeChooser").dxNumberBox({
      width: 100,
      min: 1,
      max: 1000,
      value: e.component.option("paging.pageSize"),
      onValueChanged: (args) => {
        e.component.option("paging.pageSize", args.value);
      }
    });
  }

  const changePageSize = useState(
    (value) => {
      setPageSize(value);
    }, [])

  const goToLastPage = () => {
    const pageCount = dataGridRef.current.instance.pageCount();

    setPageIndex(pageCount - 1)
  }

  const handleOptionChange = (e) => {
    if (e.fullName === 'paging.pageSize') {
      setPageSize(e.value)
    }

    if (e.fullName === 'paging.pageIndex') {
      setPageIndex(e.value)
    }
  }

  return (
    <>
      <div className='responsive-paddings'>
        <DataGrid
          dataSource={dataSource}
          remoteOperations={false}
          width="100%"
          height="100%"
        // onOptionChanged={handleOptionChange}
        >

          <Pager visible={true} showPageSizeSelector={true} showNavigationButtons={true} displayMode='compact' onContentReady={onContentReady} />

          <Paging pageSize={changePageSize} pageIndex={pageIndex} defaultPageSize={10} />
        </DataGrid >
      </div>
    </>
  )
}

export default App;