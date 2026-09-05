import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Articles from "./pages/Articles";
import Article from "./pages/Article";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import AdminArticleEditor from "./pages/AdminArticleEditor";
import AdminInsights from "./pages/AdminInsights";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* PUBLIC PAGES */}
        <Route path="/" element={<Home />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/article/:id" element={<Article />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* ADMIN LOGIN */}
        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={<Admin />}
        />

        {/* ARTICLE INSIGHTS */}
        <Route
          path="/admin/insights/:id"
          element={<AdminInsights />}
        />

        {/* NEW ARTICLE */}
        <Route
          path="/admin/new"
          element={<AdminArticleEditor />}
        />

        {/* EDIT ARTICLE */}
        <Route
          path="/admin/edit/:slug"
          element={<AdminArticleEditor />}
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}