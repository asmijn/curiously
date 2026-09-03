import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="about-page">
      <section className="about-cover">
        <span className="section-kicker">
          ABOUT CURIOUSLY
        </span>

        <h1>
          STAY CURIOUS.
          <br />
          <em>FOLLOW THE QUESTION.</em>
        </h1>

        <div className="about-doodle">
          ?
        </div>
      </section>

      <section className="about-manifesto">
        <div className="section-kicker">
          OUR LITTLE MANIFESTO
        </div>

        <div>
          <p className="large-copy">
            <span className="dropcap">
              C
            </span>
            URIOUSLY is a digital magazine about
            technology, design, data, internet
            culture, and the strange little things
            hiding in plain sight.
          </p>

          <p>
            It is a place for the questions that
            start with “wait...” and end with three
            hours of research, seventeen open tabs,
            and a new favorite rabbit hole.
          </p>
        </div>
      </section>

      <section className="about-grid-section">
        {[
          [
            "01",
            "WHY",
            "Big questions, tiny observations, and long investigations.",
          ],
          [
            "02",
            "DATA",
            "Finding stories inside numbers and patterns.",
          ],
          [
            "03",
            "INTERNET",
            "Understanding the culture of the web.",
          ],
          [
            "04",
            "DESIGN",
            "Taking apart the things we interact with.",
          ],
          [
            "05",
            "EXPERIMENTS",
            "Trying things just to see what happens.",
          ],
        ].map(([number, title, copy]) => (
          <div
            key={number}
            className="about-item"
          >
            <span>
              {number}
            </span>

            <h2>
              {title}
            </h2>

            <p>
              {copy}
            </p>
          </div>
        ))}
      </section>

      <section className="about-end">
        <h2>
          SEE SOMETHING
          <br />
          <em>INTERESTING?</em>
        </h2>

        <p>
          Good. Follow it.
        </p>

        <Link to="/articles">
          START EXPLORING →
        </Link>
      </section>
    </main>
  );
}