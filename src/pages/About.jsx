import { ArrowDownRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="about-page">

      {/* HERO */}

      <section className="about-hero">

        <div className="about-hero-label">
          <span>CURIOUSLY / ABOUT</span>
          <span>VOL. 01 / 2026</span>
        </div>

        <div className="about-hero-title">
          <span className="about-small">
            A LITTLE ABOUT ME
          </span>

          <h1>
            HI,
            <br />
            I'M <em>ASMI.</em>
          </h1>

          <span className="about-arrow">
            ↘
          </span>
        </div>

        <div className="about-hero-bottom">
          <span>
            DATA SCIENCE
            <br />
            + DESIGN
            <br />
            + CURIOSITY
          </span>

          <span className="about-question">
            ?
          </span>

          <span>
            UC IRVINE
            <br />
            2026
          </span>
        </div>

      </section>


      {/* INTRO */}

      <section className="about-intro">

        <div className="about-photo-column">

          <div className="about-photo-label">
            <span>FIG. 01</span>
            <span>ASMI JAIN</span>
          </div>

          <div className="about-photo-frame">
            <img
              src="/about-me.jpg"
              alt="Asmi Jain"
            />

            <span className="about-photo-sticker">
              CURIOUS
            </span>
          </div>

          <div className="about-photo-caption">
            A PERSON WHO WILL ABSOLUTELY
            <br />
            CLICK "LEARN MORE."
          </div>

        </div>


        <div className="about-copy">

          <div className="section-kicker">
            ASMI / CURIOUS BY DEFAULT
          </div>

          <h2>
            I LIKE QUESTIONS
            <br />
            <em>MORE THAN ANSWERS.</em>
          </h2>

          <p>
            I'm a curious person who likes asking
            questions, making things, and going
            slightly too far down internet rabbit
            holes.
          </p>

          <p>
            I'm currently pursuing my B.S. in Data
            Science at UC Irvine, where I'm interested
            in the intersection of technology, design,
            data, and the way people interact with
            information.
          </p>

          <p>
            I have experience in various fields
            including work in volunteering,
            activism, child development, UI/UX
            development, and mental psychology.
          </p>

          <p>
            CURIOUSLY is my little corner of the
            internet for exploring those interests —
            one question, experiment, and obsession
            at a time.
          </p>

          <div className="about-signoff">
            KEEP WONDERING.♡
          </div>

        </div>

      </section>


      {/* INTERESTS */}

      <section className="about-interests">

        <div className="about-section-heading">

          <span className="section-kicker">
            THINGS I KEEP COMING BACK TO
          </span>

          <span>
            02 / 03
          </span>

        </div>


        <div className="about-interest-grid">

          <div className="about-interest about-interest-pink">
            <span>01</span>
            <h3>DATA</h3>
            <p>
              Finding patterns in messy,
              interesting things.
            </p>
            <ArrowDownRight size={18} />
          </div>

          <div className="about-interest about-interest-yellow">
            <span>02</span>
            <h3>DESIGN</h3>
            <p>
              Making information feel
              human and beautiful.
            </p>
            <ArrowDownRight size={18} />
          </div>

          <div className="about-interest about-interest-blue">
            <span>03</span>
            <h3>INTERNET</h3>
            <p>
              Going down rabbit holes
              that definitely didn't need
              three hours.
            </p>
            <ArrowDownRight size={18} />
          </div>

          <div className="about-interest about-interest-lavender">
            <span>04</span>
            <h3>CULTURE</h3>
            <p>
              Fashion, music, media,
              people, and why we care.
            </p>
            <ArrowDownRight size={18} />
          </div>

        </div>

      </section>


      {/* PORTFOLIO */}

      <section className="about-work">

        <div className="about-section-heading">

          <span className="section-kicker">
            WANT TO SEE WHAT I MAKE?
          </span>

          <span>
            03 / 03
          </span>

        </div>

        <div className="about-work-content">

          <h2>
            MY WORK &
            <br />
            <em>PROJECTS.</em>
          </h2>

          <Link
            to="/contact"
            className="about-work-link"
          >
            LET'S CONNECT
            <ArrowRight size={15} />
          </Link>

        </div>

      </section>


      {/* END */}

      <section className="about-end">

        <div className="about-end-star">
          ✦
        </div>

        <span className="section-kicker">
          ONE LAST THING
        </span>

        <h2>
          STAY
          <br />
          <em>CURIOUS.</em>
        </h2>

      </section>

    </main>
  );
}