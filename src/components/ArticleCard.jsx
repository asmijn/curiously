import { Link } from "react-router-dom";

export default function ArticleCard({ article, index }) {
  // Supabase uses "slug" as the article identifier.
  // The fallback keeps this compatible with older/local article data.
  const slug = article.slug || article.id;

  const cover =
    article.cover_image ||
    article.coverImage ||
    "";

  return (
    <Link
      to={`/article/${slug}`}
      className={`article-card article-${article.color || "pink"}`}
    >
      <div className="card-art">
        <span className="card-number">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="card-category">
          {article.category || "CURIOUSLY"}
        </span>

        {cover ? (
          <img
            src={cover}
            alt={article.title}
            className="card-cover-image"
            onError={(event) => {
              console.error(
                "Cover image failed to load:",
                cover
              );

              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="card-art-word">
            {article.category || "CURIOUSLY"}
          </div>
        )}

        <span className="card-scribble">
          read me →
        </span>
      </div>

      <div className="card-copy">
        <div className="card-meta">
          <span>{article.category || "UNCATEGORIZED"}</span>
          {" · "}
          {article.format || "STORY"}
          {" · "}
          {article.readTime || ""}
        </div>

        <h3>{article.title}</h3>

        <p>{article.subtitle}</p>
      </div>
    </Link>
  );
}