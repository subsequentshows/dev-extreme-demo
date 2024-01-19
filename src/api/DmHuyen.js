import axios from "./customize-axios";
const fetchHuyenByMaTinh = (pageIndex, pageSize, list_ma_tinh, ten_huyen) => {
  const objParameter = {
    pageIndex: pageIndex,
    pageSize: pageSize,
    filter: {
      list_ma_tinh: list_ma_tinh,
      ten_huyen: ten_huyen,
    },
  };
  
  return axios.post("/DanhMuc/GetDMQuanHuyen", objParameter);
};
export { fetchHuyenByMaTinh };
