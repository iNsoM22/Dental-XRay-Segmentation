// keeeeeray 

import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import PredictionPage from "./components/PredictionPage";

const App = () => {
  const [uploadedImage, setUploadedImage] = useState(null); // State to store uploaded image

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Home setUploadedImage={setUploadedImage} />}
        />
        <Route
          path="/prediction"
          element={<PredictionPage uploadedImage={uploadedImage} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
