import React from "react";
import Toolbar, { Item } from "devextreme-react/toolbar";
import Button from "devextreme-react/button";
import UserPanel from "../user-panel/UserPanel";
import "./Header.scss";
import { Template } from "devextreme-react/core/template";
import type { HeaderProps } from "../../types";

export default function Header({
  menuToggleEnabled,
  title,
  toggleMenu,
}: HeaderProps) {
  return (
    <header className={"header-component"}>
      <Toolbar className={"header-toolbar"}>
        <Item
          visible={menuToggleEnabled}
          location={"before"}
          widget={"dxButton"}
          cssClass={"menu-button"}
        >
          <Button icon="menu" stylingMode="text" onClick={toggleMenu} />
        </Item>
        <Item
          location={"before"}
          cssClass={"header-title"}
          text={title}
          visible={!!title}
        />
        <Item
          location={"after"}
          locateInMenu={"auto"}
          menuItemTemplate={"userPanelTemplate"}
        >
          <Button
            className={"user-button authorization"}
            width={210}
            height={"100%"}
            stylingMode={"text"}
          >
            <UserPanel menuMode={"context"} />
          </Button>
        </Item>
        <Template name={"userPanelTemplate"}>
          <UserPanel menuMode={"list"} />
        </Template>
      </Toolbar>

      {/* <div className="header">
        <div className="logo-and-title">
          <div className="company-logo">
            <a href="/">
              <img src="" alt="CAU_HINH.LOGO" />
            </a>
          </div>

          <div className="login-title">
            <p className="so-title"></p>
            <p className="phan-mem-title">Hệ thống quản lý thu phí</p>
          </div>
        </div>
      </div> */}
    </header>
  );
}
