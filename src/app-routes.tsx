import {
  HomePage,
  TasksPage,
  ProfilePage,
  MasterDetailGridPage,
  AccessDeniedPage,
  PhanQuyenPage,
  UsersPage,
  HoSoXaDetailPage,
  DanhMucPhuongXaPage,
  ErrorPagePage,
  DanhSachNhomQuyenPage,
  DanhSachNhomQuyen2Page,
} from "./pages";
import { withNavigationWatcher } from "./contexts/navigation";

const routes = [
  {
    path: "/tasks",
    element: TasksPage,
  },
  {
    path: "/profile",
    element: ProfilePage,
  },
  {
    path: "/home",
    element: HomePage,
  },
  {
    path: "/master-detail-grid",
    element: MasterDetailGridPage,
  },
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
    path: "/danh-sach-nhom-quyen-2",
    element: DanhSachNhomQuyen2Page,
  },
];

export default routes.map((route) => {
  return {
    ...route,
    element: withNavigationWatcher(route.element, route.path),
  };
});
