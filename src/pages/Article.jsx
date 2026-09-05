import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import { supabase } from "../supabase";

function getVisitorId() {
  let visitorId = localStorage.getItem(
    "curiously_visitor_id"
  );

  if (!visitorId) {
    visitorId = crypto.randomUUID();

    localStorage.setItem(
      "curiously_visitor_id",
      visitorId
    );
  }

  return visitorId;
}

export default function Article() {
  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // LIKE
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  // SAVE
  const [saved, setSaved] = useState(false);

  // QUICK REACTION
  const [selectedReaction, setSelectedReaction] =
    useState(null);

  // COMMENTS
  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] =
    useState(false);
  const [commentSubmitted, setCommentSubmitted] =
    useState(false);
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      setError("");

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
        .single();

      if (error) {
        console.error("Article error:", error);

        setError(
          "WE COULDN'T FIND THAT RABBIT HOLE."
        );

        setLoading(false);
        return;
      }

      setArticle(data);

      await Promise.all([
        recordArticleView(data.id),
        loadLikes(data.id),
        loadComments(data.id),
      ]);

      setLoading(false);
    }

    // =========================================================
    // ARTICLE VIEW
    // =========================================================

    async function recordArticleView(articleId) {
      const visitorId = getVisitorId();

      const { error } = await supabase
        .from("article_views")
        .insert({
          article_id: articleId,
          visitor_id: visitorId,
        });

      if (error) {
        console.error(
          "Article view error:",
          error
        );
      }
    }

    // =========================================================
    // LIKES
    // =========================================================

    async function loadLikes(articleId) {
      const visitorId = getVisitorId();

      const [
        { count },
        { data: existingLike },
      ] = await Promise.all([
        supabase
          .from("article_likes")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("article_id", articleId),

        supabase
          .from("article_likes")
          .select("id")
          .eq("article_id", articleId)
          .eq("visitor_id", visitorId)
          .maybeSingle(),
      ]);

      setLikeCount(count || 0);
      setLiked(!!existingLike);
    }

    // =========================================================
    // COMMENTS
    // =========================================================

    async function loadComments(articleId) {
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
          "Comments error:",
          error
        );

        return;
      }

      setComments(data || []);
    }

    loadArticle();
  }, [id]);

  // =========================================================
  // LIKE
  // =========================================================

  async function toggleLike() {
    if (!article) return;

    const visitorId = getVisitorId();

    if (liked) {
      const { error } = await supabase
        .from("article_likes")
        .delete()
        .eq("article_id", article.id)
        .eq("visitor_id", visitorId);

      if (error) {
        console.error(
          "Unlike error:",
          error
        );

        return;
      }

      setLiked(false);

      setLikeCount((current) =>
        Math.max(0, current - 1)
      );

      return;
    }

    const { error } = await supabase
      .from("article_likes")
      .insert({
        article_id: article.id,
        visitor_id: visitorId,
      });

    if (error) {
      console.error(
        "Like error:",
        error
      );

      return;
    }

    setLiked(true);

    setLikeCount((current) =>
      current + 1
    );
  }

  // =========================================================
  // SHARE
  // =========================================================

  async function shareArticle() {
    const shareData = {
      title:
        article?.title ||
        "CURIOUSLY",

      text:
        article?.subtitle ||
        "A rabbit hole from CURIOUSLY.",

      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);

        return;
      }

      await navigator.clipboard.writeText(
        window.location.href
      );

      window.alert("LINK COPIED.");
    } catch (error) {
      console.error(
        "Share error:",
        error
      );
    }
  }

  // =========================================================
  // SAVE
  // =========================================================

  function toggleSave() {
    setSaved((current) =>
      !current
    );
  }

  // =========================================================
  // COMMENTS
  // =========================================================

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
        "YOUR NAME MUST BE 60 CHARACTERS OR FEWER."
      );

      return;
    }

    if (comment.length > 1000) {
      setCommentError(
        "YOUR COMMENT MUST BE 1000 CHARACTERS OR FEWER."
      );

      return;
    }

    setCommentSubmitting(true);

    const { error } = await supabase
      .from("article_comments")
      .insert({
        article_id: article.id,
        name,
        comment,
        approved: false,
      });

    if (error) {
      console.error(
        "Comment submission error:",
        error
      );

      setCommentError(
        "SOMETHING WENT WRONG. PLEASE TRY AGAIN."
      );

      setCommentSubmitting(false);

      return;
    }

    setCommentName("");
    setCommentText("");
    setCommentSubmitted(true);
    setCommentSubmitting(false);
  }

  function formatCommentDate(dateString) {
    if (!dateString) return "";

    return new Date(
      dateString
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="article-page">
        <div className="empty">
          FOLLOWING THE RABBIT HOLE...
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !article) {
    return (
      <main className="article-page">
        <div className="empty">
          {error ||
            "ARTICLE NOT FOUND."}
        </div>
      </main>
    );
  }

  const category =
    article.categories?.name ||
    "CURIOUSLY";

  const sections = Array.isArray(
    article.sections
  )
    ? article.sections
    : [];

  const cover =
    article.cover_image ||
    article.coverImage ||
    "";

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="article-page">

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
            new Date(
              article.created_at
            ).toLocaleDateString(
              "en-US",
              {
                month: "long",
                year: "numeric",
              }
            )}

          {" / "}

          {article.format ||
            "STORY"}

          {article.read_time &&
            ` / ${article.read_time}`}
        </div>

        <h1>
          {article.title}
        </h1>

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
          ARTICLE CONTENT
          ===================================================== */}

      <div className="article-layout">

        {/* SIDEBAR */}

        <aside className="article-sidebar">

          <div className="article-sidebar-item">
            <span className="article-sidebar-label">
              CATEGORY
            </span>

            <strong>
              {category}
            </strong>
          </div>

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


        {/* BODY */}

        <article className="article-body">

          {article.dek && (
            <div className="article-intro">
              {article.dek}
            </div>
          )}


          {/* STORY SECTIONS */}

          {sections.length > 0 ? (
            sections.map(
              (section, index) => (
                <section
                  className="article-section"
                  key={index}
                >

                  {section.heading && (
                    <h2>
                      {section.heading}
                    </h2>
                  )}

                  {section.body && (
                    <div className="article-section-body">
                      {section.body
                        .split("\n")
                        .map(
                          (
                            paragraph,
                            paragraphIndex
                          ) =>
                            paragraph.trim() ? (
                              <p
                                key={
                                  paragraphIndex
                                }
                              >
                                {paragraph}
                              </p>
                            ) : null
                        )}
                    </div>
                  )}

                </section>
              )
            )
          ) : article.content ? (
            <section className="article-section">

              {article.content
                .split("\n")
                .map(
                  (
                    paragraph,
                    index
                  ) =>
                    paragraph.trim() ? (
                      <p key={index}>
                        {paragraph}
                      </p>
                    ) : null
                )}

            </section>
          ) : null}


          {/* =================================================
              END OF STORY
              ================================================= */}

          <div className="article-end">

            <span>✦</span>

            <div>
              END OF STORY
            </div>

            <span>✦</span>

          </div>


          {/* =================================================
              READER REACTION
              ================================================= */}

          <section className="article-reader-reaction">

            <div className="article-reaction-label">
              CURIOUSLY / READER REACTION
            </div>

            <h2>
              DID THIS SEND YOU DOWN
              <br />
              A RABBIT HOLE?
            </h2>


            {/* LIKE + SHARE */}

            <div className="article-actions">

              <button
                type="button"
                className={`article-like ${
                  liked ? "liked" : ""
                }`}
                onClick={toggleLike}
                aria-label={
                  liked
                    ? "Unlike this article"
                    : "Like this article"
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

                <span>
                  I LIKE THIS
                </span>

                <span className="like-count">
                  {likeCount}
                </span>

              </button>


              <button
                type="button"
                className="article-share"
                onClick={shareArticle}
              >

                <Share2 size={18} />

                <span>
                  SHARE
                </span>

              </button>

            </div>


            {/* =================================================
                QUICK REACTIONS
                ================================================= */}

            <div className="article-reaction-bar-inner">

              <span>
                QUICK REACTION:
              </span>

              {["♡", "✦", "!", "↗"].map(
                (reaction) => (
                  <button
                    key={reaction}
                    type="button"
                    className={
                      selectedReaction ===
                      reaction
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setSelectedReaction(
                        reaction
                      )
                    }
                    aria-label={`React ${reaction}`}
                  >
                    {reaction}
                  </button>
                )
              )}

              {selectedReaction && (
                <span className="reaction-thanks">
                  THANKS FOR THE REACTION ✦
                </span>
              )}

            </div>

          </section>


          {/* =================================================
              COMMENTS
              ================================================= */}

          <section className="article-comments">

            <div className="article-comments-header">

              <div>

                <div className="section-kicker">
                  CURIOUSLY / COMMENTS
                </div>

                <h2>
                  KEEP THE
                  <br />
                  RABBIT HOLE GOING.
                </h2>

              </div>

              <div className="article-comments-count">

                <MessageCircle size={13} />

                {comments.length}{" "}

                {comments.length === 1
                  ? "COMMENT"
                  : "COMMENTS"}

              </div>

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
                  disabled={
                    commentSubmitting
                  }
                />

                <textarea
                  value={commentText}
                  onChange={(event) =>
                    setCommentText(
                      event.target.value
                    )
                  }
                  placeholder="WHAT ARE YOU THINKING ABOUT?"
                  maxLength={1000}
                  disabled={
                    commentSubmitting
                  }
                />

              </div>


              {commentError && (
                <p className="article-comment-error">
                  {commentError}
                </p>
              )}


              {commentSubmitted && (
                <p className="article-comment-success">
                  COMMENT RECEIVED. IT'S WAITING
                  FOR APPROVAL BEFORE IT APPEARS
                  HERE.
                </p>
              )}


              <button
                type="submit"
                className="article-comment-submit"
                disabled={
                  commentSubmitting
                }
              >
                {commentSubmitting
                  ? "SENDING..."
                  : "POST COMMENT →"}
              </button>

            </form>


            {/* APPROVED COMMENTS */}

            {comments.length > 0 ? (
              <div className="article-comments-list">

                {comments.map(
                  (comment) => (
                    <article
                      className="article-comment"
                      key={comment.id}
                    >

                      <div className="article-comment-top">

                        <strong>
                          {comment.name}
                        </strong>

                        <time>
                          {formatCommentDate(
                            comment.created_at
                          )}
                        </time>

                      </div>

                      <p>
                        {comment.comment}
                      </p>

                    </article>
                  )
                )}

              </div>
            ) : (
              <div className="article-no-comments">
                BE THE FIRST TO LEAVE A THOUGHT.
              </div>
            )}

          </section>

        </article>

      </div>

    </main>
  );
}