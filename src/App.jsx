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
        <Route path="/" element={<Home />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/article/:id" element={<Article />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />

        <Route
          path="/admin/insights/:id"
          element={<AdminInsights />}
        />

        <Route
          path="/admin/new"
          element={<AdminArticleEditor />}
        />

        <Route
          path="/admin/edit/:slug"
          element={<AdminArticleEditor />}
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}