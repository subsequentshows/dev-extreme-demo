import path from "path";

export const navigation = [
  {
    text: "Home",
    path: "/home",
  },
  {
    text: "Danh sách nhóm quyền",
    path: "/danh-sach-nhom-quyen",
    // icon: "folder",
  },
  {
    text: "Row Edit",
    path: "/row-edit",
  },

  // {
  //   text: "Phan Quyen",
  //   path: "/phan-quyen",
  //   icon: "folder",
  // },
  // {
  //   text: "Master Detail Grid",
  //   path: "/master-detail-grid",
  //   icon: "folder",
  // },
  // {
  //   text: "Users Page",
  //   path: "/users",
  //   icon: "globe",
  // },
  // {
  //   text: "Hồ sơ xã detail",
  //   path: "/ho-so-xa-detail",
  //   icon: "globe",
  // },
  {
    text: "Error Page",
    path: "/error-page",
  },
  {
    text: "Access Denied",
    path: "/access-denied",
  },
  {
    text: "Danh mục",
    items: [
      {
        text: "Danh mục huyện",
        path: "/danh-muc-huyen",
      },
      {
        text: "Danh mục phường xã",
        path: "/danh-muc-phuong-xa",
      },
    ],
  },
];
