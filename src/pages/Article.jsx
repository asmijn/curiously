import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Heart,
  Share2,
  Send,
  X,
} from "lucide-react";
import { supabase } from "../supabase";
import ArticleCard from "../components/ArticleCard";

function getVisitorId() {
  const key = "curiously_visitor_id";

  let visitorId = localStorage.getItem(key);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(key, visitorId);
  }

  return visitorId;
}

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function Article() {
  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  const [relatedStories, setRelatedStories] = useState([]);

  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] =
    useState(false);
  const [commentSubmitted, setCommentSubmitted] =
    useState(false);
  const [commentError, setCommentError] = useState("");

  const [readingProgress, setReadingProgress] =
    useState(0);

  const [showReadingProgress, setShowReadingProgress] =
    useState(() => {
      return (
        localStorage.getItem(
          "curiously_hide_reading_progress"
        ) !== "true"
      );
    });

  /* =========================================================
     LOAD ARTICLE
     ========================================================= */

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      setError("");

      try {
        const { data, error } = await supabase
          .from("articles")
          .select(`
            *,
            categories (
              name
            )
          `)
          .eq("slug", id)
          .eq("published", true)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          setError("STORY NOT FOUND.");
          setArticle(null);
          return;
        }

        const formattedArticle = {
          ...data,

          category:
            data.categories?.name ||
            "CURIOUSLY",

          readTime:
            data.read_time ||
            "",

          coverImage:
            data.cover_image ||
            "",

          sections:
            data.sections ||
            [],
        };

        setArticle(formattedArticle);

        loadLikes(data.id);
        loadBookmark(data.id);
        loadComments(data.id);
        loadRelatedStories(data);
      } catch (err) {
        console.error(
          "Error loading article:",
          err
        );

        setError(
          "WE COULDN'T LOAD THIS STORY. PLEASE TRY AGAIN."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadArticle();
    }
  }, [id]);

  /* =========================================================
     READING PROGRESS
     ========================================================= */

  useEffect(() => {
    function updateReadingProgress() {
      const scrollTop = window.scrollY;

      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      if (documentHeight <= 0) {
        setReadingProgress(0);
        return;
      }

      const progress =
        (scrollTop / documentHeight) * 100;

      setReadingProgress(
        Math.min(100, Math.max(0, progress))
      );
    }

    window.addEventListener(
      "scroll",
      updateReadingProgress,
      { passive: true }
    );

    updateReadingProgress();

    return () => {
      window.removeEventListener(
        "scroll",
        updateReadingProgress
      );
    };
  }, []);

  function closeReadingProgress() {
    setShowReadingProgress(false);

    localStorage.setItem(
      "curiously_hide_reading_progress",
      "true"
    );
  }

  function reopenReadingProgress() {
    setShowReadingProgress(true);

    localStorage.removeItem(
      "curiously_hide_reading_progress"
    );
  }

  /* =========================================================
     LIKES
     ========================================================= */

  async function loadLikes(articleId) {
    try {
      const visitorId = getVisitorId();

      const { count, error: countError } =
        await supabase
          .from("article_likes")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("article_id", articleId);

      if (countError) {
        console.error(
          "Error loading like count:",
          countError
        );
      } else {
        setLikeCount(count || 0);
      }

      const { data, error } = await supabase
        .from("article_likes")
        .select("id")
        .eq("article_id", articleId)
        .eq("visitor_id", visitorId)
        .maybeSingle();

      if (error) {
        console.error(
          "Error checking like:",
          error
        );
      }

      setLiked(!!data);
    } catch (err) {
      console.error(
        "Like loading error:",
        err
      );
    }
  }

  async function toggleLike() {
    if (!article) return;

    try {
      const visitorId = getVisitorId();

      if (liked) {
        const { error } = await supabase
          .from("article_likes")
          .delete()
          .eq("article_id", article.id)
          .eq("visitor_id", visitorId);

        if (error) {
          throw error;
        }

        setLiked(false);

        setLikeCount((count) =>
          Math.max(0, count - 1)
        );
      } else {
        const { error } = await supabase
          .from("article_likes")
          .insert({
            article_id: article.id,
            visitor_id: visitorId,
          });

        if (error) {
          throw error;
        }

        setLiked(true);

        setLikeCount((count) => count + 1);
      }
    } catch (err) {
      console.error(
        "Error toggling like:",
        err
      );

      loadLikes(article.id);
    }
  }

  /* =========================================================
     BOOKMARKS
     ========================================================= */

  async function loadBookmark(articleId) {
    try {
      const visitorId = getVisitorId();

      const { data, error } = await supabase
        .from("article_bookmarks")
        .select("id")
        .eq("article_id", articleId)
        .eq("visitor_id", visitorId)
        .maybeSingle();

      if (error) {
        console.error(
          "Error loading bookmark:",
          error
        );

        return;
      }

      setSaved(!!data);
    } catch (err) {
      console.error(
        "Bookmark loading error:",
        err
      );
    }
  }

  async function toggleSave() {
    if (!article) return;

    try {
      const visitorId = getVisitorId();

      if (saved) {
        const { error } = await supabase
          .from("article_bookmarks")
          .delete()
          .eq("article_id", article.id)
          .eq("visitor_id", visitorId);

        if (error) {
          throw error;
        }

        setSaved(false);
      } else {
        const { error } = await supabase
          .from("article_bookmarks")
          .insert({
            article_id: article.id,
            visitor_id: visitorId,
          });

        if (error) {
          throw error;
        }

        setSaved(true);
      }
    } catch (err) {
      console.error(
        "Error toggling bookmark:",
        err
      );
    }
  }

  /* =========================================================
     COMMENTS
     ========================================================= */

  async function loadComments(articleId) {
    try {
      const { data, error } = await supabase
        .from("article_comments")
        .select(`
          id,
          name,
          comment,
          created_at
        `)
        .eq("article_id", articleId)
        .eq("approved", true)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Error loading comments:",
          error
        );

        return;
      }

      setComments(data || []);
    } catch (err) {
      console.error(
        "Comments loading error:",
        err
      );
    }
  }

  async function submitComment(event) {
    event.preventDefault();

    setCommentError("");
    setCommentSubmitted(false);

    const name = commentName.trim();
    const comment = commentText.trim();

    if (!name) {
      setCommentError(
        "PLEASE ENTER YOUR NAME."
      );

      return;
    }

    if (!comment) {
      setCommentError(
        "PLEASE WRITE A COMMENT."
      );

      return;
    }

    if (name.length > 60) {
      setCommentError(
        "NAME MUST BE 60 CHARACTERS OR LESS."
      );

      return;
    }

    if (comment.length > 1000) {
      setCommentError(
        "COMMENT MUST BE 1000 CHARACTERS OR LESS."
      );

      return;
    }

    if (!article) return;

    setCommentSubmitting(true);

    try {
      const { error } = await supabase
        .from("article_comments")
        .insert({
          article_id: article.id,
          name,
          comment,
          approved: false,
        });

      if (error) {
        throw error;
      }

      setCommentName("");
      setCommentText("");
      setCommentSubmitted(true);
    } catch (err) {
      console.error(
        "Error submitting comment:",
        err
      );

      setCommentError(
        "WE COULDN'T SUBMIT YOUR COMMENT. PLEASE TRY AGAIN."
      );
    } finally {
      setCommentSubmitting(false);
    }
  }

  /* =========================================================
     RELATED STORIES
     ========================================================= */

  async function loadRelatedStories(
    currentArticle
  ) {
    try {
      console.log(
        "Loading related stories for:",
        currentArticle.title
      );

      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq("published", true)
        .order("created_at", {
          ascending: false,
        })
        .limit(20);

      if (error) {
        console.error(
          "Error loading related stories:",
          error
        );

        return;
      }

      console.log(
        "Published articles found:",
        data?.length || 0
      );

      const currentCategory =
        currentArticle.categories?.name ||
        "";

      const otherArticles = (data || [])
        .filter(
          (story) =>
            story.id !== currentArticle.id
        )
        .map((story) => ({
          ...story,

          category:
            story.categories?.name ||
            "UNCATEGORIZED",

          readTime:
            story.read_time ||
            "",

          coverImage:
            story.cover_image ||
            "",

          sections:
            story.sections ||
            [],
        }));

      const sameCategory =
        otherArticles.filter(
          (story) =>
            story.category ===
            currentCategory
        );

      const differentCategory =
        otherArticles.filter(
          (story) =>
            story.category !==
            currentCategory
        );

      const selected = [
        ...sameCategory,
        ...differentCategory,
      ].slice(0, 3);

      console.log(
        "Related stories selected:",
        selected
      );

      setRelatedStories(selected);
    } catch (err) {
      console.error(
        "Related stories error:",
        err
      );
    }
  }

  /* =========================================================
     SHARE
     ========================================================= */

  async function handleShare() {
    if (!article) return;

    const shareData = {
      title: article.title,

      text:
        article.subtitle ||
        "Read this story on CURIOUSLY.",

      url: window.location.href,
    };

    try {
      if (
        navigator.share &&
        typeof navigator.share === "function"
      ) {
        await navigator.share(shareData);
      } else if (
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(
          window.location.href
        );
      } else {
        window.prompt(
          "COPY THIS LINK:",
          window.location.href
        );
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error(
          "Error sharing article:",
          err
        );
      }
    }
  }

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <main className="article-page">
        <section className="article-loading">
          <p>LOADING STORY...</p>
        </section>
      </main>
    );
  }

  /* =========================================================
     ERROR
     ========================================================= */

  if (error || !article) {
    return (
      <main className="article-page">
        <section className="article-error">
          <p>
            {error || "STORY NOT FOUND."}
          </p>

          <Link
            to="/articles"
            className="article-back"
          >
            <ArrowLeft size={14} />
            BACK TO THE ARCHIVE
          </Link>
        </section>
      </main>
    );
  }

  /* =========================================================
     ARTICLE DATA
     ========================================================= */

  const category =
    article.categories?.name ||
    article.category ||
    "CURIOUSLY";

  const cover =
    article.cover_image ||
    article.coverImage ||
    "";

  const sections =
    Array.isArray(article.sections) &&
    article.sections.length > 0
      ? article.sections
      : [];

  return (
    <main
      className="article-page"
      style={{
        "--reading-progress": `${readingProgress}%`,
      }}
    >
      {/* =====================================================
          READING PROGRESS
          ===================================================== */}

      {showReadingProgress ? (
        <div className="article-reading-progress">

          <button
            type="button"
            className="article-reading-progress-close"
            onClick={closeReadingProgress}
            aria-label="Hide reading progress"
            title="Hide reading progress"
          >
            <X size={13} />
          </button>

          <div className="article-reading-progress-line">
            <div className="article-reading-progress-fill" />
          </div>

          <span className="article-reading-progress-percent">
            {Math.round(readingProgress)}%
          </span>

        </div>
      ) : (
        <button
          type="button"
          className="article-reading-progress-reopen"
          onClick={reopenReadingProgress}
          aria-label="Show reading progress"
          title="Show reading progress"
        >
          <span>READING</span>
          <span>PROGRESS</span>
          <span>+</span>
        </button>
      )}

      {/* =====================================================
          HERO
          ===================================================== */}

      <header className="article-hero">

        <Link
          to="/articles"
          className="article-back"
        >
          <ArrowLeft size={14} />
          BACK TO THE ARCHIVE
        </Link>

        <div className="article-kicker">
          CURIOUSLY / {category}
        </div>

        <div className="article-meta">
          {article.date ||
            formatDate(article.created_at)}

          {" / "}

          {article.format || "STORY"}

          {article.read_time &&
            ` / ${article.read_time}`}
        </div>

        <h1>{article.title}</h1>

        {article.subtitle && (
          <p className="article-subtitle">
            {article.subtitle}
          </p>
        )}

        {article.dek && (
          <p className="article-dek">
            {article.dek}
          </p>
        )}

      </header>

      {/* =====================================================
          COVER
          ===================================================== */}

      <div className="article-cover-wrap">

        {cover ? (
          <img
            src={cover}
            alt={article.title}
            className="article-cover"
            onError={(event) => {
              console.error(
                "Article cover failed to load:",
                cover
              );

              event.currentTarget.style.display =
                "none";
            }}
          />
        ) : (
          <div className="article-cover-placeholder">
            {category}
          </div>
        )}

      </div>

      {/* =====================================================
          ARTICLE LAYOUT
          ===================================================== */}

      <div className="article-layout">

        {/* SIDEBAR */}

        <aside className="article-sidebar">

          {/* CATEGORY */}

          <div
            className={`article-sidebar-item category-${category
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            <span className="article-sidebar-label">
              CATEGORY
            </span>

            <strong>
              {category}
            </strong>
          </div>

          {/* FORMAT */}

          {article.format && (
            <div className="article-sidebar-item">

              <span className="article-sidebar-label">
                FORMAT
              </span>

              <strong>
                {article.format}
              </strong>

            </div>
          )}

          {/* TAG */}

          {article.tag && (
            <div className="article-sidebar-item">

              <span className="article-sidebar-label">
                TAG
              </span>

              <strong>
                {article.tag}
              </strong>

            </div>
          )}

          {/* SAVE */}

          <button
            type="button"
            className={`article-save ${
              saved ? "saved" : ""
            }`}
            onClick={toggleSave}
          >
            <Bookmark size={15} />

            {saved
              ? "SAVED"
              : "SAVE STORY"}
          </button>

        </aside>

        {/* ===================================================
            ARTICLE BODY
            =================================================== */}

        <article className="article-body">

          {article.dek && (
            <div className="article-intro">
              {article.dek}
            </div>
          )}

          {/* SECTIONS */}

          {sections.length > 0 ? (

            sections.map(
              (section, index) => (
                <section
                  key={index}
                  className="article-section"
                >

                  {section.heading && (
                    <h2>
                      {section.heading}
                    </h2>
                  )}

                  {section.body &&
                    String(section.body)
                      .split("\n")
                      .map(
                        (
                          paragraph,
                          paragraphIndex
                        ) =>
                          paragraph.trim() && (
                            <p
                              key={
                                paragraphIndex
                              }
                            >
                              {paragraph}
                            </p>
                          )
                      )}

                </section>
              )
            )

          ) : article.content ? (

            <div className="article-content">

              {String(article.content)
                .split("\n")
                .map(
                  (paragraph, index) =>
                    paragraph.trim() && (
                      <p key={index}>
                        {paragraph}
                      </p>
                    )
                )}

            </div>

          ) : (

            <p>
              THIS STORY DOESN'T HAVE ANY
              CONTENT YET.
            </p>

          )}

          {/* =================================================
              REACTIONS
              ================================================= */}

          <div className="article-reader-reaction">

            <div className="article-reaction-bar-inner">

              {/* LIKE */}

              <button
                type="button"
                className={`article-like ${
                  liked ? "liked" : ""
                }`}
                onClick={toggleLike}
                aria-label={
                  liked
                    ? "Unlike this story"
                    : "Like this story"
                }
              >

                <Heart
                  size={18}
                  fill={
                    liked
                      ? "currentColor"
                      : "none"
                  }
                />

                <span className="like-count">
                  {likeCount}
                </span>

              </button>

              {/* SHARE */}

              <button
                type="button"
                className="article-share"
                onClick={handleShare}
              >

                <Share2 size={17} />

                SHARE

              </button>

            </div>

            <div className="article-reaction-label">

              {liked
                ? "YOU LIKE THIS STORY."
                : "LIKE THIS STORY IF IT SENT YOU DOWN A RABBIT HOLE."}

            </div>

          </div>

          {/* =================================================
              COMMENTS
              ================================================= */}

          <section className="article-comments">

            <div className="article-comments-header">

              <div>

                <div className="section-kicker">
                  CURIOUSLY / READER MAIL
                </div>

                <h2>
                  SAY SOMETHING.
                </h2>

              </div>

              <span className="article-comments-count">

                {comments.length}{" "}

                {comments.length === 1
                  ? "COMMENT"
                  : "COMMENTS"}

              </span>

            </div>

            {/* COMMENT FORM */}

            <form
              className="article-comment-form"
              onSubmit={submitComment}
            >

              <div className="article-comment-fields">

                <input
                  type="text"
                  value={commentName}
                  onChange={(event) =>
                    setCommentName(
                      event.target.value
                    )
                  }
                  placeholder="YOUR NAME"
                  maxLength={60}
                />

                <textarea
                  value={commentText}
                  onChange={(event) =>
                    setCommentText(
                      event.target.value
                    )
                  }
                  placeholder="YOUR THOUGHTS..."
                  maxLength={1000}
                  rows={5}
                />

              </div>

              {commentError && (
                <p className="article-comment-error">
                  {commentError}
                </p>
              )}

              {commentSubmitted && (
                <p className="article-comment-success">
                  COMMENT RECEIVED. IT'S
                  WAITING FOR APPROVAL BEFORE
                  IT APPEARS HERE.
                </p>
              )}

              <button
                type="submit"
                className="article-comment-submit"
                disabled={commentSubmitting}
              >

                <Send size={14} />

                {commentSubmitting
                  ? "SENDING..."
                  : "SEND COMMENT"}

              </button>

            </form>

            {/* COMMENTS LIST */}

            <div className="article-comments-list">

              {comments.length > 0 ? (

                comments.map((comment) => (

                  <article
                    key={comment.id}
                    className="article-comment"
                  >

                    <div className="article-comment-top">

                      <strong>
                        {comment.name}
                      </strong>

                      <span>
                        {formatDate(
                          comment.created_at
                        )}
                      </span>

                    </div>

                    <p>
                      {comment.comment}
                    </p>

                  </article>

                ))

              ) : (

                <div className="article-no-comments">
                  NO COMMENTS YET. BE THE FIRST.
                </div>

              )}

            </div>

          </section>

        </article>

      </div>

      {/* =====================================================
          RELATED STORIES
          ===================================================== */}

      {relatedStories.length > 0 && (

        <section className="article-related">

          <div className="article-related-header">

            <div className="section-kicker">
              CURIOUSLY / KEEP EXPLORING
            </div>

            <h2>
              YOU MIGHT
              <br />
              ALSO LIKE.
            </h2>

          </div>

          <div className="archive-grid">

            {relatedStories.map(
              (story, index) => (

                <ArticleCard
                  key={story.id}
                  article={story}
                  index={index}
                />

              )
            )}

          </div>

        </section>

      )}

    </main>
  );
}