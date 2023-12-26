import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './phan-quyen.scss';

const PhanQuyen = () => {
  const [phuongXaData, setPhuongXaData] = useState([]);
  const [selectedXa, setSelectedXa] = useState('-1');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://localhost:7223/api/DanhMuc/GetDMPhuongXa');
        setPhuongXaData(response.data);

      } catch (error) {
        console.error('Error fetching PhuongXa data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <h2 className={'content-block'}>Phan Quyen</h2>
      <div className={'content-block'}>
        <div className={'dx-card responsive-paddings'}>

          <div className="margin_top_line required rcbTruong-wrapper">
            <select
              placeholder='Chọn xã'
              value={selectedXa}
              onChange={(e) => setSelectedXa(e.target.value)}
            >
              <option value="-1">Chọn xã</option>

              {Array.isArray(phuongXaData.Data) &&
                phuongXaData.Data.map((value) => (
                  <option key={value.MA} value={value.MA}>
                    {value.TEN}
                  </option>
                ))
              }
            </select>
          </div>

        </div>
      </div>
    </>
  )
};


export default PhanQuyen;


