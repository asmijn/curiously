import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Edit3,
  FilePlus,
  LogOut,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../supabase";

export default function Admin() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/admin-login");
      return;
    }

    setUser(user);

    await Promise.all([
      loadArticles(),
      loadCategories(),
    ]);

    setLoading(false);
  }

  async function loadArticles() {
    const { data, error } = await supabase
      .from("articles")
      .select(`
        *,
        categories (
          name
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Articles error:", error);
      return;
    }

    setArticles(data || []);
  }

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Categories error:", error);
      return;
    }

    setCategories(data || []);
  }

  async function togglePublished(article) {
    const { error } = await supabase
      .from("articles")
      .update({
        published: !article.published,
      })
      .eq("id", article.id);

    if (error) {
      console.error("Publish error:", error);
      setMessage("Could not update article.");
      return;
    }

    setMessage(
      article.published
        ? "Article unpublished."
        : "Article published."
    );

    await loadArticles();
  }

  async function deleteArticle(article) {
    const confirmed = window.confirm(
      `Delete "${article.title}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", article.id);

    if (error) {
      console.error("Delete error:", error);
      setMessage("Could not delete article.");
      return;
    }

    setMessage("Article deleted.");

    await loadArticles();
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/admin-login");
  }

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <div className="admin-loading-mark">?</div>
          <span>LOADING CURIOUSLY ADMIN...</span>
        </div>
      </main>
    );
  }

  const publishedCount = articles.filter(
    (article) => article.published
  ).length;

  const draftCount = articles.length - publishedCount;

  return (
    <main className="admin-page">
      {/* HEADER */}

      <header className="admin-header">
        <div className="admin-header-main">
          <div className="section-kicker">
            CURIOUSLY / ADMIN
          </div>

          <h1>
            THE
            <br />
            <em>BACK ROOM.</em>
          </h1>

          <p className="admin-header-description">
            Your quiet little corner for managing
            <br />
            everything inside the magazine.
          </p>
        </div>

        <div className="admin-account">
          <div className="admin-account-info">
            <span className="admin-account-label">
              SIGNED IN AS
            </span>

            <span className="admin-account-email">
              {user?.email}
            </span>
          </div>

          <button
            className="admin-logout-button"
            onClick={logout}
            aria-label="Log out of Curiously admin"
          >
            <LogOut size={15} />
            LOG OUT
          </button>
        </div>
      </header>

      {/* DASHBOARD SUMMARY */}

      <section
        className="admin-overview"
        aria-label="Magazine overview"
      >
        <div className="admin-stat">
          <span className="admin-stat-number">
            {articles.length}
          </span>

          <span className="admin-stat-label">
            TOTAL STORIES
          </span>
        </div>

        <div className="admin-stat">
          <span className="admin-stat-number">
            {publishedCount}
          </span>

          <span className="admin-stat-label">
            PUBLISHED
          </span>
        </div>

        <div className="admin-stat">
          <span className="admin-stat-number">
            {draftCount}
          </span>

          <span className="admin-stat-label">
            DRAFTS
          </span>
        </div>

        <div className="admin-stat">
          <span className="admin-stat-number">
            {categories.length}
          </span>

          <span className="admin-stat-label">
            CATEGORIES
          </span>
        </div>
      </section>

      {/* MESSAGE */}

      {message && (
        <div
          className="admin-message"
          role="status"
          aria-live="polite"
        >
          <Check size={15} />
          <span>{message}</span>

          <button
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ARTICLES */}

      <section className="admin-section">
        <div className="admin-section-heading">
          <div className="admin-section-title">
            <span className="page-no">01</span>

            <div>
              <div className="section-kicker">
                YOUR MAGAZINE
              </div>

              <h2>ARTICLES</h2>

              <p>
                Write, edit, publish, and organize
                your stories.
              </p>
            </div>
          </div>

          <button
            className="admin-primary-button"
            onClick={() =>
              navigate("/admin/new")
            }
          >
            <FilePlus size={16} />
            NEW ARTICLE
          </button>
        </div>

        <div className="admin-article-list">
          {!articles.length && (
            <div className="admin-empty">
              <div className="admin-empty-mark">
                ?
              </div>

              <h3>
                NO STORIES YET.
              </h3>

              <p>
                Start your first rabbit hole.
              </p>

              <button
                className="admin-primary-button"
                onClick={() =>
                  navigate("/admin/new")
                }
              >
                CREATE FIRST ARTICLE
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          {articles.map((article, index) => (
            <article
              className="admin-article-row"
              key={article.id}
            >
              <div className="admin-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="admin-article-info">
                <div className="admin-article-meta">
                  <span className="admin-category-label">
                    {article.categories?.name ||
                      "UNCATEGORIZED"}
                  </span>

                  <span>·</span>

                  <span>
                    {article.format ||
                      "NO FORMAT"}
                  </span>
                </div>

                <h3>{article.title}</h3>

                {article.subtitle && (
                  <p className="admin-article-subtitle">
                    {article.subtitle}
                  </p>
                )}

                <span className="admin-slug">
                  /{article.slug}
                </span>
              </div>

              <div className="admin-status">
                <span
                  className={
                    article.published
                      ? "status-published"
                      : "status-draft"
                  }
                >
                  <span className="status-dot" />
                  {article.published
                    ? "PUBLISHED"
                    : "DRAFT"}
                </span>
              </div>

              <div className="admin-row-actions">
                <button
                  className="admin-action-button"
                  onClick={() =>
                    navigate(
                      `/admin/edit/${article.slug}`
                    )
                  }
                  aria-label={`Edit ${article.title}`}
                >
                  <Edit3 size={14} />
                  EDIT
                </button>

                <button
                  className="admin-action-button"
                  onClick={() =>
                    togglePublished(article)
                  }
                  aria-label={
                    article.published
                      ? `Unpublish ${article.title}`
                      : `Publish ${article.title}`
                  }
                >
                  {article.published ? (
                    <>
                      <X size={14} />
                      UNPUBLISH
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      PUBLISH
                    </>
                  )}
                </button>

                <button
                  className="admin-action-button admin-delete-button"
                  onClick={() =>
                    deleteArticle(article)
                  }
                  aria-label={`Delete ${article.title}`}
                >
                  <Trash2 size={14} />
                  DELETE
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}

      <section className="admin-section admin-categories-section">
        <div className="admin-section-heading">
          <div className="admin-section-title">
            <span className="page-no">02</span>

            <div>
              <div className="section-kicker">
                ORGANIZE THE RABBIT HOLES
              </div>

              <h2>CATEGORIES</h2>

              <p>
                Keep your editorial universe tidy.
              </p>
            </div>
          </div>

          <button
            className="admin-secondary-button"
            onClick={() =>
              navigate("/admin/categories")
            }
          >
            MANAGE CATEGORIES
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="admin-category-list">
          {categories.map((category) => (
            <span
              key={category.id}
              className="admin-category-pill"
            >
              {category.name}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}