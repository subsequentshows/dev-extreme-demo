import {
  HomePage,
  TasksPage,
  ProfilePage,
  MasterDetailGridPage,
  AccessDeniedPage,
  PhanQuyenPage,
  UsersPage,
  DemoDataGridPage,
  RowEditPage,
  ErrorPagePage,
  DanhSachNhomQuyenPage,
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
    path: "/demo-data-grid",
    element: DemoDataGridPage,
  },
  {
    path: "/row-edit",
    element: RowEditPage,
  },
  {
    path: "/error-page",
    element: ErrorPagePage,
  },
];

export default routes.map((route) => {
  return {
    ...route,
    element: withNavigationWatcher(route.element, route.path),
  };
});
