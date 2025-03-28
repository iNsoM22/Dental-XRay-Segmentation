import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="relative h-screen w-screen overflow-x-hidden">
      {/* Background Image & Overlay */}

      <div className="fixed inset-0 bg-blue-400">
        <div className="app-background parallax z-10" />
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
