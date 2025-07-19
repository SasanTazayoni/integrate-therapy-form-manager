import { RouterProvider, createBrowserRouter } from "react-router-dom";
import YSQ from "./pages/YSQ";
import SMI from "./pages/SMI";
import BECKS from "./pages/BECKS";
import BURNS from "./pages/BURNS";
import NotFound from "./pages/404";
import Dashboard from "./pages/Dashboard";

import { SMIAction } from "./actions/SMIAction";
import { YSQAction } from "./actions/YSQAction";
import { BECKSAction } from "./actions/BECKSAction";
import { BURNSAction } from "./actions/BURNSAction";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/SMI",
      element: <SMI />,
      action: SMIAction,
    },
    {
      path: "/YSQ",
      element: <YSQ />,
      action: YSQAction,
    },
    {
      path: "/BECKS",
      element: <BECKS />,
      action: BECKSAction,
    },
    {
      path: "/BURNS",
      element: <BURNS />,
      action: BURNSAction,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ],
  {
    basename: "/integrate-therapy-form-manager",
  }
);

export default function App() {
  return <RouterProvider router={router} />;
}
