import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import {
  AboutPage,
  ContactsPage,
  HomePage,
  PredictionsPage,
} from "./routes/pages.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { ImagePredictionProvider } from "./context/ImagePredictionContext.tsx";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: HomePage,
      },
      {
        path: "/predict",
        element: PredictionsPage,
      },

      {
        path: "/about",
        element: AboutPage,
      },
      {
        path: "/contact",
        element: ContactsPage,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ImagePredictionProvider>
      <RouterProvider router={router} />
    </ImagePredictionProvider>
  </StrictMode>
);
