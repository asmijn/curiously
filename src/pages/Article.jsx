import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, Heart } from "lucide-react";
import { supabase } from "../supabase";

export default function Article() {
  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);

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
        setArticle(null);
      } else {
        setArticle({
          ...data,
          id: data.slug,
          category:
            data.categories?.name || "UNCATEGORIZED",
          readTime: data.read_time || "",
          coverImage: data.cover_image || "",
          sections: data.sections || [],
        });
      }

      setLoading(false);
    }

    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <main className="article-loading">
        <span>LOADING STORY...</span>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="not-found">
        <div className="section-kicker">
          CURIOUSLY / ERROR
        </div>

        <h1>
          ARTICLE
          <br />
          <em>NOT FOUND.</em>
        </h1>

        <Link to="/articles">
          ← BACK TO MAGAZINE
        </Link>
      </main>
    );
  }

  const sections = Array.isArray(article.sections)
    ? article.sections
    : [];

  return (
    <main
      className={`article-page article-theme-${
        article.color || "pink"
      }`}
    >
      {/* =====================================================
          ARTICLE TOP BAR
          ===================================================== */}

      <div className="article-top">
        <Link
          to="/articles"
          className="article-back"
        >
          <ArrowLeft size={13} />
          BACK TO MAGAZINE
        </Link>

        <span className="article-issue">
          CURIOUSLY / VOL. 01 / 2026
        </span>

        <span className="article-page-number">
          STORY / 01
        </span>
      </div>

      {/* =====================================================
          HERO
          ===================================================== */}

      <header className="article-hero">
        <div className="article-hero-meta">
          <span>
            {article.category}
          </span>

          <span>✦</span>

          <span>
            {article.format || "STORY"}
          </span>
        </div>

        <h1>
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="article-subtitle">
            {article.subtitle}
          </p>
        )}

        <div className="article-byline">
          <span>
            {article.date || "2026"}
          </span>

          <span>·</span>

          <span>
            ASMI JAIN
          </span>

          {article.readTime && (
            <>
              <span>·</span>

              <span>
                {article.readTime.toUpperCase()}
              </span>
            </>
          )}
        </div>
      </header>

      {/* =====================================================
          COVER IMAGE
          ===================================================== */}

      <div className="article-cover-wrap">
        {article.coverImage ? (
          <figure className="article-cover">
            <img
              src={article.coverImage}
              alt={article.title}
              onError={(event) => {
                console.error(
                  "Article cover failed to load:",
                  article.coverImage
                );

                event.currentTarget.style.display =
                  "none";
              }}
            />

            <figcaption>
              <span>
                CURIOUSLY / FIG. 01
              </span>

              <span>
                {article.category}
              </span>
            </figcaption>
          </figure>
        ) : (
          <div className="article-cover-placeholder">
            <span>
              {article.category}
            </span>

            <small>
              CURIOUSLY / FIG. 01
            </small>
          </div>
        )}
      </div>

      {/* =====================================================
          ARTICLE BODY
          ===================================================== */}

      <div className="article-layout">
        {/* SIDE NOTES */}

        <aside className="article-sidebar">
          <div className="article-sidebar-inner">
            <div className="aside-label">
              IN THIS STORY
            </div>

            <nav className="article-toc">
              {sections.map(
                (section, index) => (
                  <a
                    href={`#section-${index}`}
                    key={`${section.heading}-${index}`}
                  >
                    <span>
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    {section.heading ||
                      `SECTION ${index + 1}`}
                  </a>
                )
              )}
            </nav>

            <button
              type="button"
              className={`article-save ${
                liked ? "liked" : ""
              }`}
              onClick={() =>
                setLiked(!liked)
              }
            >
              {liked ? (
                <>
                  <Heart
                    size={14}
                    fill="currentColor"
                  />
                  SAVED
                </>
              ) : (
                <>
                  <Bookmark size={14} />
                  SAVE STORY
                </>
              )}
            </button>
          </div>
        </aside>

        {/* MAIN STORY */}

        <article className="article-body">
          {article.dek && (
            <p className="article-lead">
              {article.dek}
            </p>
          )}

          {sections.map(
            (section, index) => (
              <section
                className="article-section"
                id={`section-${index}`}
                key={`${section.heading}-${index}`}
              >
                <div className="article-section-marker">
                  <span>
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <span />
                </div>

                {section.heading && (
                  <h2>
                    {section.heading}
                  </h2>
                )}

                {section.body && (
                  <p>
                    {section.body}
                  </p>
                )}

                {index === 1 &&
                  sections.length > 2 && (
                    <blockquote>
                      <span className="quote-mark">
                        “
                      </span>

                      The interesting part isn't
                      always the answer. Sometimes
                      it is discovering that the
                      question is much bigger than
                      it seemed.
                    </blockquote>
                  )}
              </section>
            )
          )}

          {!sections.length &&
            article.content && (
              <section className="article-section">
                <p>
                  {article.content}
                </p>
              </section>
            )}

          <div className="article-end">
            <span>✦</span>
            END OF STORY
            <span>✦</span>
          </div>
        </article>
      </div>

      {/* =====================================================
          NEXT STORY
          ===================================================== */}

      <div className="article-next">
        <div className="article-next-copy">
          <span className="section-kicker">
            CURIOUSLY / CONTINUE
          </span>

          <h2>
            THERE'S ALWAYS
            <br />
            <em>ANOTHER RABBIT HOLE.</em>
          </h2>
        </div>

        <Link
          to="/articles"
          className="article-next-link"
        >
          EXPLORE THE MAGAZINE
          <span>→</span>
        </Link>
      </div>
    </main>
  );
}