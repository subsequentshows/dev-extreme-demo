import {
  HomePage,
  MasterDetailGridPage,
  AccessDeniedPage,
  PhanQuyenPage,
  UsersPage,
  HoSoXaDetailPage,
  DanhMucPhuongXaPage,
  ErrorPagePage,
  DanhSachNhomQuyenPage,
  RowEditPage,
  DanhMucHuyenPage,
  BaoCao1Page,
  BaoCao2Page,
} from "./pages";
import { withNavigationWatcher } from "./contexts/navigation";

const routes = [
  {
    path: "/home",
    element: HomePage,
  },
  // {
  //   path: "/master-detail-grid",
  //   element: MasterDetailGridPage,
  // },
  {
    path: "/access-denied",
    element: AccessDeniedPage,
  },
  {
    path: "/phan-quyen",
    element: PhanQuyenPage,
  },
  {
    path: "/danh-sach-nhom-quyen",
    element: DanhSachNhomQuyenPage,
  },
  {
    path: "/users",
    element: UsersPage,
  },
  {
    path: "/ho-so-xa-detail",
    element: HoSoXaDetailPage,
  },
  {
    path: "/danh-muc-phuong-xa",
    element: DanhMucPhuongXaPage,
  },
  {
    path: "/error-page",
    element: ErrorPagePage,
  },
  {
    path: "/row-edit",
    element: RowEditPage,
  },
  {
    path: "/danh-muc-huyen",
    element: DanhMucHuyenPage,
  },
  {
    path: "/bao-cao-1",
    element: BaoCao1Page,
  },
  {
    path: "/bao-cao-2",
    element: BaoCao2Page,
  },
];

export default routes.map((route) => {
  return {
    ...route,
    element: withNavigationWatcher(route.element, route.path),
  };
});
