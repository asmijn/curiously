export default function Contact() {
  return (
    <main className="contact-page">

      <section className="contact-cover">
        <div className="section-kicker">
          GET IN TOUCH / CURIOUSLY
        </div>

        <h1>
          LET'S
          <br />
          <em>CONNECT.</em>
        </h1>

        <div className="contact-question">
          ?
        </div>

        <p>
          Have a question, an idea, a collaboration,
          <br />
          or another rabbit hole worth exploring?
        </p>
      </section>


      <section className="contact-content">

        <div className="contact-intro">
          <span className="page-no">
            15
          </span>

          <div>
            <div className="section-kicker">
              FIND ME AROUND THE INTERNET
            </div>

            <h2>
              SAY
              <br />
              <em>HELLO.</em>
            </h2>

            <p>
              Whether you want to talk about design,
              data, technology, research, or just
              something interesting you noticed —
              I'd love to hear from you.
            </p>
          </div>
        </div>


        <div className="contact-links">

          <a
            href="mailto:asmijainj@gmail.com"
            className="contact-card pink"
          >
            <div className="contact-icon">
              ✉
            </div>

            <div>
              <small>EMAIL</small>
              <h3>
                asmijainj@gmail.com
              </h3>
            </div>

            <span>↗</span>
          </a>


          <a
            href="https://www.linkedin.com/in/asmi-jain-5b7182321"
            target="_blank"
            rel="noreferrer"
            className="contact-card blue"
          >
            <div className="contact-icon contact-letter-icon">
              in
            </div>

            <div>
              <small>LINKEDIN</small>
              <h3>Asmi Jain</h3>
            </div>

            <span>↗</span>
          </a>


          <a
            href="https://www.instagram.com/asmi_jain22"
            target="_blank"
            rel="noreferrer"
            className="contact-card yellow"
          >
            <div className="contact-icon">
              ◎
            </div>

            <div>
              <small>INSTAGRAM</small>
              <h3>@asmi_jain22</h3>
            </div>

            <span>↗</span>
          </a>


          <a
            href="https://asmi-portfolio-three.vercel.app/#projects"
            target="_blank"
            rel="noreferrer"
            className="contact-card lavender"
          >
            <div className="contact-icon">
              ↗
            </div>

            <div>
              <small>PORTFOLIO</small>
              <h3>
                MY WORK & PROJECTS
              </h3>
            </div>

            <span>↗</span>
          </a>

        </div>
      </section>


      {/* ABOUT ME */}

      <section className="about-me-contact">

        <div className="about-me-label">
          <span className="page-no">
            16
          </span>

          <div className="section-kicker">
            A LITTLE ABOUT ME
          </div>
        </div>


        <div className="about-me-grid">

          <div className="about-me-photo-wrap">
            <div className="about-me-photo">
              <img
                src="/about-me.JPG"
                alt="Asmi Jain"
              />
            </div>

            <div className="about-me-caption">
              ASMI / CURIOUS BY DEFAULT
            </div>
          </div>


          <div className="about-me-copy">

            <h2>
              HI,
              <br />
              I'M <em>ASMI.</em>
            </h2>

            <p>
              I'm a curious person who likes asking
              questions, making things, and going
              slightly too far down internet rabbit holes.
            </p>

            <p>
              I'm currently pursuing my B.S. in Data Science at
              UC Irvine, where I'm interested in the
              intersection of technology, design, data,
              and the way people interact with information.
            </p>

            <p>
              I have experience in various fields including 
              work in volunteering, activism, child development, 
              UI/UX development, and mental psychology.
            </p>

            <p>
              CURIOUSLY is my little corner of the internet
              for exploring those interests — one question,
              experiment, and obsession at a time.
            </p>

            <div className="about-me-signoff">
              <span>KEEP WONDERING.</span>
              <strong>♡</strong>
            </div>

          </div>

        </div>

      </section>


      <section className="contact-note">

        <div className="stamp">
          ✦
        </div>

        <div>
          <div className="section-kicker">
            ONE LAST THING
          </div>

          <h2>
            STAY
            <br />
            <em>CURIOUS.</em>
          </h2>

          <p>
            The best conversations usually start
            with a good question.
          </p>
        </div>

      </section>

    </main>
  );
}