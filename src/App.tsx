import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SMI from "./pages/SMI";
import YSQ from "./pages/YSQ";
import BECKS from "./pages/BECKS";
import BURNS from "./pages/BURNS";
import NotFound from "./pages/NotFoundPage";
import SubmittedPage from "./pages/Submitted";
import FormResultsSummary from "./pages/FormResultsSummary";
import RouteError from "./components/RouteError";
import { ClientProvider } from "./context/ClientContext";

const router = createBrowserRouter(
  [
    {
      path: "/",
      errorElement: <RouteError />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: "SMI/:token", element: <SMI /> },
        { path: "YSQ/:token", element: <YSQ /> },
        { path: "BECKS/:token", element: <BECKS /> },
        { path: "BURNS/:token", element: <BURNS /> },
        { path: "submitted", element: <SubmittedPage /> },
        { path: "summary", element: <FormResultsSummary /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  {
    basename: "/integrate-therapy-form-manager",
  }
);

export default function App() {
  return (
    <ClientProvider>
      <RouterProvider router={router} />
    </ClientProvider>
  );
}
