import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { supabase } from "../supabase";
import ArticleCard from "../components/ArticleCard";

const fallbackCategories = [
  "ALL",
  "FASHION",
  "MUSIC",
  "ART",
  "MEDIA",
  "POLITICS",
  "STEM",
];

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState(fallbackCategories);
  const [category, setCategory] = useState("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMagazine() {
      setLoading(true);
      setError("");

      const [articlesResult, categoriesResult] =
        await Promise.all([
          supabase
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
            }),

          supabase
            .from("categories")
            .select("name")
            .order("name"),
        ]);

      if (articlesResult.error) {
        console.error(
          "Articles error:",
          articlesResult.error
        );

        setError(
          "Something went wrong loading the magazine."
        );
        setLoading(false);
        return;
      }

      if (categoriesResult.error) {
        console.error(
          "Categories error:",
          categoriesResult.error
        );
      }

      const formattedArticles =
        articlesResult.data.map((article) => ({
          ...article,

          id: article.slug,

          category:
            article.categories?.name || "UNCATEGORIZED",

          readTime:
            article.read_time || "",

          coverImage:
            article.cover_image || "",

          sections:
            article.sections || [],
        }));

      setArticles(formattedArticles);

      if (
        categoriesResult.data &&
        categoriesResult.data.length
      ) {
        setCategories([
          "ALL",
          ...categoriesResult.data.map(
            (item) => item.name
          ),
        ]);
      }

      setLoading(false);
    }

    loadMagazine();
  }, []);

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      const categoryMatch =
        category === "ALL" ||
        article.category === category;

      const text = `
        ${article.title}
        ${article.subtitle}
        ${article.category}
        ${article.format}
        ${article.tag}
      `.toLowerCase();

      return (
        categoryMatch &&
        text.includes(query.toLowerCase())
      );
    });
  }, [articles, category, query]);

  return (
    <main className="articles-page">
      <div className="archive-header">
        <div className="section-kicker">
          THE CURIOUSLY ARCHIVE
        </div>

        <h1>
          THINGS I COULDN'T
          <br />
          <em>STOP THINKING ABOUT.</em>
        </h1>

        <p>
          Fashion, music, art, media, politics,
          STEM, experiments, and all the rabbit
          holes in between.
        </p>
      </div>

      <div className="filters">
        <div className="category-tabs">
          {categories.map((item) => (
            <button
              key={item}
              className={
                category === item ? "active" : ""
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <label className="search-box">
          <Search size={14} />

          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="SEARCH THE ARCHIVE..."
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </label>
      </div>

      {loading && (
        <div className="empty">
          LOADING THE RABBIT HOLE...
        </div>
      )}

      {error && !loading && (
        <div className="empty">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="archive-grid">
            {filtered.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                index={index}
              />
            ))}
          </div>

          {!filtered.length && (
            <div className="empty">
              NOTHING FOUND. TRY ANOTHER RABBIT HOLE.
            </div>
          )}
        </>
      )}
    </main>
  );
}