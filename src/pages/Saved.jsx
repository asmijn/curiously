import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, ArrowRight } from "lucide-react";
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

export default function Saved() {
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSavedArticles() {
      setLoading(true);
      setError("");

      try {
        const visitorId = getVisitorId();

        const { data, error } = await supabase
          .from("article_bookmarks")
          .select(`
            id,
            created_at,
            articles!inner (
              *,
              categories (
                name
              )
            )
          `)
          .eq("visitor_id", visitorId)
          .eq("articles.published", true)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        const formattedArticles = (data || [])
          .map((item) => {
            const article = item.articles;

            if (!article) return null;

            return {
              ...article,

              category:
                article.categories?.name ||
                "UNCATEGORIZED",

              readTime:
                article.read_time ||
                "",

              coverImage:
                article.cover_image ||
                "",

              sections:
                article.sections ||
                [],
            };
          })
          .filter(Boolean);

        setSavedArticles(
          formattedArticles
        );
      } catch (err) {
        console.error(
          "Error loading saved stories:",
          err
        );

        setError(
          "WE COULDN'T LOAD YOUR SAVED STORIES. PLEASE TRY AGAIN."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSavedArticles();
  }, []);

  const savedCount =
    savedArticles.length;

  return (
    <main className="saved-page">

      {/* =====================================================
          EDITORIAL HEADER
          ===================================================== */}

      <section className="saved-hero">

        <div className="saved-hero-top">

          <div className="saved-kicker">
            CURIOUSLY / YOUR COLLECTION
          </div>

          <div className="saved-issue">
            VOL. 01
            <span>✦</span>
            2026
          </div>

        </div>

        <div className="saved-hero-main">

          <div className="saved-title-wrap">

            <span className="saved-page-number">
              06
            </span>

            <div>

              <h1>
                SAVED
                <br />
                <em>STORIES.</em>
              </h1>

              <p className="saved-subtitle">
                THE ONES YOU WEREN'T
                <br />
                READY TO LET GO OF.
              </p>

            </div>

          </div>

          <div className="saved-hero-note">

            <span className="saved-note-symbol">
              ♡
            </span>

            <p>
              A LITTLE
              <br />
              ARCHIVE OF
              <br />
              YOUR OWN.
            </p>

          </div>

        </div>

        <div className="saved-hero-bottom">

          <span>
            {savedCount > 0
              ? `${savedCount} ${
                  savedCount === 1
                    ? "STORY"
                    : "STORIES"
                } IN YOUR COLLECTION`
              : "YOUR PERSONAL READING LIST"}
          </span>

          <span className="saved-hero-arrow">
            ↓
          </span>

        </div>

      </section>

      {/* =====================================================
          LOADING
          ===================================================== */}

      {loading && (
        <section className="saved-state saved-loading">

          <div className="saved-state-mark">
            <Bookmark
              size={30}
              strokeWidth={1.2}
            />
          </div>

          <span className="saved-state-kicker">
            CURIOUSLY / LOADING
          </span>

          <h2>
            GATHERING
            <br />
            YOUR RABBIT HOLES.
          </h2>

          <p>
            ONE SECOND.
          </p>

        </section>
      )}

      {/* =====================================================
          ERROR
          ===================================================== */}

      {!loading && error && (
        <section className="saved-state saved-error">

          <div className="saved-state-mark">
            !
          </div>

          <span className="saved-state-kicker">
            CURIOUSLY / OOPS
          </span>

          <h2>
            SOMETHING
            <br />
            WENT WRONG.
          </h2>

          <p>
            {error}
          </p>

          <Link
            to="/articles"
            className="saved-browse-link"
          >
            BACK TO THE MAGAZINE
            <ArrowRight size={14} />
          </Link>

        </section>
      )}

      {/* =====================================================
          EMPTY STATE
          ===================================================== */}

      {!loading &&
        !error &&
        savedArticles.length === 0 && (
          <section className="saved-empty">

            <div className="saved-empty-left">

              <span className="saved-empty-number">
                00
              </span>

              <div className="saved-empty-bookmark">
                <Bookmark
                  size={48}
                  strokeWidth={1}
                />
              </div>

            </div>

            <div className="saved-empty-main">

              <div className="saved-empty-kicker">
                CURIOUSLY / YOUR ARCHIVE
              </div>

              <h2>
                NOTHING
                <br />
                <em>SAVED YET.</em>
              </h2>

              <p>
                You haven't found the ones
                worth keeping yet.
              </p>

              <p>
                Wander around the magazine.
                Follow a question. Fall down
                a rabbit hole. When you find
                something you want to return
                to, save it here.
              </p>

              <Link
                to="/articles"
                className="saved-empty-cta"
              >
                <span>
                  EXPLORE THE MAGAZINE
                </span>

                <ArrowRight size={15} />
              </Link>

            </div>

            <div className="saved-empty-side">

              <span>NOTE TO SELF</span>

              <p>
                "COME BACK
                <br />
                TO THIS."
              </p>

              <span className="saved-empty-scribble">
                ✎
              </span>

            </div>

          </section>
        )}

      {/* =====================================================
          SAVED STORIES
          ===================================================== */}

      {!loading &&
        !error &&
        savedArticles.length > 0 && (
          <section className="saved-content">

            <div className="saved-content-header">

              <div className="saved-content-heading">

                <span className="saved-content-number">
                  01
                </span>

                <div>

                  <span className="saved-content-kicker">
                    CURIOUSLY / BOOKMARKS
                  </span>

                  <h2>
                    YOUR
                    <br />
                    <em>READING LIST.</em>
                  </h2>

                </div>

              </div>

              <div className="saved-content-meta">

                <span>
                  {savedCount
                    .toString()
                    .padStart(2, "0")}
                </span>

                <small>
                  SAVED
                </small>

              </div>

            </div>

            <div className="saved-rule" />

            <div className="saved-topline">

              <span>
                STORIES WORTH
                COMING BACK TO
              </span>

              <Link to="/articles">
                KEEP EXPLORING
                <ArrowRight
                  size={13}
                />
              </Link>

            </div>

            <div className="archive-grid saved-grid">
              {savedArticles.map(
                (article, index) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    index={index}
                  />
                )
              )}
            </div>

            <div className="saved-endnote">

              <span>✦</span>

              <p>
                KEEP FOLLOWING
                <br />
                THE QUESTION.
              </p>

              <Link to="/articles">
                FIND ANOTHER RABBIT HOLE →
              </Link>

            </div>

          </section>
        )}

    </main>
  );
}