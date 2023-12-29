import { useRef, useState, useEffect, useContext } from 'react';
import "./LoginForm.scss";
import AuthContext from "../../contexts/authProvider";
import { Link, useNavigate, useLocation, Routes, Route, Navigate, BrowserRouter, Redirect } from "react-router-dom";
import { loadCaptchaEnginge, LoadCanvasTemplate, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';
import { localApi, baseURL } from '../../api/api';
import axios from 'axios';
import $ from 'jquery';
import Footer from "../footer/Footer";
import LoginIcon from "../../asset/image/icondanhmuckhac.png";
import LoginBackground from "../../asset/image/login-background.png";

const LOGIN_URL = '/login';

const Login = () => {
  const { setAuth } = useContext(AuthContext);

  const userRef = useRef();
  const errRef = useRef();

  const navigate = useNavigate();
  const prevLocation = useLocation();
  const from = prevLocation.state?.from?.pathname || "/home";

  const [user, setUser] = useState('');
  const [password, setPwd] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const [success, setSuccess] = useState(false);

  const [truongData, setTruongData] = useState([]);
  const [tinhThanhPhoData, setTinhThanhPhoData] = useState([]);
  const [phuongXaData, setPhuongXaData] = useState([]);
  const [capHocData, setCapHocData] = useState([]);

  const [selectedXa, setSelectedXa] = useState('-1');
  const [selectedTruong, setSelectedTruong] = useState('-1');
  const [selectedTinh, setSelectedTinh] = useState('-1');
  const [selectedCapHoc, setSelectedCapHoc] = useState('-1');

  useEffect(() => {
    setErrMsg('');
  }, [user, password])

  // useEffect(() => {
  //   userRef.current.focus();
  // }, [])

  // Tỉnh/Thành phố
  useEffect(() => {
    console.log('Fetching TinhThanhPhoData');
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/DanhMuc/GetDMTinhThanhPho`);
        setTinhThanhPhoData(response.data);

      } catch (error) {
        console.error('Đã xảy ra lỗi khi lấy dữ liệu tỉnh/thành phố: ', error);
      }
    };
    // Fetch TinhThanhPho data when component mounts
    fetchData();
  }, []);

  // Cấp học
  useEffect(() => {
    console.log('Fetching CapHoc');
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/DanhMuc/GetDMCapHoc`);
        setCapHocData(response.data);

      } catch (error) {
        console.error('Đã xảy ra lỗi khi lấy dữ liệu cấp học: ', error);
      }
    };
    fetchData();
  }, []);

  // Phường/Xã
  useEffect(() => {
    console.log('Fetching PhuongXa');
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/DanhMuc/GetDMPhuongXa`);
        setPhuongXaData(response.data);

      } catch (error) {
        console.error('Đã xảy ra lỗi khi lấy dữ liệu phường xã: ', error);
      }
    };
    fetchData();
  }, []);

  // Trường
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get('https://localhost:7223/api/DanhMuc/GetDMTruong');
  //       setPhuongXaData(response.data);

  //     } catch (error) {
  //       console.error('Đã xảy ra lỗi khi lấy dữ liệu phường xã: ', error);
  //     }
  //   };
  //   fetchData();
  // }, []);

  // function componentDidMount() {
  //   loadCaptchaEnginge(6);
  // };

  useEffect(() => {
    loadCaptchaEnginge(6);
    loadCaptchaEnginge(5, "gray");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let user_captcha_value = $("#user_captcha_input").val();

    if (validateCaptcha(user_captcha_value) === true) {
      try {
        const response = await localApi.post(LOGIN_URL,
          JSON.stringify({
            username: user,
            password: password,
            ma_tinh: "01",
            ma_huyen: "001",
            ma_xa: "00001"
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
          }
        );
        console.log("JSON respone data" + JSON.stringify(response?.data));
        //console.log(JSON.stringify(response));

        const accessToken = response?.data?.accessToken;
        const roles = response?.data?.roles;

        setAuth({ user, password, roles, accessToken });
        setUser('');
        setPwd('');

        const from = prevLocation.state?.from?.pathname || "/#/home";
        navigate(from, { replace: true });
        setSuccess(true);
        console.log("navigated")
        navigate("/#/home")

      } catch (err) {
        if (!err?.response) {
          setErrMsg('No Server Response');
        } else if (err.response?.status === 400) {
          setErrMsg('Missing Username or Password');
        } else if (err.response?.status === 401) {
          setErrMsg('Unauthorized');
        } else {
          setErrMsg('Login Failed');
        }
        errRef.current.focus();
      }
    } else if (user_captcha_value === "") {
      setErrMsg('Vui lòng nhập mã xác nhận');
    } else {
      setErrMsg('Mã xác nhận không chính xác');
      $("#user_captcha_input").val("")
    }
  }

  return (
    <>
      {success ? (
        // <Routes>
        //   <Route
        //     index
        //     element={<Navigate to="/home" />}
        //   />
        // </Routes>
        <p>Logged in</p>
      ) : (
        <section>
          <form onSubmit={handleSubmit}>
            {/* <form> */}
            <div className="container-fluid">
              <div className="height-100">
                <div className="login-section">
                  <div className="login-left" style={{ backgroundImage: `url(${LoginBackground})` }} ></div>

                  <div className="login-right">
                    <div className="login-section-title">
                      <div className="login-icon">
                        <img src={LoginIcon} alt='login-icon' />
                      </div>
                      <div className="login-text">
                        <p className="login-top-text">Đăng nhập hệ thống</p>
                        <p className="login-bottom-text">Quản lý cấp trường</p>
                      </div>
                    </div>

                    <div className="account-title">
                      <p>Thông tin tài khoản</p>
                    </div>

                    <div className="margin_top_line">
                      <div className="input-group md-form form-sm form-2 pl-0"
                      >
                        {/* <input name="tbUserName" type="text" id="tbUserName" className="form-control my-0 py-1 red-border input-left-textbox box-shadow-bt" placeholder="Tài khoản đăng nhập" wfd-id="id6" /> */}
                        <input
                          type="text"
                          id="username"
                          ref={userRef}
                          autoComplete="off"
                          placeholder="Mật khẩu"
                          onChange={(e) => setUser(e.target.value)} value={user} required
                        />
                        <div className="input-group-append">
                          <span className="input-group-text red lighten-3 button-right-textbox box-shadow-bt">
                            <i className="fas fa-user text-grey qi-color" aria-hidden="true"></i>
                          </span>
                        </div>

                      </div>
                    </div>

                    <div className="margin_top_line">
                      <div className="input-group md-form form-sm form-2 pl-0">
                        <input
                          id="password"
                          type="password"
                          name="tbPassword"
                          placeholder="Mật khẩu"
                          onChange={(e) => setPwd(e.target.value)}
                          value={password}
                          required
                        />

                        <div className="input-group-append">
                          <span className="input-group-text red lighten-3 button-right-textbox box-shadow-bt">
                            <i className="fas fa-lock text-grey qi-color"
                              aria-hidden="true"></i>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="account-title">
                      <p>Thông tin đơn vị</p>
                    </div>

                    {/* Thanh Pho */}
                    <div className="margin_top_line required rcbTruong-wrapper">
                      <select
                        placeholder='Chọn Sở'
                        value={selectedTinh}
                        onChange={(e) => setSelectedTinh(e.target.value)}
                      >
                        {Array.isArray(tinhThanhPhoData.Data) &&
                          tinhThanhPhoData.Data.map((value) => (
                            <option key={value.MA} value={value.MA}>
                              {value.TEN}
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    {/* Cap Hoc */}
                    <div className="margin_top_line required rcbTruong-wrapper">
                      <select
                        placeholder='Chọn cấp học'
                        value={selectedCapHoc}
                        onChange={(e) => setSelectedCapHoc(e.target.value)}
                      >
                        {Array.isArray(capHocData.Data) &&
                          capHocData.Data.map((value) => (
                            <option key={value.MA} value={value.MA}>
                              {value.TEN}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Phường xã */}
                    <div className="margin_top_line required rcbTruong-wrapper">
                      <select
                        placeholder='Chọn xã'
                        value={selectedXa}
                        onChange={(e) => setSelectedXa(e.target.value)}
                      >
                        {Array.isArray(phuongXaData.Data) &&
                          phuongXaData.Data.map((value) => (
                            <option key={value.MA} value={value.MA}>
                              {value.TEN}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="margin_top_line rcbPhongGD-wrapper">
                      <select>
                        <option value="someOption">Chọn phòng</option>
                        <option value="otherOption">Phong.TEN</option>
                      </select>
                    </div>

                    <div className="margin_top_line rcbPhongGD-wrapper">
                      <select>
                        <option value="someOption">Chọn trường</option>
                        <option value="otherOption">Truong.TEN</option>
                      </select>
                    </div>

                    <div className="margin_top_line captcha-section required">
                      <div className="captcha-wrapper">
                        <div className="captcha-input input-group">
                          <input id="user_captcha_input"
                            className="form-control input-captcha"
                            name="tbCapcha"
                            type="text"
                            nulltext="Mã xác nhận"
                            placeholder="Nhập mã xác nhận"
                            autoComplete="off"
                            wfd-id="id16"
                          />
                        </div>

                        <div className="captcha-text captcha">
                          <LoadCanvasTemplate reloadText="Reload" />
                        </div>
                      </div>
                    </div>

                    <div className="remember">
                      <input type='checkbox'></input>
                      <label>Ghi nhớ tài khoản</label>
                    </div>

                    <div className="signin-btn">
                      <input type="submit"
                        name="btSignin"
                        value="Đăng nhập"
                        id="btSignin"
                        className="btn btn-default btn-qi"
                        wfd-id="id18"
                      // onClick={doSubmit}
                      >
                      </input>
                    </div>

                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                  </div>
                </div>
              </div>

              <Footer />
            </div>

          </form>
        </section >
      )}
    </>
  )
}

export default Login