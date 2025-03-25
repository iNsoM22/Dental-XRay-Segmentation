import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./routes/home/HomePage";
import PredictionPage from "./routes/predict/PredictionPage";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage />,
      children: [
        {
          path: "/predict",
          element: <PredictionPage />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
