import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function AskCuriously() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "QUESTION",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const message = form.message.trim();

    if (!message) {
      setStatus("PLEASE TELL US WHAT'S ON YOUR MIND.");
      return;
    }

    setSubmitting(true);
    setStatus("SENDING...");

    const { error } = await supabase
      .from("submissions")
      .insert({
        name: form.name.trim() || null,
        email: form.email.trim().toLowerCase() || null,
        type: form.type,
        message,
        status: "new",
      });

    if (error) {
      console.error(
        "Submission error:",
        error
      );

      setStatus(
        "SOMETHING WENT WRONG. PLEASE TRY AGAIN."
      );

      setSubmitting(false);
      return;
    }

    setForm({
      name: "",
      email: "",
      type: "QUESTION",
      message: "",
    });

    setStatus(
      "THANK YOU — WE'LL TAKE IT FROM HERE ✦"
    );

    setSubmitting(false);
  }

  return (
    <main className="ask-page">

      {/* HEADER */}

      <section className="ask-header">

        <Link
          to="/"
          className="ask-back"
        >
          <ArrowLeft size={14} />
          BACK TO CURIOUSLY
        </Link>

        <div className="ask-kicker">
          CURIOUSLY / ASK
        </div>

        <h1>
          SEND US
          <br />
          <em>A RABBIT HOLE.</em>
        </h1>

        <p className="ask-intro">
          Have a question you've always
          wondered about? Found something
          strange on the internet? Have an
          idea for a story?
        </p>

        <p className="ask-intro">
          Send it our way. Your curiosity
          might become our next obsession.
        </p>

      </section>


      {/* FORM */}

      <section className="ask-form-section">

        <div className="ask-form-label">
          DROP IT HERE
        </div>

        <form
          className="ask-form"
          onSubmit={handleSubmit}
        >

          {/* NAME */}

          <div className="ask-field">

            <label htmlFor="ask-name">
              YOUR NAME
              <span>OPTIONAL</span>
            </label>

            <input
              id="ask-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              autoComplete="name"
            />

          </div>


          {/* EMAIL */}

          <div className="ask-field">

            <label htmlFor="ask-email">
              YOUR EMAIL
              <span>OPTIONAL</span>
            </label>

            <input
              id="ask-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="hello@example.com"
              autoComplete="email"
            />

          </div>


          {/* TYPE */}

          <div className="ask-field">

            <label htmlFor="ask-type">
              I'M SENDING
            </label>

            <select
              id="ask-type"
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option value="QUESTION">
                A QUESTION
              </option>

              <option value="STORY IDEA">
                A STORY IDEA
              </option>

              <option value="RABBIT HOLE">
                A RABBIT HOLE
              </option>

              <option value="OTHER">
                SOMETHING ELSE
              </option>
            </select>

          </div>


          {/* MESSAGE */}

          <div className="ask-field ask-field-message">

            <label htmlFor="ask-message">
              TELL US ABOUT IT
            </label>

            <textarea
              id="ask-message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="What's the question, idea, or rabbit hole?"
              rows={8}
              required
            />

          </div>


          {/* SUBMIT */}

          <div className="ask-submit-row">

            <button
              type="submit"
              className="ask-submit"
              disabled={submitting}
            >
              <Send size={15} />

              {submitting
                ? "SENDING..."
                : "SEND IT"}
            </button>

            <span className="ask-note">
              QUESTIONS, IDEAS & CURIOSITIES
              WELCOME.
            </span>

          </div>


          {/* STATUS */}

          {status && (
            <div
              className={`ask-status ${
                status.startsWith("THANK YOU")
                  ? "success"
                  : ""
              }`}
            >
              {status}
            </div>
          )}

        </form>

      </section>


      {/* FOOTER NOTE */}

      <section className="ask-footer">

        <span>
          NO QUESTION IS TOO WEIRD.
        </span>

        <span>
          ✦
        </span>

        <span>
          FOLLOW THE QUESTION.
        </span>

      </section>

    </main>
  );
}