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
  MessageCircle,
  Mail,
} from "lucide-react";
import { supabase } from "../supabase";

export default function Admin() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [comments, setComments] = useState([]);
  const [subscribers, setSubscribers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/admin/login");
      return;
    }

    await Promise.all([
      loadArticles(),
      loadCategories(),
      loadComments(),
      loadSubscribers(),
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
      console.error(
        "Admin articles error:",
        error
      );
      setArticles([]);
      return;
    }

    setArticles(data || []);
  }

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Admin categories error:",
        error
      );
      setCategories([]);
      return;
    }

    setCategories(data || []);
  }

  async function loadComments() {
    const { data, error } = await supabase
      .from("article_comments")
      .select(`
        id,
        name,
        comment,
        approved,
        created_at,
        articles (
          title,
          slug
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Admin comments error:",
        error
      );
      setComments([]);
      return;
    }

    setComments(data || []);
  }

  async function loadSubscribers() {
    const { data, error } = await supabase
      .from("subscribers")
      .select(`
        id,
        email,
        subscribed_at,
        active
      `)
      .order("subscribed_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Admin subscribers error:",
        error
      );
      setSubscribers([]);
      return;
    }

    setSubscribers(data || []);
  }

  async function togglePublished(article) {
    setActionLoading(article.id);

    const { error } = await supabase
      .from("articles")
      .update({
        published: !article.published,
      })
      .eq("id", article.id);

    if (error) {
      console.error(
        "Publish update error:",
        error
      );
      setActionLoading("");
      return;
    }

    setArticles((current) =>
      current.map((item) =>
        item.id === article.id
          ? {
              ...item,
              published: !item.published,
            }
          : item
      )
    );

    setActionLoading("");
  }

  async function deleteArticle(article) {
    const confirmed = window.confirm(
      `Delete "${article.title}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(article.id);

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", article.id);

    if (error) {
      console.error(
        "Delete article error:",
        error
      );
      setActionLoading("");
      return;
    }

    setArticles((current) =>
      current.filter(
        (item) => item.id !== article.id
      )
    );

    setActionLoading("");
  }

  async function approveComment(comment) {
    setActionLoading(comment.id);

    const { error } = await supabase
      .from("article_comments")
      .update({
        approved: true,
      })
      .eq("id", comment.id);

    if (error) {
      console.error(
        "Approve comment error:",
        error
      );
      setActionLoading("");
      return;
    }

    setComments((current) =>
      current.map((item) =>
        item.id === comment.id
          ? {
              ...item,
              approved: true,
            }
          : item
      )
    );

    setActionLoading("");
  }

  async function deleteComment(comment) {
    const confirmed = window.confirm(
      "Delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(comment.id);

    const { error } = await supabase
      .from("article_comments")
      .delete()
      .eq("id", comment.id);

    if (error) {
      console.error(
        "Delete comment error:",
        error
      );
      setActionLoading("");
      return;
    }

    setComments((current) =>
      current.filter(
        (item) => item.id !== comment.id
      )
    );

    setActionLoading("");
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  function formatSubscriberDate(dateString) {
    if (!dateString) {
      return "";
    }

    return new Date(
      dateString
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const pendingComments = comments.filter(
    (comment) => !comment.approved
  );

  const approvedComments = comments.filter(
    (comment) => comment.approved
  );

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <div className="admin-loading-mark">
            ?
          </div>

          <span>
            LOADING YOUR MAGAZINE...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-main">
          <div className="admin-header-top">
            <div className="section-kicker">
              YOUR MAGAZINE
            </div>

            <button
              className="admin-logout-button"
              onClick={logout}
            >
              <LogOut size={14} />
              LOG OUT
            </button>
          </div>

          <h1>
            ARTICLES
          </h1>

          <p className="admin-header-description">
            Write, edit, publish, and organize your stories.
          </p>

          <button
            className="admin-new-article"
            onClick={() =>
              navigate("/admin/articles/new")
            }
          >
            <FilePlus size={20} />
            <span>NEW ARTICLE</span>
          </button>
        </div>
      </header>

      {/* ARTICLES */}
      <section className="admin-section">
        <div className="admin-section-heading">
          <div className="admin-section-title">
            <span className="page-no">
              01
            </span>

            <div>
              <div className="section-kicker">
                YOUR STORIES
              </div>

              <h2>
                ARTICLES
              </h2>

              <p>
                {articles.length}{" "}
                {articles.length === 1
                  ? "article"
                  : "articles"}{" "}
                in your magazine.
              </p>
            </div>
          </div>

          <div className="admin-section-count">
            {articles.length}
          </div>
        </div>

        {!articles.length ? (
          <div className="admin-empty">
            <div className="admin-empty-mark">
              ?
            </div>

            <h3>
              NO ARTICLES YET.
            </h3>

            <p>
              START YOUR FIRST RABBIT HOLE.
            </p>

            <button
              className="admin-primary-button"
              onClick={() =>
                navigate("/admin/articles/new")
              }
            >
              <FilePlus size={15} />
              NEW ARTICLE
            </button>
          </div>
        ) : (
          <div className="admin-article-list">
            {articles.map(
              (article, index) => (
                <article
                  className="admin-row"
                  key={article.id}
                >
                  <div className="admin-row-number">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <div className="admin-row-main">
                    <div className="admin-row-meta">
                      <span>
                        {article.categories?.name ||
                          "UNCATEGORIZED"}
                      </span>

                      <span>·</span>

                      <span>
                        {article.format ||
                          "NO FORMAT"}
                      </span>
                    </div>

                    <h3>
                      {article.title}
                    </h3>

                    <p className="admin-row-slug">
                      /{article.slug}
                    </p>

                    <div
                      className={
                        article.published
                          ? "admin-status published"
                          : "admin-status"
                      }
                    >
                      <span>
                        {article.published
                          ? "●"
                          : "○"}
                      </span>

                      {article.published
                        ? "PUBLISHED"
                        : "DRAFT"}
                    </div>
                  </div>

                  <div className="admin-row-actions">
                    {/* INSIGHTS */}
                    <button
                      className="admin-action-button"
                      onClick={() =>
                        navigate(
                          `/admin/insights/${article.slug}`
                        )
                      }
                      aria-label={`View insights for ${article.title}`}
                    >
                      INSIGHTS →
                    </button>

                    {/* EDIT */}
                    <button
                      className="admin-action-button"
                      onClick={() =>
                        navigate(
                          `/admin/articles/${article.slug}`
                        )
                      }
                      disabled={
                        actionLoading ===
                        article.id
                      }
                    >
                      <Edit3 size={15} />
                      EDIT
                    </button>

                    {/* PUBLISH / UNPUBLISH */}
                    <button
                      className="admin-action-button"
                      onClick={() =>
                        togglePublished(
                          article
                        )
                      }
                      disabled={
                        actionLoading ===
                        article.id
                      }
                    >
                      {article.published ? (
                        <>
                          <X size={15} />
                          UNPUBLISH
                        </>
                      ) : (
                        <>
                          <Check size={15} />
                          PUBLISH
                        </>
                      )}
                    </button>

                    {/* DELETE */}
                    <button
                      className="admin-action-button admin-delete-button"
                      onClick={() =>
                        deleteArticle(
                          article
                        )
                      }
                      disabled={
                        actionLoading ===
                        article.id
                      }
                    >
                      <Trash2 size={15} />
                      DELETE
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      {/* COMMENTS */}
      <section className="admin-section admin-comments-section">
        <div className="admin-section-heading">
          <div className="admin-section-title">
            <span className="page-no">
              02
            </span>

            <div>
              <div className="section-kicker">
                READER RESPONSE
              </div>

              <h2>
                COMMENTS
              </h2>

              <p>
                Moderate what readers are saying.
              </p>
            </div>
          </div>

          <div className="admin-comments-summary">
            <MessageCircle size={16} />

            <strong>
              {pendingComments.length}
            </strong>

            <span>
              PENDING
            </span>
          </div>
        </div>

        {/* PENDING */}
        <div className="admin-comments-block">
          <div className="admin-comments-block-heading">
            <span>
              PENDING APPROVAL
            </span>

            <span>
              {pendingComments.length}
            </span>
          </div>

          {!pendingComments.length ? (
            <div className="admin-comments-empty">
              <span>✦</span>

              <p>
                NO COMMENTS WAITING.
                <br />
                YOUR INBOX IS CLEAR.
              </p>

              <span>✦</span>
            </div>
          ) : (
            pendingComments.map(
              (comment) => (
                <article
                  className="admin-comment-row"
                  key={comment.id}
                >
                  <div className="admin-comment-number">
                    ?
                  </div>

                  <div className="admin-comment-content">
                    <div className="admin-comment-meta">
                      <strong>
                        {comment.name}
                      </strong>

                      <span>·</span>

                      <span>
                        {formatSubscriberDate(
                          comment.created_at
                        )}
                      </span>
                    </div>

                    <p className="admin-comment-text">
                      {comment.comment}
                    </p>

                    <span className="admin-comment-article">
                      {comment.articles?.title ||
                        "ARTICLE"}
                    </span>
                  </div>

                  <div className="admin-comment-actions">
                    <button
                      className="admin-comment-approve"
                      onClick={() =>
                        approveComment(
                          comment
                        )
                      }
                      disabled={
                        actionLoading ===
                        comment.id
                      }
                    >
                      <Check size={14} />
                      APPROVE
                    </button>

                    <button
                      className="admin-comment-delete"
                      onClick={() =>
                        deleteComment(
                          comment
                        )
                      }
                      disabled={
                        actionLoading ===
                        comment.id
                      }
                    >
                      <Trash2 size={14} />
                      DELETE
                    </button>
                  </div>
                </article>
              )
            )
          )}
        </div>

        {/* APPROVED */}
        <div className="admin-comments-block admin-approved-comments">
          <div className="admin-comments-block-heading">
            <span>
              APPROVED COMMENTS
            </span>

            <span>
              {approvedComments.length}
            </span>
          </div>

          {!approvedComments.length ? (
            <div className="admin-comments-empty">
              <span>✦</span>

              <p>
                NO APPROVED COMMENTS YET.
              </p>

              <span>✦</span>
            </div>
          ) : (
            approvedComments.map(
              (comment) => (
                <article
                  className="admin-comment-row"
                  key={comment.id}
                >
                  <div className="admin-comment-number approved">
                    <span>✓</span>
                  </div>

                  <div className="admin-comment-content">
                    <div className="admin-comment-meta">
                      <strong>
                        {comment.name}
                      </strong>

                      <span>·</span>

                      <span>
                        {formatSubscriberDate(
                          comment.created_at
                        )}
                      </span>
                    </div>

                    <p className="admin-comment-text">
                      {comment.comment}
                    </p>

                    <span className="admin-comment-article">
                      {comment.articles?.title ||
                        "ARTICLE"}
                    </span>
                  </div>

                  <div className="admin-comment-actions">
                    <button
                      className="admin-comment-delete"
                      onClick={() =>
                        deleteComment(
                          comment
                        )
                      }
                      disabled={
                        actionLoading ===
                        comment.id
                      }
                    >
                      <Trash2 size={14} />
                      DELETE
                    </button>
                  </div>
                </article>
              )
            )
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="admin-section">
        <div className="admin-section-heading">
          <div className="admin-section-title">
            <span className="page-no">
              03
            </span>

            <div>
              <div className="section-kicker">
                ORGANIZE
              </div>

              <h2>
                CATEGORIES
              </h2>

              <p>
                Keep your magazine organized by curiosity.
              </p>
            </div>
          </div>

          <div className="admin-section-count">
            {categories.length}
          </div>
        </div>

        <div className="admin-category-list">
          {categories.map(
            (category, index) => (
              <div
                className="admin-category-row"
                key={category.id}
              >
                <span>
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </span>

                <strong>
                  {category.name}
                </strong>

                <span>
                  /{category.slug}
                </span>
              </div>
            )
          )}
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
      </section>

      {/* SUBSCRIBERS */}
      <section className="admin-section admin-subscribers-section">
        <div className="admin-section-heading">
          <div className="admin-section-title">
            <span className="page-no">
              04
            </span>

            <div>
              <div className="section-kicker">
                THE CURIOUSLY LETTER
              </div>

              <h2>
                SUBSCRIBERS
              </h2>

              <p>
                Readers who want the rabbit holes delivered to them.
              </p>
            </div>
          </div>

          <div className="admin-comments-summary">
            <Mail size={16} />

            <strong>
              {subscribers.length}
            </strong>

            <span>
              READERS
            </span>
          </div>
        </div>

        {!subscribers.length ? (
          <div className="admin-comments-empty">
            <span>✦</span>

            <p>
              NO SUBSCRIBERS YET.
              <br />
              THE LIST WILL GROW HERE.
            </p>

            <span>✦</span>
          </div>
        ) : (
          <div className="admin-subscriber-list">
            {subscribers.map(
              (subscriber, index) => (
                <div
                  className="admin-subscriber-row"
                  key={subscriber.id}
                >
                  <span className="admin-subscriber-number">
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  <span className="admin-subscriber-email">
                    {subscriber.email}
                  </span>

                  <span className="admin-subscriber-date">
                    {formatSubscriberDate(
                      subscriber.subscribed_at
                    )}
                  </span>

                  <span
                    className={
                      subscriber.active
                        ? "admin-subscriber-status active"
                        : "admin-subscriber-status"
                    }
                  >
                    {subscriber.active
                      ? "ACTIVE"
                      : "INACTIVE"}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <section className="home-end">
        <span>
          CURIOUSLY / ADMIN
        </span>

        <span>
          ✦
        </span>

        <span>
          VOL. 01 / 2026
        </span>
      </section>
    </main>
  );
}