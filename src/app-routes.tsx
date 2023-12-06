import {
  HomePage,
  TasksPage,
  ProfilePage,
  MasterDetailGridPage,
  DemoPagePage,
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
    path: "/demo-page",
    element: DemoPagePage,
  },
];

export default routes.map((route) => {
  return {
    ...route,
    element: withNavigationWatcher(route.element, route.path),
  };
});
