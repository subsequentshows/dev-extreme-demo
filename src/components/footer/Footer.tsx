import React from "react";
import "./Footer.scss";

export default function Footer({ ...rest }) {
  return (
    <footer className={"footer"} {...rest}>
      {/* <div className=" copyright-section">
        <p className="copyright-title">Hệ thống quản lý thu phí</p>

        <p>
          Copyright © 2022 QuangIch. All Rights Rerverved{" "}
          <span className="divider">-</span>
        </p>

        <div className="hotline-and-email">
          <p>
            Hotline: <span className="qi-color">CAU_HINH.HOT_LINE</span>
          </p>

          <p>
            Email: <span className="qi-color">CAU_HINH.EMAIL </span>
          </p>
        </div>
      </div> */}
    </footer>
  );
}
