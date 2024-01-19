import axios from "./customize-axios";
const fetchAllTinh = () => {
  return axios.get("/DanhMuc/GetDMTinhThanhPho");
};
export { fetchAllTinh };
