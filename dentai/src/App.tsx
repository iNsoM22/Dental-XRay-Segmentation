import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className=" min-h-screen w-screen flex flex-col">
      {/* Background Image & Overlay */}
      <div className="app-background">
        <div className="app-overlay" />
      </div>

      {/* Main Content */}
      <Navbar />
      <Outlet />
      <Footer />

      {/* Alert Toaster */}
      <Toaster richColors />
    </div>
  );
};

export default App;
