import { lazy, Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Loader2 } from "lucide-react";
import RouteError from "./components/RouteError";
import { ClientProvider } from "./context/ClientContext";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const SMI = lazy(() => import("./pages/SMI"));
const YSQ = lazy(() => import("./pages/YSQ"));
const BECKS = lazy(() => import("./pages/BECKS"));
const BURNS = lazy(() => import("./pages/BURNS"));
const NotFound = lazy(() => import("./pages/NotFoundPage"));
const SubmittedPage = lazy(() => import("./pages/Submitted"));
const FormResultsSummary = lazy(() => import("./pages/FormResultsSummary"));

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
    basename: import.meta.env.VITE_BASE_PATH || "/",
  }
);

const PageFallback = () => (
  <div className="flex justify-center items-center min-h-screen" aria-busy>
    <Loader2 className="animate-spin text-blue-600" size={120} />
  </div>
);

export default function App() {
  return (
    <ClientProvider>
      <Suspense fallback={<PageFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </ClientProvider>
  );
}
