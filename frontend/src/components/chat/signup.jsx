import { useState, useMemo } from "react";
import { registerWithEmail } from "../chat/Authservice";
import "../styles/auth.css";

/* ════════════════════════════════════════════════════
   ICONS
════════════════════════════════════════════════════ */
function IconUser() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2 7 12 13 22 7" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconBriefcase() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconEyeOff() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconAlertCircle() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════
   PASSWORD STRENGTH
════════════════════════════════════════════════════ */
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", bars: [] };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const classes = ["", "weak", "fair", "good", "strong"];
  return { score, label: labels[score], cls: classes[score] };
}

function PasswordStrength({ password }) {
  const { score, label, cls } = useMemo(
    () => getStrength(password),
    [password],
  );
  if (!password) return null;
  return (
    <div className="auth-pw-strength">
      <div className="auth-pw-bar-wrap">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`auth-pw-bar${i <= score ? ` ${cls}` : ""}`}
          />
        ))}
      </div>
      <span className="auth-pw-label">{label} password</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   LEFT PANEL FEATURES
════════════════════════════════════════════════════ */
const PERKS = [
  "Unlimited AI requests on Executive plan",
  "Connect your existing APIs in minutes",
  "14-day free trial — no card required",
  "Cancel anytime, keep your data",
  "SOC2 compliant infrastructure",
  "Priority onboarding for new accounts",
];

/* ════════════════════════════════════════════════════
   SIGNUP COMPONENT
════════════════════════════════════════════════════ */
export default function Signup({ onLogin, onSuccess }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [alert, setAlert] = useState(null);

  const change = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: null }));
    setAlert(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = "Required.";
    if (!form.last_name.trim()) errs.last_name = "Required.";
    if (!form.email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8) errs.password = "At least 8 characters.";
    if (!form.confirm) errs.confirm = "Please confirm your password.";
    else if (form.confirm !== form.password)
      errs.confirm = "Passwords don't match.";
    return errs;
  };

  /* ── Email register ── */
  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
      });
      setDone(true);
      onSuccess?.({ email: form.email, first_name: form.first_name });
    } catch (err) {
      setAlert(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── Left branding panel ── */}
      <div className="auth-panel-left">
        <div className="auth-left-orb-1" />
        <div className="auth-left-orb-2" />

        <div className="auth-left-logo">
          <div className="auth-left-logo-mark">D</div>
          <div>
            <div className="auth-left-logo-name">Dime Executive</div>
            <div className="auth-left-logo-sub">AI Assistant</div>
          </div>
        </div>

        <div className="auth-left-body">
          <h2 className="auth-left-headline">
            Start working
            <br />
            <span className="auth-left-headline-accent">smarter.</span>
          </h2>
          <p className="auth-left-sub">
            Join 12,000+ executives who've automated the admin work and
            reclaimed their time.
          </p>
          <div className="auth-features">
            {PERKS.map((perk) => (
              <div key={perk} className="auth-feature" style={{ gap: 12 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--green)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div
                  className="auth-feature-title"
                  style={{ fontWeight: 400, fontSize: 13 }}
                >
                  {perk}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-testimonial">
          <p className="auth-testimonial-text">
            We onboarded in one afternoon. By evening Dime was already running
            our weekly reports automatically.
          </p>
          <div className="auth-testimonial-author">
            <div className="auth-testimonial-avatar">AK</div>
            <div>
              <div className="auth-testimonial-name">Amina Kariuki</div>
              <div className="auth-testimonial-role">COO, Savanna Ventures</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-panel-right">
        <div className="auth-form-wrap">
          {done ? (
            /* ── Success state ── */
            <div className="auth-success">
              <div className="auth-success-icon">
                <IconCheck />
              </div>
              <h2 className="auth-success-title">You're all set!</h2>
              <p className="auth-success-sub">
                We've sent a verification link to <strong>{form.email}</strong>.
                <br />
                Check your inbox to activate your account.
              </p>
              <button
                className="auth-submit"
                style={{ marginTop: 32, width: "auto", padding: "12px 32px" }}
                onClick={() => onLogin?.()}
              >
                Go to sign in
              </button>
            </div>
          ) : (
            <>
              <h1 className="auth-form-title">Create account</h1>
              <p className="auth-form-sub">
                Already have an account?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onLogin?.();
                  }}
                >
                  Sign in
                </a>
              </p>

              {/* Alert */}
              {alert && (
                <div className="auth-alert error" style={{ marginBottom: 16 }}>
                  <IconAlertCircle />
                  {alert}
                </div>
              )}

              <form className="auth-form" onSubmit={submit} noValidate>
                {/* Name row */}
                <div className="auth-field-row">
                  <div className="auth-field">
                    <label className="auth-label">First name</label>
                    <div className="auth-input-wrap">
                      <input
                        className={`auth-input${errors.firstName ? " error" : ""}`}
                        type="text"
                        placeholder="Jane"
                        value={form.first_name}
                        onChange={change("first_name")}
                        autoComplete="given-name"
                      />
                      <div className="auth-input-icon">
                        <IconUser />
                      </div>
                    </div>
                    {errors.firstName && (
                      <div className="auth-field-error">
                        <IconAlertCircle />
                        {errors.firstName}
                      </div>
                    )}
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Last name</label>
                    <div className="auth-input-wrap">
                      <input
                        className={`auth-input${errors.last_name ? " error" : ""}`}
                        type="text"
                        placeholder="Doe"
                        value={form.last_name}
                        onChange={change("last_name")}
                        autoComplete="family-name"
                      />
                      <div className="auth-input-icon">
                        <IconUser />
                      </div>
                    </div>
                    {errors.lastName && (
                      <div className="auth-field-error">
                        <IconAlertCircle />
                        {errors.last_name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="auth-field">
                  <label className="auth-label">Work email</label>
                  <div className="auth-input-wrap">
                    <input
                      className={`auth-input${errors.email ? " error" : ""}`}
                      type="email"
                      placeholder="you@gmail.com"
                      value={form.email}
                      onChange={change("email")}
                      autoComplete="email"
                    />
                    <div className="auth-input-icon">
                      <IconMail />
                    </div>
                  </div>
                  {errors.email && (
                    <div className="auth-field-error">
                      <IconAlertCircle />
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <div className="auth-input-wrap">
                    <input
                      className={`auth-input${errors.password ? " error" : ""}`}
                      type={showPw ? "text" : "password"}
                      placeholder="Min 8 characters"
                      value={form.password}
                      onChange={change("password")}
                      autoComplete="new-password"
                    />
                    <div className="auth-input-icon">
                      <IconLock />
                    </div>
                    <button
                      type="button"
                      className="auth-pw-toggle"
                      onClick={() => setShowPw((v) => !v)}
                    >
                      {showPw ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                  <PasswordStrength password={form.password} />
                  {errors.password && (
                    <div className="auth-field-error">
                      <IconAlertCircle />
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="auth-field">
                  <label className="auth-label">Confirm password</label>
                  <div className="auth-input-wrap">
                    <input
                      className={`auth-input${errors.confirm ? " error" : ""}`}
                      type={showCf ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={form.confirm}
                      onChange={change("confirm")}
                      autoComplete="new-password"
                    />
                    <div className="auth-input-icon">
                      <IconLock />
                    </div>
                    <button
                      type="button"
                      className="auth-pw-toggle"
                      onClick={() => setShowCf((v) => !v)}
                    >
                      {showCf ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                  {errors.confirm && (
                    <div className="auth-field-error">
                      <IconAlertCircle />
                      {errors.confirm}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  className="auth-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="auth-spinner" />
                  ) : (
                    "Create my account"
                  )}
                </button>

                {/* Terms */}
                <p className="auth-terms">
                  By creating an account, you agree to our{" "}
                  <a href="#">Terms of Service</a> and{" "}
                  <a href="#">Privacy Policy</a>.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
