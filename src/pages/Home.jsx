import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { supabase } from "../supabase";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // EMAIL SUBSCRIPTION
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState("");

  useEffect(() => {
    async function loadArticles() {
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
        .limit(8);

      if (error) {
        console.error("Homepage articles error:", error);
        setArticles([]);
      } else {
        setArticles(
          (data || []).map((article) => ({
            ...article,
            category:
              article.categories?.name ||
              "UNCATEGORIZED",
            readTime:
              article.read_time || "",
            coverImage:
              article.cover_image || "",
          }))
        );
      }

      setLoading(false);
    }

    loadArticles();
  }, []);

  async function handleSubscribe(event) {
    event.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setSubscribeStatus(
        "PLEASE ENTER YOUR EMAIL."
      );
      return;
    }

    setSubscribeStatus("SUBSCRIBING...");

    const { error } = await supabase
      .from("subscribers")
      .insert({
        email: normalizedEmail,
      });

    if (error) {
      console.error(
        "Subscription error:",
        error
      );

      if (error.code === "23505") {
        setSubscribeStatus(
          "YOU'RE ALREADY ON THE LIST ✦"
        );
      } else {
        setSubscribeStatus(
          "SOMETHING WENT WRONG. PLEASE TRY AGAIN."
        );
      }

      return;
    }

    setEmail("");

    setSubscribeStatus(
      "YOU'RE ON THE LIST ✦"
    );
  }

  const featured = articles[0];

  const latest = articles.slice(1, 7);

  return (
    <main className="home-page">

      {/* HERO / MAGAZINE COVER */}

      <section className="home-cover">

        <div className="home-cover-top">
          <span>VOL. 01 / 2026</span>

          <span>
            QUESTIONS, EXPERIMENTS &
            <br />
            TINY OBSESSIONS
          </span>

          <span>NO. 001</span>
        </div>

        <div className="home-cover-title">
          <span className="cover-small-word">
            THE
          </span>

          <h1>CURIOUSLY</h1>

          <span className="cover-heart">
            ♡
          </span>
        </div>

        <div className="home-cover-bottom">

          <span>
            A DIGITAL MAGAZINE
            <br />
            ABOUT THE THINGS
            <br />
            HIDING IN PLAIN SIGHT.
          </span>

          <span className="cover-question">
            ?
          </span>

          <span className="cover-date">
            SEPTEMBER
            <br />
            2026
          </span>

        </div>

      </section>


      {/* INTRO */}

      <section className="home-intro">

        <div className="section-kicker">
          WELCOME TO CURIOUSLY
        </div>

        <div className="home-intro-grid">

          <h2>
            FOR PEOPLE WHO
            <br />
            <em>CAN'T LEAVE A QUESTION</em>
            <br />
            ALONE.
          </h2>

          <div>

            <p>
              CURIOUSLY is a digital magazine
              about the things hiding in plain
              sight — from internet rabbit holes
              to strange data, fashion cycles,
              music, culture, and the questions
              that keep us thinking.
            </p>

            <Link
              to="/articles"
              className="text-arrow"
            >
              EXPLORE THE MAGAZINE
              <ArrowRight size={14} />
            </Link>

          </div>

        </div>

      </section>


      {/* FEATURED STORY */}

      {!loading && featured && (
        <section className="home-featured">

          <div className="home-section-header">

            <div>
              <span className="section-kicker">
                THE FEATURE
              </span>

              <span className="section-number">
                01 / 01
              </span>
            </div>

            <span>
              CURRENT RABBIT HOLE
            </span>

          </div>


          <Link
            to={`/article/${featured.slug}`}
            className={`home-featured-card home-featured-${
              featured.color || "pink"
            }`}
          >

            <div className="home-featured-image">

              {featured.coverImage ? (
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                />
              ) : (
                <div className="home-featured-placeholder">
                  {featured.category}
                </div>
              )}

              <span className="home-featured-figure">
                FIG. 01
              </span>

              <span className="home-featured-sticker">
                READ ME →
              </span>

            </div>


            <div className="home-featured-copy">

              <div className="home-featured-meta">

                <span>
                  {featured.category}
                </span>

                <span>✦</span>

                <span>
                  {featured.format || "FEATURE"}
                </span>

              </div>

              <h2>
                {featured.title}
              </h2>

              <p>
                {featured.subtitle}
              </p>

              <div className="home-featured-footer">

                <span>
                  {featured.readTime}
                </span>

                <span>
                  READ STORY →
                </span>

              </div>

            </div>

          </Link>

        </section>
      )}


      {/* CATEGORIES */}

      <section className="home-categories">

        <div className="section-kicker">
          BROWSE BY CURIOSITY
        </div>

        <div className="home-category-list">

          {[
            "FASHION",
            "MUSIC",
            "ART",
            "MEDIA",
            "POLITICS",
            "STEM",
          ].map((category, index) => (

            <Link
              key={category}
              to={`/articles?category=${category}`}
              className={`home-category home-category-${
                index + 1
              }`}
            >

              <span>
                0{index + 1}
              </span>

              <strong>
                {category}
              </strong>

              <ArrowRight size={15} />

            </Link>

          ))}

        </div>

      </section>


      {/* LATEST STORIES */}

      <section className="home-latest">

        <div className="home-section-header">

          <div>

            <span className="section-kicker">
              FRESH FROM THE RABBIT HOLE
            </span>

            <span className="section-number">
              02 / 03
            </span>

          </div>

          <Link to="/articles">
            VIEW ALL →
          </Link>

        </div>


        {loading ? (

          <div className="home-loading">
            LOADING THE RABBIT HOLE...
          </div>

        ) : (

          <div className="home-latest-grid">

            {latest.map((article, index) => (

              <Link
                to={`/article/${article.slug}`}
                className={`home-story-card home-story-${
                  article.color || "pink"
                }`}
                key={article.slug}
              >

                <div className="home-story-image">

                  {article.coverImage ? (
                    <img
                      src={article.coverImage}
                      alt={article.title}
                    />
                  ) : (
                    <div className="home-story-placeholder">
                      {article.category}
                    </div>
                  )}

                  <span>
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                </div>


                <div className="home-story-copy">

                  <div className="home-story-meta">
                    {article.category}
                    {" · "}
                    {article.format || "STORY"}
                  </div>

                  <h3>
                    {article.title}
                  </h3>

                  <p>
                    {article.subtitle}
                  </p>

                  <span className="home-story-read">
                    READ →
                  </span>

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>


      {/* CURIOSITY */}

      <section className="home-curiosity">

        <div className="home-curiosity-mark">
          ?
        </div>

        <div className="section-kicker">
          A LITTLE SOMETHING TO THINK ABOUT
        </div>

        <h2>
          WHAT'S SOMETHING
          <br />
          <em>YOU'VE ALWAYS WONDERED?</em>
        </h2>

        <p>
          Send it our way. It might become
          the next rabbit hole.
        </p>

        <Link
          to="/contact"
          className="home-curiosity-button"
        >
          SEND A QUESTION →
        </Link>

      </section>


      {/* NEWSLETTER */}

      <section
        className="home-newsletter"
        id="mail"
      >

        <div className="home-newsletter-icon">
          <Mail size={20} />
        </div>

        <div className="home-newsletter-copy">

          <span className="section-kicker">
            THE CURIOUSLY LETTER
          </span>

          <h2>
            A FEW GOOD
            <br />
            <em>RABBIT HOLES.</em>
          </h2>

          <p>
            Occasional stories, experiments,
            internet archaeology, and things
            worth wondering about.
          </p>

        </div>


        <form
          className="home-newsletter-form"
          onSubmit={handleSubscribe}
        >

          <label htmlFor="home-email">
            YOUR EMAIL
          </label>

          <div>

            <input
              id="home-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="hello@example.com"
              required
              autoComplete="email"
              disabled={
                subscribeStatus ===
                "SUBSCRIBING..."
              }
            />

            <button
              type="submit"
              disabled={
                subscribeStatus ===
                "SUBSCRIBING..."
              }
            >
              {subscribeStatus ===
              "SUBSCRIBING..."
                ? "..."
                : "→"}
            </button>

          </div>

          {subscribeStatus && (
            <p className="home-newsletter-status">
              {subscribeStatus}
            </p>
          )}

        </form>

      </section>


      {/* END */}

      <section className="home-end">

        <span>
          MADE WITH CURIOSITY
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