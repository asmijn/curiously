import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
      <main className="not-found">
        <h1>LOADING STORY...</h1>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="not-found">
        <h1>ARTICLE NOT FOUND.</h1>

        <Link to="/articles">
          ← BACK TO MAGAZINE
        </Link>
      </main>
    );
  }

  return (
    <main
      className={`article-page article-theme-${article.color}`}
    >
      <div className="article-top">
        <Link to="/articles">
          ← BACK TO MAGAZINE
        </Link>

        <span>
          CURIOUSLY / VOL. 01 / {article.category}
        </span>

        <span>
          PAGE 08
        </span>
      </div>

      <header className="article-hero">
        <div className="section-kicker">
          {article.category} / {article.format}
        </div>

        <h1>
          {article.title}
        </h1>

        <p className="article-dek">
          {article.subtitle}
        </p>

        <div className="article-byline">
          {article.date} · ASMI JAIN ·{" "}
          {article.readTime.toUpperCase()}
        </div>
      </header>

      <div className="article-visual">
        <div className="visual-frame">
          <div className="visual-top">
            CURIOUSLY / FIG. 01

            <span>
              ✦
            </span>
          </div>

          <div className="visual-center">
            {article.category}
          </div>

          <div className="visual-bottom">
            AN EDITORIAL ILLUSTRATION / 2026
          </div>
        </div>
      </div>

      <div className="article-layout">
        <aside>
          <div className="aside-note">
            IN THIS STORY
          </div>

          {article.sections.map(
            (section, index) => (
              <a
                href={`#section-${index}`}
                key={section.heading}
              >
                {String(index + 1).padStart(2, "0")}{" "}
                / {section.heading}
              </a>
            )
          )}

          <button
            className={liked ? "liked" : ""}
            onClick={() =>
              setLiked(!liked)
            }
          >
            {liked
              ? "♥ SAVED"
              : "♡ SAVE STORY"}
          </button>
        </aside>

        <article className="article-body">
          <p className="lead">
            {article.dek}
          </p>

          {article.sections.map(
            (section, index) => (
              <section
                id={`section-${index}`}
                key={section.heading}
              >
                <span className="body-number">
                  0{index + 1}
                </span>

                <h2>
                  {section.heading}
                </h2>

                <p>
                  {section.body}
                </p>

                {index === 1 && (
                  <blockquote>
                    “The interesting part is not
                    always the answer. Sometimes it
                    is discovering that the question
                    is much bigger than it seemed.”
                  </blockquote>
                )}
              </section>
            )
          )}

          <div className="article-end">
            ✦ END OF STORY ✦
          </div>
        </article>
      </div>

      <div className="article-next">
        <span>
          THERE'S ALWAYS ANOTHER RABBIT HOLE.
        </span>

        <Link to="/articles">
          EXPLORE MORE STORIES →
        </Link>
      </div>
    </main>
  );
}