import { ArrowUpRight, Mail } from "lucide-react";

export default function Contact() {
  return (
    <main className="contact-page">

      {/* HERO */}

      <section className="contact-hero">

        <div className="contact-hero-top">
          <span>CURIOUSLY / CONTACT</span>
          <span>VOL. 01 / 2026</span>
        </div>

        <div className="contact-hero-main">

          <div className="contact-kicker">
            LET'S TALK
          </div>

          <h1>
            SAY
            <br />
            <em>HELLO.</em>
          </h1>

          <div className="contact-hero-question">
            <span>GOT A QUESTION?</span>
            <strong>↘</strong>
          </div>

        </div>

        <div className="contact-hero-bottom">
          <span>
            IDEAS / PROJECTS / QUESTIONS
          </span>

          <span>
            I LIKE HEARING FROM CURIOUS PEOPLE.
          </span>
        </div>

      </section>


      {/* MAIN CONTACT */}

      <section className="contact-main">

        <div className="contact-note">

          <span className="section-kicker">
            A LITTLE NOTE
          </span>

          <h2>
            HAVE SOMETHING
            <br />
            <em>INTERESTING?</em>
          </h2>

          <p>
            Whether you want to talk about a project,
            collaborate on something, share an idea,
            or simply send me down a new internet
            rabbit hole — I'd love to hear from you.
          </p>

          <p>
            The best messages usually start with a
            question.
          </p>

        </div>


        <div className="contact-links">

          {/* EMAIL */}

          <a
            href="mailto:asmijainj@gmail.com"
            className="contact-link contact-link-pink"
          >
            <div className="contact-link-number">
              01
            </div>

            <div className="contact-link-content">
              <span>EMAIL</span>
              <strong>
                asmijainj@gmail.com
              </strong>
            </div>

            <ArrowUpRight size={18} />
          </a>


          {/* LINKEDIN */}

          <a
            href="https://www.linkedin.com/in/asmi-jain-5b7182321"
            target="_blank"
            rel="noreferrer"
            className="contact-link contact-link-blue"
          >
            <div className="contact-link-number">
              02
            </div>

            <div className="contact-link-content">
              <span>LINKEDIN</span>
              <strong>
                CONNECT WITH ME
              </strong>
            </div>

            <ArrowUpRight size={18} />
          </a>


          {/* INSTAGRAM */}

          <a
            href="https://www.instagram.com/asmi_jain22"
            target="_blank"
            rel="noreferrer"
            className="contact-link contact-link-yellow"
          >
            <div className="contact-link-number">
              03
            </div>

            <div className="contact-link-content">
              <span>INSTAGRAM</span>
              <strong>
                @ASMI_JAIN22
              </strong>
            </div>

            <ArrowUpRight size={18} />
          </a>


          {/* PORTFOLIO */}

          <a
            href="https://asmi-portfolio-three.vercel.app/#projects"
            target="_blank"
            rel="noreferrer"
            className="contact-link contact-link-lavender"
          >
            <div className="contact-link-number">
              04
            </div>

            <div className="contact-link-content">
              <span>PORTFOLIO</span>
              <strong>
                SEE MY WORK
              </strong>
            </div>

            <ArrowUpRight size={18} />
          </a>

        </div>

      </section>


      {/* EMAIL CTA */}

      <section className="contact-cta">

        <div className="contact-cta-mark">
          <Mail size={25} />
        </div>

        <span className="section-kicker">
          THE EASIEST WAY TO FIND ME
        </span>

        <a
          href="mailto:asmijainj@gmail.com"
          className="contact-email"
        >
          asmijainj@gmail.com
        </a>

        <p>
          NO FORM. NO MYSTERY.
          <br />
          JUST SEND THE EMAIL.
        </p>

      </section>


      {/* END */}

      <section className="contact-end">

        <div className="contact-end-star">
          ✦
        </div>

        <h2>
          KEEP
          <br />
          <em>IN TOUCH.</em>
        </h2>

        <span>
          CURIOUSLY / 2026
        </span>

      </section>

    </main>
  );
}