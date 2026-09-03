import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { articles } from "../data/articles";

const songs = [
  {
    title: "Espresso",
    artist: "Sabrina Carpenter",
    answer: "KEEP",
  },
  {
    title: "Birds of a Feather",
    artist: "Billie Eilish",
    answer: "KEEP",
  },
  {
    title: "APT.",
    artist: "ROSÉ & Bruno Mars",
    answer: "SKIP",
  },
  {
    title: "Good Luck, Babe!",
    artist: "Chappell Roan",
    answer: "KEEP",
  },
];

export default function Home() {
  const featured = articles.find(
    (article) => article.featured
  );

  const latest = articles.filter(
    (article) => !article.featured
  );

  const [poll, setPoll] = useState("");
  const [songIndex, setSongIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);

  const song = useMemo(
    () => songs[songIndex],
    [songIndex]
  );

  function answerSong(value) {
    if (guess) return;

    setGuess(value);

    if (value === song.answer) {
      setScore((current) => current + 1);
    }
  }

  function nextSong() {
    setGuess("");
    setSongIndex(
      (current) => (current + 1) % songs.length
    );
  }

  return (
    <main>

      {/* =========================================
          MAGAZINE COVER
      ========================================= */}

      <section className="cover">
        <div className="cover-topline">
          <span>CURIOUSLY</span>

          <span>
            VOL. 01 — NO. 01
          </span>

          <span>
            SEPTEMBER 2026
          </span>
        </div>

        <div className="cover-center">

          <div className="cover-side left">
            FASHION
            <br />
            MUSIC
            <br />
            ART
            <br />
            MEDIA
            <br />
            POLITICS
            <br />
            STEM
          </div>

          <div className="cover-title">

            <div className="eyebrow">
              A MAGAZINE FOR THE TERMINALLY CURIOUS
            </div>

            <h1>
              CURIOUSLY
              <sup>♡</sup>
            </h1>

            <div className="cover-rule" />

            <p>
              QUESTIONS WORTH
              <br />
              GOING DOWN THE
              <br />
              <em>RABBIT HOLE</em> FOR.
            </p>

          </div>

          <div className="cover-burst">
            NEW!
            <br />

            <small>
              OPEN ISSUE
              <br />
              001 →
            </small>
          </div>

          <div className="cover-question">
            ?
          </div>

        </div>

        <div className="cover-bottom">

          <div>
            <b>01</b>

            <span>
              WHY DOES EVERY
              <br />
              WEBSITE LOOK THE SAME?
            </span>
          </div>

          <div>
            <b>02</b>

            <span>
              CAN DATA
              <br />
              KNOW YOUR TASTE?
            </span>
          </div>

          <div>
            <b>03</b>

            <span>
              WHY DO TRENDS
              <br />
              ALWAYS COME BACK?
            </span>
          </div>

          <strong>
            $6.50
          </strong>

        </div>
      </section>


      {/* =========================================
          EDITOR'S NOTE
      ========================================= */}

      <section className="editors-note">

        <div className="margin-label">
          FROM THE EDITOR
        </div>

        <div className="editor-copy">

          <p>
            <span className="dropcap">
              H
            </span>

            ave you ever noticed something and
            then suddenly started noticing it
            <em> everywhere?</em>
          </p>

          <p>
            That's where CURIOUSLY begins.
          </p>

          <p>
            This is a magazine about following
            tiny questions until they become much
            bigger ones. Fashion, music, art,
            media, politics, STEM — and all the
            strange little connections hiding
            between them.
          </p>

          <p>
            No expert credentials required.
            Just curiosity.
          </p>

          <div className="signature">
            — Asmi
          </div>

        </div>

        <div className="margin-note">
          ISSUE 001
          <br />
          MADE WITH CURIOSITY
          <br />
          ★ ★ ★
        </div>

      </section>


      {/* =========================================
          FEATURE STORY
      ========================================= */}

      {featured && (
        <section className="feature-story">

          <span className="page-no">
            04
          </span>

          <div className="section-kicker">
            THE BIG QUESTION / {featured.category}
          </div>

          <div className="feature-grid">

            <div className="feature-art">

              <div className="browser">

                <div className="browser-bar">

                  <span>
                    ● ● ●
                  </span>

                  <span>
                    theinternet.com
                  </span>

                  <span>
                    ⌁
                  </span>

                </div>

                <div className="browser-screen">

                  <small>
                    HOMEPAGE / 001
                  </small>

                  <h2>
                    WHY DOES
                    <br />
                    EVERYTHING
                    <br />
                    LOOK
                    <br />
                    <em>THE SAME?</em>
                  </h2>

                  <span className="cursor">
                    ↗
                  </span>

                </div>

              </div>

              <div className="caption">
                FIG. 01 — A completely scientific
                investigation conducted by staring at
                the internet for too long.
              </div>

            </div>


            <div className="feature-copy">

              <div className="article-label">
                {featured.category} ·{" "}
                {featured.format} ·{" "}
                {featured.readTime}
              </div>

              <h2>
                {featured.title}
              </h2>

              <p className="dek">
                {featured.dek}
              </p>

              <p>
                {featured.subtitle}
              </p>

              <p>
                Templates, design systems,
                algorithms, and the economics of
                shipping quickly have quietly given
                the web a shared visual language.
              </p>

              <Link
                className="black-button"
                to={`/article/${featured.id}`}
              >
                READ THE RABBIT HOLE →
              </Link>

            </div>

          </div>

        </section>
      )}


      {/* =========================================
          SIX WORLDS OF CURIOUSLY
      ========================================= */}

      <section className="curiosity-section">

        <div className="section-title">

          <span>
            06
          </span>

          <h2>
            SIX WAYS
            <br />
            TO GET <em>CURIOUS.</em>
          </h2>

          <span className="red-star">
            ✦
          </span>

        </div>


        <div className="curiosity-grid">

          <div className="note pink">
            <small>
              01 / FASHION
            </small>

            <h3>
              Why do trends
              always come back?
            </h3>

            <span>
              nostalgia?
            </span>
          </div>


          <div className="note yellow">
            <small>
              02 / MUSIC
            </small>

            <h3>
              Can a song
              predict your mood?
            </h3>

            <span>
              hmm...
            </span>
          </div>


          <div className="note blue">
            <small>
              03 / ART
            </small>

            <h3>
              Why does some
              art feel timeless?
            </h3>

            <span>
              interesting!
            </span>
          </div>


          <div className="note lavender">
            <small>
              04 / MEDIA
            </small>

            <h3>
              Who decides
              what becomes a trend?
            </h3>

            <span>
              rabbit hole →
            </span>
          </div>


          <div className="note mint">
            <small>
              05 / POLITICS
            </small>

            <h3>
              When did politics
              become content?
            </h3>

            <span>
              wait...
            </span>
          </div>


          <div className="note pink">
            <small>
              06 / STEM
            </small>

            <h3>
              Can an algorithm
              actually know you?
            </h3>

            <span>
              let's test it.
            </span>
          </div>

        </div>

      </section>


      {/* =========================================
          READERS' POLL
      ========================================= */}

      <section className="poll-section">

        <span className="page-no">
          09
        </span>

        <div>

          <div className="section-kicker">
            CURIOUSLY DATA / READERS' POLL
          </div>

          <h2>
            WHAT MAKES A
            <br />
            PORTFOLIO
            <br />
            <em>MEMORABLE?</em>
          </h2>

          <p>
            We looked at 100 portfolio websites.
            Before we publish the results, tell
            us what you notice first.
          </p>

        </div>


        <div className="poll">

          <div className="poll-head">
            READERS' POLL

            <b>
              ● LIVE
            </b>
          </div>


          {[
            "The visual design",
            "The projects",
            "The personality",
            "The writing",
          ].map((option) => (

            <button
              key={option}
              className={
                poll === option
                  ? "chosen"
                  : ""
              }
              onClick={() =>
                setPoll(option)
              }
            >

              <span>
                {option}
              </span>

              <span>
                {poll === option
                  ? "✓"
                  : "○"}
              </span>

            </button>

          ))}


          <div className="poll-foot">

            {poll
              ? `Your vote: ${poll}`
              : "CLICK AN ANSWER ↑"}

          </div>

        </div>

      </section>


      {/* =========================================
          LATEST STORIES
      ========================================= */}

      <section className="latest">

        <div className="section-title">

          <span>
            12
          </span>

          <h2>
            MORE THINGS I COULDN'T
            <br />
            STOP THINKING ABOUT
          </h2>

        </div>


        <div className="article-grid">

          {latest.map((article, index) => (

            <Link
              to={`/article/${article.id}`}
              key={article.id}
              className={`latest-card ${article.color}`}
            >

              <div className="latest-art">

                <span>
                  {String(index + 2).padStart(2, "0")}
                </span>

                <strong>
                  {article.category}
                </strong>

                <i>
                  ✦
                </i>

              </div>


              <div className="latest-copy">

                <small>
                  {article.category} ·{" "}
                  {article.format} ·{" "}
                  {article.readTime}
                </small>

                <h3>
                  {article.title}
                </h3>

                <p>
                  {article.subtitle}
                </p>

                <b>
                  KEEP READING →
                </b>

              </div>

            </Link>

          ))}

        </div>

      </section>


      {/* =========================================
          INTERACTIVE MUSIC EXPERIMENT
      ========================================= */}

      <section className="experiment">

        <div className="experiment-copy">

          <div className="section-kicker">
            MUSIC / EXPERIMENT #001
          </div>

          <h2>
            CAN I PREDICT
            <br />
            WHICH SONGS
            <br />
            I'LL <em>SKIP?</em>
          </h2>

          <p>
            Make a prediction. See whether a
            tiny dataset knows your taste.
          </p>

          <div className="score">
            SCORE: {score} / {songs.length}
          </div>

        </div>


        <div className="record-player">

          <div className="record-label">
            CURIOUSLY FM
          </div>

          <div className="record">

            <div>
              ♫
            </div>

          </div>

          <small>
            NOW PLAYING
          </small>

          <h3>
            {song.title}
          </h3>

          <p>
            {song.artist}
          </p>


          <div className="song-buttons">

            <button
              className={
                guess === "KEEP"
                  ? "active"
                  : ""
              }
              onClick={() =>
                answerSong("KEEP")
              }
            >
              ♥ KEEP
            </button>


            <button
              className={
                guess === "SKIP"
                  ? "active"
                  : ""
              }
              onClick={() =>
                answerSong("SKIP")
              }
            >
              × SKIP
            </button>

          </div>


          {guess && (

            <div
              className={`result ${
                guess === song.answer
                  ? "correct"
                  : "wrong"
              }`}
            >

              {guess === song.answer
                ? "✓ YOU GOT IT"
                : `✕ IT WAS ${song.answer}`}

              <button
                onClick={nextSong}
              >
                NEXT SONG →
              </button>

            </div>

          )}

        </div>

      </section>


      {/* =========================================
          READER MAIL
      ========================================= */}

      <section
        className="reader-mail"
        id="mail"
      >

        <div className="stamp">
          ✉
        </div>

        <div>

          <div className="section-kicker">
            DEAR CURIOUSLY...
          </div>

          <h2>
            WHAT'S SOMETHING
            <br />
            YOU'VE BEEN
            <br />
            <em>WONDERING ABOUT?</em>
          </h2>

          <p>
            Send us your rabbit holes: the weird
            questions, tiny observations, and things
            you've noticed that nobody else seems
            to notice.
          </p>

          <a
            className="black-button"
            href="mailto:asmijainj@gmail.com?subject=Dear Curiously"
          >
            SEND A QUESTION →
          </a>

        </div>

      </section>


      {/* =========================================
          BACK COVER
      ========================================= */}

      <section className="back-cover">

        <div>
          ✦
        </div>

        <h2>
          KEEP
          <br />
          LOOKING.
        </h2>

        <p>
          There is always another rabbit hole.
        </p>

        <Link to="/articles">
          OPEN THE MAGAZINE →
        </Link>

        <small>
          CURIOUSLY — VOL. 01
        </small>

      </section>

    </main>
  );
}