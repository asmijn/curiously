import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { supabase } from "../supabase";

export default function Confessions() {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confession, setConfession] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadConfessions() {
      setLoading(true);

      const { data, error } = await supabase
        .from("submissions")
        .select(`
          id,
          message,
          created_at
        `)
        .eq("type", "CONFESSION")
        .eq("status", "approved")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Confessions loading error:",
          error
        );

        setConfessions([]);
      } else {
        setConfessions(data || []);
      }

      setLoading(false);
    }

    loadConfessions();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanedConfession = confession.trim();

    if (!cleanedConfession) {
      setStatus("WRITE SOMETHING FIRST ✦");
      return;
    }

    if (cleanedConfession.length > 1000) {
      setStatus("KEEP IT UNDER 1000 CHARACTERS.");
      return;
    }

    setSubmitting(true);
    setStatus("SENDING...");

    const { error } = await supabase
      .from("submissions")
      .insert({
        name: null,
        email: null,
        type: "CONFESSION",
        message: cleanedConfession,
        status: "new",
      });

    if (error) {
      console.error(
        "Confession submission error:",
        error
      );

      setStatus(
        "SOMETHING WENT WRONG. TRY AGAIN."
      );

      setSubmitting(false);
      return;
    }

    setConfession("");

    setStatus("CONFESSION RECEIVED ✦");

    setSubmitting(false);
  }

  return (
    <main className="confessions-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <section className="confessions-hero">

        <div className="confessions-hero-top">

          <Link
            to="/"
            className="confessions-back"
          >
            <ArrowLeft size={14} />
            BACK TO CURIOUSLY
          </Link>

          <span className="confessions-issue">
            VOL. 01 / 2026
          </span>

          <span className="confessions-mark">
            ✦
          </span>

        </div>

        <div className="confessions-kicker">
          CURIOUSLY / CONFESSIONS
        </div>

        <div className="confessions-title-wrap">

          <span className="confessions-small">
            THINGS I'VE ALWAYS
          </span>

          <h1>
            WONDERED
            <br />
            <em>BUT WAS TOO</em>
            <br />
            EMBARRASSED TO ASK.
          </h1>

          <span className="confessions-question">
            ?
          </span>

        </div>

        <div className="confessions-intro">

          <p>
            You know the question.
            The one you've thought
            about approximately
            seventeen times but
            never actually asked.
          </p>

          <p>
            This is a place for those
            questions.
          </p>

          <span className="confessions-note">
            NO JUDGMENT. JUST CURIOSITY.
          </span>

        </div>

      </section>


      {/* =================================================
          SUBMIT
          ================================================= */}

      <section className="confessions-submit">

        <div className="confessions-submit-header">

          <span className="confessions-number">
            01
          </span>

          <div>
            <span className="section-kicker">
              YOUR TURN
            </span>

            <h2>
              CONFESS
              <br />
              SOMETHING.
            </h2>
          </div>

        </div>

        <form
          className="confessions-form"
          onSubmit={handleSubmit}
        >

          <label htmlFor="confession">
            WHAT HAVE YOU ALWAYS
            WONDERED?
          </label>

          <textarea
            id="confession"
            value={confession}
            onChange={(event) =>
              setConfession(event.target.value)
            }
            placeholder="I've always wondered..."
            maxLength={1000}
            rows={7}
            disabled={submitting}
          />

          <div className="confessions-form-bottom">

            <span>
              100% ANONYMOUS
              <br />
              NO NAME. NO EMAIL.
            </span>

            <span>
              {confession.length}/1000
            </span>

            <button
              type="submit"
              disabled={submitting}
            >
              <Send size={14} />

              {submitting
                ? "SENDING..."
                : "SEND CONFESSION"}
            </button>

          </div>

          {status && (
            <div
              className={`confessions-status ${
                status.includes("RECEIVED")
                  ? "success"
                  : ""
              }`}
            >
              {status}
            </div>
          )}

        </form>

      </section>


      {/* =================================================
          CONFESSIONS WALL
          ================================================= */}

      <section className="confessions-wall">

        <div className="confessions-wall-header">

          <div>

            <span className="section-kicker">
              FROM THE CURIOUS
            </span>

            <h2>
              THINGS PEOPLE
              <br />
              <em>WONDER ABOUT.</em>
            </h2>

          </div>

          <span className="confessions-count">
            {confessions.length} CONFESSIONS
          </span>

        </div>


        {loading ? (

          <div className="confessions-loading">
            READING THE CONFESSIONS...
          </div>

        ) : confessions.length === 0 ? (

          <div className="confessions-empty">

            <span className="confessions-empty-mark">
              ?
            </span>

            <h3>
              YOU COULD BE THE FIRST.
            </h3>

            <p>
              No confessions have made it
              onto the wall yet.
            </p>

          </div>

        ) : (

          <div className="confessions-grid">

            {confessions.map(
              (item, index) => (

                <article
                  key={item.id}
                  className={`confession-card confession-card-${
                    (index % 6) + 1
                  }`}
                >

                  <div className="confession-card-top">

                    <span>
                      CONFESSION #
                      {String(
                        confessions.length - index
                      ).padStart(3, "0")}
                    </span>

                    <span>
                      ✦
                    </span>

                  </div>

                  <p>
                    “{item.message}”
                  </p>

                  <div className="confession-card-bottom">

                    <span>
                      — ANONYMOUS
                    </span>

                    <span>
                      CURIOUSLY
                    </span>

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </section>


      {/* =================================================
          FOOTER CTA
          ================================================= */}

      <section className="confessions-end">

        <span className="confessions-end-mark">
          ✦
        </span>

        <h2>
          KEEP ASKING
          <br />
          <em>WEIRD QUESTIONS.</em>
        </h2>

        <p>
          That's where the interesting
          stuff usually starts.
        </p>

        <Link
          to="/articles"
          className="confessions-explore"
        >
          EXPLORE THE MAGAZINE
          <ArrowRight size={14} />
        </Link>

      </section>

    </main>
  );
}