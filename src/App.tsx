import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SMI from "./pages/SMI";
import YSQ from "./pages/YSQ";
import BECKS from "./pages/BECKS";
import BURNS from "./pages/BURNS";
import NotFound from "./pages/NotFoundPage";
import { SMIAction } from "./actions/SMIAction";
import { YSQAction } from "./actions/YSQAction";
import { BECKSAction } from "./actions/BECKSAction";
import { BURNSAction } from "./actions/BURNSAction";

import RouteError from "./components/RouteError";

const router = createBrowserRouter(
  [
    {
      path: "/",
      errorElement: <RouteError />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: "SMI/:token", element: <SMI />, action: SMIAction },
        { path: "YSQ/:token", element: <YSQ />, action: YSQAction },
        { path: "BECKS/:token", element: <BECKS />, action: BECKSAction },
        { path: "BURNS/:token", element: <BURNS />, action: BURNSAction },
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  {
    basename: "/integrate-therapy-form-manager",
  }
);

export default function App() {
  return <RouterProvider router={router} />;
}
