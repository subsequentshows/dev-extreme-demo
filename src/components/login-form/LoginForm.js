import { useRef, useState, useEffect, useContext } from 'react';
import "./LoginForm.scss";
import AuthContext from "../../contexts/authProvider";
import { Link, useNavigate, useLocation, Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Home from "../../pages/home/home";
import { localApi } from '../../api/api';
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

  useEffect(() => {
    userRef.current.focus();
  }, [])

  useEffect(() => {
    setErrMsg('');
  }, [user, password])

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await localApi.post(LOGIN_URL,
        JSON.stringify({
          username: user,
          password: password,
          ma_so_gd: "01",
          ma_truong: "0001",
          ma_khoi: "09",
          ma_phong_gd: "01"
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      console.log(JSON.stringify(response?.data));
      //console.log(JSON.stringify(response));

      const accessToken = response?.data?.accessToken;
      const roles = response?.data?.roles;

      setAuth({ user, password, roles, accessToken });
      setUser('');
      setPwd('');

      navigate(from, { replace: true });
      setSuccess(true);
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
  }

  return (
    <>
      {success ? (
        <section>
          <p>You are logged in!</p>
        </section>
      ) : (
        <section>
          <form onSubmit={handleSubmit}>
            {/* <div>
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                ref={userRef}
                autoComplete="off"
                onChange={(e) => setUser(e.target.value)}
                value={user}
                required
              />

              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                onChange={(e) => setPwd(e.target.value)}
                value={password}
                required
              />

              <div className="signin-btn">
                <input type="submit" name="btSignin" value="Đăng nhập" id="btSignin" className="btn btn-default btn-qi" wfd-id="id18">
                </input>
              </div>
            </div> */}

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
                        <input type="text" id="username" ref={userRef} autoComplete="off"
                          onChange={(e) => setUser(e.target.value)} value={user} required
                        />
                        <div className="input-group-append">
                          <span className="input-group-text red lighten-3 button-right-textbox box-shadow-bt">
                            <i className="fas fa-user text-grey qi-color"
                              aria-hidden="true">
                            </i>
                          </span>
                        </div>

                      </div>
                    </div>

                    <div className="margin_top_line">
                      <div className="input-group md-form form-sm form-2 pl-0">
                        {/* <input name="tbPassword" type="password" id="tbPassword" className="form-control my-0 py-1 red-border input-left-textbox box-shadow-bt" placeholder="Mật khẩu" wfd-id="id7" />
                        <div className="input-group-append">
                          <span className="input-group-text red lighten-3 button-right-textbox box-shadow-bt">
                            <i className="fas fa-lock text-grey qi-color"
                              aria-hidden="true"></i>
                          </span>
                        </div> */}

                        <input id="password" type="password" name="tbPassword" placeholder="Mật khẩu"
                          onChange={(e) => setPwd(e.target.value)} value={password} required
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

                    <div className="margin_top_line required">
                      <select>
                        <option value="someOption">Chọn sở</option>
                        <option value="otherOption">Other option</option>
                      </select>
                    </div>

                    <div className="margin_top_line rcbCapHoc-wrapper">
                      <select>
                        <option value="someOption">Mần non</option>
                        <option value="otherOption">Tiểu học</option>
                        <option value="otherOption">Trung học cơ sở</option>
                        <option value="otherOption">Trung học phổ thông</option>
                        <option value="otherOption">Giáo dục thường xuyên</option>
                      </select>
                    </div>

                    <div className="margin_top_line rcbPhongGD-wrapper">
                      <select>
                        <option value="someOption">Chọn phòng</option>
                        <option value="otherOption">Other option</option>
                      </select>
                    </div>

                    <div className="margin_top_line required rcbTruong-wrapper">
                      <select>
                        <option value="someOption">Chọn trường</option>
                        <option value="otherOption">Other option</option>
                      </select>
                    </div>

                    <div className="margin_top_line captcha-section required">
                      <div className="captcha-wrapper">
                        <div className="captcha-input input-group">
                          <input name="tbCapcha" type="text" id="tbCapcha" className="form-control input-captcha" nulltext="Mã xác nhận" placeholder="Nhập mã xác nhận" autoComplete="off" wfd-id="id16" />

                        </div>
                        <div className="captcha-text">
                          <img src="Surface/captcha" alt="Captcha" className="captcha-image" id="captcha-img" />
                        </div>
                      </div>
                    </div>

                    <div className="remember">
                      <input type='checkbox'></input>
                      <label>Ghi nhớ tài khoản</label>
                    </div>

                    <div className="signin-btn">
                      {/* <button ID="btSignin" runat="server" CssClass="btn btn-default btn-qi" Text="Đăng nhập" ClientIDMode="Static" OnClick="btSignin_Click"></button> */}
                      <input type="submit" name="btSignin" value="Đăng nhập" id="btSignin" className="btn btn-default btn-qi" wfd-id="id18">
                      </input>
                    </div>

                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                  </div>
                </div>
              </div>

              <Footer />
            </div>

          </form>
        </section>
      )}
    </>
  )
}

export default Login