import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  BarChart3,
} from "lucide-react";
import { supabase } from "../supabase";

export default function AdminInsights() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [views, setViews] = useState([]);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInsights();
  }, [id]);

  async function loadInsights() {
    setLoading(true);
    setError("");

    const {
      data: articleData,
      error: articleError,
    } = await supabase
      .from("articles")
      .select(`
        *,
        categories (
          name
        )
      `)
      .eq("slug", id)
      .single();

    if (articleError || !articleData) {
      console.error(
        "Article insights error:",
        articleError
      );

      setError("ARTICLE NOT FOUND.");
      setLoading(false);
      return;
    }

    setArticle(articleData);

    const [
      viewsResult,
      likesResult,
      commentsResult,
    ] = await Promise.all([
      supabase
        .from("article_views")
        .select("id, viewed_at")
        .eq("article_id", articleData.id)
        .order("viewed_at", {
          ascending: true,
        }),

      supabase
        .from("article_likes")
        .select("id")
        .eq("article_id", articleData.id),

      supabase
        .from("article_comments")
        .select(`
          id,
          name,
          comment,
          approved,
          created_at
        `)
        .eq("article_id", articleData.id)
        .order("created_at", {
          ascending: false,
        }),
    ]);

    if (viewsResult.error) {
      console.error(
        "Views error:",
        viewsResult.error
      );
    }

    if (likesResult.error) {
      console.error(
        "Likes error:",
        likesResult.error
      );
    }

    if (commentsResult.error) {
      console.error(
        "Comments error:",
        commentsResult.error
      );
    }

    setViews(viewsResult.data || []);
    setLikes((likesResult.data || []).length);
    setComments(commentsResult.data || []);

    setLoading(false);
  }

  function getDailyViews() {
    const grouped = {};

    views.forEach((view) => {
      const date = new Date(view.viewed_at);

      const key = date.toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );

      grouped[key] =
        (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped).map(
      ([date, count]) => ({
        date,
        count,
      })
    );
  }

  function formatDate(dateString) {
    if (!dateString) return "";

    return new Date(
      dateString
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <div className="admin-loading-mark">
            ?
          </div>

          <span>
            LOADING ARTICLE INSIGHTS...
          </span>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="admin-page">
        <div className="admin-empty">
          <div className="admin-empty-mark">
            ?
          </div>

          <h3>
            {error || "ARTICLE NOT FOUND."}
          </h3>

          <button
            className="admin-primary-button"
            onClick={() =>
              navigate("/admin")
            }
          >
            <ArrowLeft size={15} />
            BACK TO ADMIN
          </button>
        </div>
      </main>
    );
  }

  const totalViews = views.length;
  const totalComments = comments.length;

  const pendingComments =
    comments.filter(
      (comment) => !comment.approved
    ).length;

  const approvedComments =
    comments.filter(
      (comment) => comment.approved
    ).length;

  const engagementRate =
    totalViews > 0
      ? (
          ((likes + totalComments) /
            totalViews) *
          100
        ).toFixed(1)
      : "0.0";

  const dailyViews = getDailyViews();

  const maxViews = Math.max(
    ...dailyViews.map(
      (day) => day.count
    ),
    1
  );

  return (
    <main className="admin-page">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="admin-header">
        <div className="admin-header-main">
          <button
            className="admin-secondary-button"
            onClick={() =>
              navigate("/admin")
            }
          >
            <ArrowLeft size={15} />
            BACK TO ADMIN
          </button>

          <div
            className="section-kicker"
            style={{
              marginTop: "28px",
            }}
          >
            CURIOUSLY / INSIGHTS
          </div>

          <h1>
            ARTICLE
            <br />
            <em>INSIGHTS.</em>
          </h1>

          <p className="admin-header-description">
            A closer look at how readers are
            <br />
            finding and interacting with this story.
          </p>
        </div>
      </header>

      {/* =====================================================
          ARTICLE INFO
          ===================================================== */}

      <section className="admin-section">
        <div className="admin-section-heading">
          <div className="admin-section-title">
            <span className="page-no">
              01
            </span>

            <div>
              <div className="section-kicker">
                CURRENT STORY
              </div>

              <h2>
                {article.title}
              </h2>

              <p>
                {article.categories?.name ||
                  "UNCATEGORIZED"}
                {" · "}
                {article.format ||
                  "STORY"}
                {" · "}
                {article.read_time ||
                  ""}
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop:
              "1px solid var(--rule)",
            borderBottom:
              "1px solid var(--rule)",
            padding: "22px 0",
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          <div>
            <span className="section-kicker">
              STATUS
            </span>

            <p
              style={{
                margin: "8px 0 0",
                fontFamily:
                  '"DM Mono", monospace',
                fontSize: "12px",
              }}
            >
              {article.published
                ? "PUBLISHED"
                : "DRAFT"}
            </p>
          </div>

          <div>
            <span className="section-kicker">
              CATEGORY
            </span>

            <p
              style={{
                margin: "8px 0 0",
                fontFamily:
                  '"DM Mono", monospace',
                fontSize: "12px",
              }}
            >
              {article.categories?.name ||
                "UNCATEGORIZED"}
            </p>
          </div>

          <div>
            <span className="section-kicker">
              SLUG
            </span>

            <p
              style={{
                margin: "8px 0 0",
                fontFamily:
                  '"DM Mono", monospace',
                fontSize: "12px",
                wordBreak: "break-word",
              }}
            >
              /{article.slug}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
          ===================================================== */}

      <section className="admin-overview">
        <div className="admin-stat">
          <Eye size={18} />

          <span className="admin-stat-number">
            {totalViews}
          </span>

          <span className="admin-stat-label">
            TOTAL VIEWS
          </span>
        </div>

        <div className="admin-stat">
          <Heart size={18} />

          <span className="admin-stat-number">
            {likes}
          </span>

          <span className="admin-stat-label">
            LIKES
          </span>
        </div>

        <div className="admin-stat">
          <MessageCircle size={18} />

          <span className="admin-stat-number">
            {totalComments}
          </span>

          <span className="admin-stat-label">
            COMMENTS
          </span>
        </div>

        <div className="admin-stat">
          <BarChart3 size={18} />

          <span className="admin-stat-number">
            {engagementRate}%
          </span>

          <span className="admin-stat-label">
            ENGAGEMENT
          </span>
        </div>
      </section>

      {/* =====================================================
          VIEWS OVER TIME
          ===================================================== */}

      <section className="admin-section">
        <div className="admin-section-heading">
          <div className="admin-section-title">
            <span className="page-no">
              02
            </span>

            <div>
              <div className="section-kicker">
                READER ACTIVITY
              </div>

              <h2>
                VIEWS OVER TIME
              </h2>

              <p>
                Daily article views since the
                story started being read.
              </p>
            </div>
          </div>
        </div>

        {!dailyViews.length ? (
          <div className="admin-comments-empty">
            <span>✦</span>

            <p>
              NO VIEWS YET.
              <br />
              SEND SOME CURIOUS PEOPLE THIS WAY.
            </p>

            <span>✦</span>
          </div>
        ) : (
          <div
            style={{
              borderTop:
                "1px solid var(--rule)",
              borderBottom:
                "1px solid var(--rule)",
              padding:
                "28px 0 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "10px",
                height: "240px",
                overflowX: "auto",
                padding:
                  "0 4px",
              }}
            >
              {dailyViews.map(
                (day) => (
                  <div
                    key={day.date}
                    style={{
                      minWidth: "44px",
                      height: "100%",
                      display: "flex",
                      flexDirection:
                        "column",
                      justifyContent:
                        "flex-end",
                      alignItems:
                        "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily:
                          '"DM Mono", monospace',
                        fontSize: "10px",
                        color:
                          "var(--muted)",
                      }}
                    >
                      {day.count}
                    </span>

                    <div
                      style={{
                        width: "32px",
                        height: `${Math.max(
                          8,
                          (day.count /
                            maxViews) *
                            170
                        )}px`,
                        background:
                          "var(--pink)",
                        border:
                          "1px solid var(--rule)",
                      }}
                      title={`${day.date}: ${day.count} views`}
                    />

                    <span
                      style={{
                        fontFamily:
                          '"DM Mono", monospace',
                        fontSize: "9px",
                        color:
                          "var(--muted)",
                        writingMode:
                          "vertical-rl",
                        transform:
                          "rotate(180deg)",
                        height: "55px",
                        textAlign:
                          "right",
                      }}
                    >
                      {day.date}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          COMMENTS
          ===================================================== */}

      <section className="admin-section">
        <div className="admin-section-heading">
          <div className="admin-section-title">
            <span className="page-no">
              03
            </span>

            <div>
              <div className="section-kicker">
                READER RESPONSE
              </div>

              <h2>
                COMMENTS
              </h2>

              <p>
                A breakdown of responses to
                this article.
              </p>
            </div>
          </div>

          <div className="admin-comments-summary">
            <MessageCircle size={16} />

            <strong>
              {pendingComments}
            </strong>

            <span>
              PENDING
            </span>
          </div>
        </div>

        <div className="admin-overview">
          <div className="admin-stat">
            <span className="admin-stat-number">
              {totalComments}
            </span>

            <span className="admin-stat-label">
              TOTAL
            </span>
          </div>

          <div className="admin-stat">
            <span className="admin-stat-number">
              {approvedComments}
            </span>

            <span className="admin-stat-label">
              APPROVED
            </span>
          </div>

          <div className="admin-stat">
            <span className="admin-stat-number">
              {pendingComments}
            </span>

            <span className="admin-stat-label">
              PENDING
            </span>
          </div>
        </div>

        {comments.length > 0 && (
          <div className="admin-comments-block">
            <div className="admin-comments-block-heading">
              <span>
                RECENT COMMENTS
              </span>

              <span>
                {comments.length}
              </span>
            </div>

            {comments.map(
              (comment) => (
                <article
                  className="admin-comment-row"
                  key={comment.id}
                >
                  <div
                    className={
                      comment.approved
                        ? "admin-comment-number approved"
                        : "admin-comment-number"
                    }
                  >
                    {comment.approved ? (
                      <span>✓</span>
                    ) : (
                      "?"
                    )}
                  </div>

                  <div className="admin-comment-content">
                    <div className="admin-comment-meta">
                      <strong>
                        {comment.name}
                      </strong>

                      <span>·</span>

                      <span>
                        {formatDate(
                          comment.created_at
                        )}
                      </span>
                    </div>

                    <p className="admin-comment-text">
                      {comment.comment}
                    </p>

                    <span className="admin-comment-article">
                      {comment.approved
                        ? "APPROVED"
                        : "PENDING APPROVAL"}
                    </span>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <section className="home-end">
        <span>
          CURIOUSLY / ARTICLE INSIGHTS
        </span>

        <span>✦</span>

        <span>
          {article.published
            ? "PUBLISHED"
            : "DRAFT"}
        </span>
      </section>
    </main>
  );
}