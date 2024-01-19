import axios from "./customize-axios";
const fetchXaByMaHuyenByMaTinh = (
  pageIndex = 0,
  pageSize = 0,
  list_ma_tinh,
  list_ma_huyen,
  ten_xa = "",
  ma_xa = ""
) => {
  const objParameter = {
    pageIndex: pageIndex,
    pageSize: pageSize,
    filter: {
      list_ma_tinh: list_ma_tinh,
      list_ma_huyen: list_ma_huyen,
      ten_xa: ten_xa,
      ma_xa: ma_xa,
    },
  };
  try {
    return axios.post("/DanhMuc/GetDMPhuongXa", objParameter);
  } catch {
    return {
      isOk: false,
      message: "////Err",
    };
  }
};
export { fetchXaByMaHuyenByMaTinh };
