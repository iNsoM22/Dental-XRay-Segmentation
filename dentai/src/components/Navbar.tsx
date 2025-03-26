import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed w-full bg-white/10 backdrop-blur-lg shadow-md z-50 border-b border-white/20">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-extrabold text-white italic tracking-wide hover:opacity-80 transition-all"
        >
          DENT <span className="text-blue-700">AI</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-10">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/about" className="nav-link">
            About
          </Link>
          <Link to="/contact" className="nav-link">
            Contact
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button className="text-white text-2xl hover:text-blue-400 transition-all">
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
