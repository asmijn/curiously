import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    navigate("/admin");
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-mark">?</div>

        <div className="section-kicker">
          CURIOUSLY / ADMIN
        </div>

        <h1>
          WELCOME
          <br />
          <em>BACK.</em>
        </h1>

        <p className="admin-login-intro">
          Sign in to manage the magazine,
          <br />
          stories, categories, and covers.
        </p>

        <form onSubmit={handleLogin}>
          <label>
            EMAIL
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="your@email.com"
              required
            />
          </label>

          <label>
            PASSWORD
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="••••••••"
              required
            />
          </label>

          {error && (
            <p className="admin-login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading
              ? "SIGNING IN..."
              : "ENTER CURIOUSLY →"}
          </button>
        </form>

        <button
          type="button"
          className="admin-back"
          onClick={() => navigate("/")}
        >
          ← BACK TO CURIOUSLY
        </button>
      </div>
    </main>
  );
}