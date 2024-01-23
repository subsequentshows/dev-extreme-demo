import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadIndicator from "devextreme-react/load-indicator";
import notify from "devextreme/ui/notify";
import { useAuth } from "../../contexts/auth";
import { SelectBox, TextBox, CheckBox, Button } from "devextreme-react";

import { fetchAllTinh } from "../../api/DmTinh";
import { fetchHuyenByMaTinh } from "../../api/DmHuyen";
import { fetchXaByMaHuyenByMaTinh } from "../../api/DmXa";
import {
  loadCaptchaEnginge,
  LoadCanvasTemplate,
  validateCaptcha,
} from "react-simple-captcha";
import {
  Validator,
  RequiredRule,
  CompareRule,
  EmailRule,
  PatternRule,
  StringLengthRule,
  RangeRule,
  AsyncRule,
  CustomRule,
} from "devextreme-react/validator";
import Footer from "../footer/Footer";
import $ from 'jquery';

import "./LoginForm.scss";
import LoginIcon from "../../asset/image/icondanhmuckhac.png";
import LoginBackground from "../../asset/image/login-background.png";
import CompanyLogo from "../../asset/image/company-logo.png";

function alignContent() {
  let headerHeight = $('.header').outerHeight(),
    footerHeight = $('.copyright-section').outerHeight(),
    windowHeight = $(window).height(),
    contentHeight = $('.height-100').outerHeight();

  let remainingHeight = windowHeight - headerHeight - footerHeight;
  let marginTop = Math.max(0, (remainingHeight - contentHeight) / 2);

  $('.height-100').css('margin-top', marginTop + 'px');
}

// alignContent();
// $(window).resize(alignContent);

$('.signin-btn').click(() => {
  alignContent();
});

$(document).ready(function () {
  $(window).resize(function () {
    alignContent();
  });

});
setTimeout(function () { alignContent(); }, 100);

export default function LoginForm() {
  //#region Property
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingTinh, setLoadingTinh] = useState(false);
  const [loadingHuyen, setLoadingHuyen] = useState(false);
  const [loadingXa, setLoadingXa] = useState(false);
  const [dmTinh, setDmTinh] = useState({});
  const [dmHuyen, setDmHuyen] = useState({});
  const [dmXa, setDmXa] = useState({});
  const [maTinh, setMaTinh] = useState("");
  const [maHuyen, setMaHuyen] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [maXa, setMaXa] = useState("");
  //#endregion

  //#region Action
  const formData = useRef({
    userName: "",
    password: "",
    rememberMe: false,
  });

  useEffect(() => {
    getDmTinh();
  }, []);

  useEffect(() => {
    let arr = [];
    maTinh.MA && arr.push(maTinh.MA);
    if (arr && arr.length) {
      setLoadingHuyen(true);
      setLoadingXa(true);
      getDmHuyen(arr);
      setTimeout(() => {
        setLoadingHuyen(false);
        setLoadingXa(false);
      }, 500);
    }
  }, [maTinh]);

  useEffect(() => {
    let arrMaTinh = [];
    let arrMaHuyen = [];
    maTinh.MA && arrMaTinh.push(maTinh.MA);
    maHuyen.MA && arrMaHuyen.push(maHuyen.MA);
    if (arrMaTinh && arrMaTinh.length && arrMaHuyen && arrMaHuyen.length) {
      setLoadingXa(true);
      getDmXa(arrMaTinh, arrMaHuyen);
      setTimeout(() => {
        setLoadingXa(false);
      }, 500);
    }
  }, [maTinh, maHuyen]);

  const getDmTinh = async () => {
    let res = await fetchAllTinh();
    if (res && res.Data) {
      setDmTinh(res.Data);
    }
  };

  const getDmHuyen = async (arr) => {
    let res = await fetchHuyenByMaTinh(0, 0, arr, "");
    if (res && res.Data && res.Data.Data) {
      setDmHuyen(res.Data.Data);
    }
  };

  const getDmXa = async (arrMaTinh, arrMaHuyen) => {
    let res = await fetchXaByMaHuyenByMaTinh(
      0,
      0,
      arrMaTinh,
      arrMaHuyen,
      "",
      ""
    );
    if (res && res.Data && res.Data.Data) {
      setDmXa(res.Data.Data);
    }
  };

  const onSubmit = async (e) => {
    if (validateCaptcha(userCaptcha)) {
      const { userName, password } = formData.current;
      const res = await signIn(
        userName,
        password,
        maTinh.MA,
        maHuyen.MA,
        maXa.MA
      );
      if (res.isOk) {
        // notify(res.message, "success", 2000);
        setTimeout(() => {
          navigate("/Home");
        }, 1000);
      } else {
        setLoading(false);
        notify(res.message, "error", 2000);
        loadCaptchaEnginge(5);
      }
    } else {
      notify("Không đúng captcha", "error", 2000);
    }
  };

  useEffect(() => {
    loadCaptchaEnginge(5);
  }, []);
  //#endregion

  return (
    <div className="container-fluid">
      <div class="header">
        <div class="logo-and-title">
          <div class="company-logo">
            <a href="/">
              <img src={CompanyLogo} alt="Quảng Ích" />
            </a>
          </div>

          <div class="login-title">
            <p class="so-title"></p>
            <p class="phan-mem-title">Hệ thống quản lý thu phí</p>
          </div>
        </div>
      </div>

      <div className="login-form-wrapper height-100">

        <form className="login-form" onSubmit={onSubmit}>
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
                <TextBox
                  value={formData.current.userName}
                  onValueChanged={(e) => (formData.current.userName = e.value)}
                  placeholder={"Tài khoản đăng nhập"}
                  mode={"text"}
                  disabled={loading}
                  validationMessageMode="always"
                >
                  <Validator>
                    <RequiredRule message="Tên đăng nhập không được để trống" />
                    <StringLengthRule
                      message="Tên đăng nhập từ 2 ký tự trở lên"
                      min={2}
                    />
                  </Validator>
                </TextBox>
              </div>

              {/* MK */}
              <div className="margin_top_line">
                <TextBox
                  value={formData.current.password}
                  onValueChanged={(e) => (formData.current.password = e.value)}
                  placeholder="Mật khẩu"
                  mode={"password"}
                  disabled={loading}
                  validationMessageMode="always"
                >
                  <Validator>
                    <RequiredRule message="Mật khẩu không được để trống" />
                    <StringLengthRule message="Mật khẩu từ 6 ký tự trở lên" min={6} />
                  </Validator>
                </TextBox>
              </div>

              <div className="account-title">
                <p>Thông tin đơn vị</p>
              </div>

              {/* TP */}
              <div className="margin_top_line">
                <SelectBox
                  dataSource={dmTinh}
                  displayExpr="TEN"
                  searchEnabled={true}
                  placeholder="Chọn Tỉnh"
                  searchMode="contains"
                  searchExpr="TEN"
                  searchTimeout={200}
                  minSearchLength={0}
                  onValueChanged={(e) => setMaTinh(e.value)}
                  disabled={loadingTinh}
                  validationMessageMode="always"
                >
                  <Validator>
                    <RequiredRule message="Không được để trống" />
                  </Validator>
                  {loadingTinh && (
                    <LoadIndicator width={"24px"} height={"24px"} visible={true} />
                  )}
                </SelectBox>
              </div>

              {/* Huyen */}
              <div className="margin_top_line">
                <SelectBox
                  dataSource={dmHuyen}
                  displayExpr="TEN"
                  searchEnabled={true}
                  placeholder="Chọn Huyện"
                  searchMode="contains"
                  searchExpr="TEN"
                  searchTimeout={200}
                  minSearchLength={0}
                  onValueChanged={(e) => setMaHuyen(e.value)}
                  disabled={loadingHuyen}
                  validationMessagePosition="bottom"
                  validationMessageMode="always"
                >
                  <Validator>
                    <RequiredRule message="Không được để trống" />
                  </Validator>
                  {loadingHuyen && (
                    <LoadIndicator width={"24px"} height={"24px"} visible={true} />
                  )}
                </SelectBox>
              </div>

              {/* Xa */}
              <div className="margin_top_line">
                <SelectBox
                  dataSource={dmXa}
                  displayExpr="TEN"
                  searchEnabled={true}
                  placeholder="Chọn Xã"
                  searchMode="contains"
                  searchExpr="TEN"
                  searchTimeout={200}
                  minSearchLength={0}
                  onValueChanged={(e) => setMaXa(e.value)}
                  disabled={loadingXa}
                  validationMessageMode="always"
                >
                  <Validator>
                    <RequiredRule message="Không được để trống" />
                  </Validator>
                  {loadingXa && (
                    <LoadIndicator width={"24px"} height={"24px"} visible={true} />
                  )}
                </SelectBox>
              </div>

              {/* Captcha */}
              <div className="margin_top_line">
                <LoadCanvasTemplate />
                <label className="dx-field-label"> </label>
                <div className="dx-field">
                  <TextBox
                    value={userCaptcha}
                    onValueChanged={(e) => setUserCaptcha(e.value)}
                    placeholder={"Captcha"}
                    disabled={loading}
                    validationMessageMode="always"
                  >
                    <Validator>
                      <RequiredRule message="Không được để trống" />
                    </Validator>
                  </TextBox>
                </div>
              </div>

              {/* Remember */}
              <div className="captcha-wrapper">
                <CheckBox
                  value={formData.current.rememberMe}
                  onValueChanged={(e) => (formData.current.rememberMe = e.value)}
                  text={"Ghi nhớ tài khoản"}
                  elementAttr={{ class: "form-text" }}
                  disabled={loading}
                />
              </div>

              <Button
                width={"100%"}
                type={"default"}
                text={loading ? "" : "Đăng nhập"}
                disabled={loading}
                useSubmitBehavior={true}
                accessKey=""
              />
            </div>
          </div>
        </form >

      </div>

      <Footer />
    </div>
  );
}
