import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
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
          .order("created_at", { ascending: false });

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

        setSavedArticles(formattedArticles);
      } catch (err) {
        console.error("Error loading saved stories:", err);
        setError(
          "WE COULDN'T LOAD YOUR SAVED STORIES. PLEASE TRY AGAIN."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSavedArticles();
  }, []);

  return (
    <main className="archive-page saved-page">

      {/* HEADER */}
      <section className="archive-header">

        <div className="archive-kicker">
          CURIOUSLY / SAVED
        </div>

        <h1>SAVED STORIES</h1>

        <p className="archive-intro">
          STORIES I WANT TO COME BACK TO.
        </p>

      </section>

      {/* LOADING */}
      {loading && (
        <section className="saved-state">
          <Bookmark size={28} strokeWidth={1.4} />

          <p>LOADING YOUR RABBIT HOLES...</p>
        </section>
      )}

      {/* ERROR */}
      {!loading && error && (
        <section className="saved-state saved-error">
          <p>{error}</p>
        </section>
      )}

      {/* EMPTY */}
      {!loading &&
        !error &&
        savedArticles.length === 0 && (
          <section className="saved-state saved-empty">

            <Bookmark
              size={42}
              strokeWidth={1.2}
            />

            <h2>NOTHING SAVED YET.</h2>

            <p>
              FIND A STORY YOU LOVE AND
              BOOKMARK IT FOR LATER.
            </p>

            <Link
              to="/articles"
              className="saved-browse-link"
            >
              EXPLORE THE MAGAZINE →
            </Link>

          </section>
        )}

      {/* SAVED STORIES */}
      {!loading &&
        !error &&
        savedArticles.length > 0 && (
          <section className="saved-content">

            <div className="saved-topline">
              <span>
                {savedArticles.length}{" "}
                {savedArticles.length === 1
                  ? "STORY"
                  : "STORIES"}{" "}
                SAVED
              </span>

              <Link to="/articles">
                KEEP EXPLORING →
              </Link>
            </div>

            <div className="archive-grid">
              {savedArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                />
              ))}
            </div>

          </section>
        )}

    </main>
  );
}