import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { loginWithEmail } from "../chat/Authservice";
// import ForgotPassword from "./Forgotpassword";
import "../styles/auth.css";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ════════════════════════════════════════════════════
   ICONS
════════════════════════════════════════════════════ */
function IconMail() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2 7 12 13 22 7" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconEyeOff() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconAlertCircle() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
/* ════════════════════════════════════════════════════
   LOGIN MODAL
   Props:
     open      — boolean
     onClose   — dismiss modal
     onSignup  — switch to signup
     onSuccess — called with user object on success
════════════════════════════════════════════════════ */
export default function Login({ open, onClose, onSignup, onSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const firstInputRef = useRef(null);

  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const alertRef = useRef(null);

  // Keep the modal mounted a beat longer than `open` so the exit
  // animation has something to animate before it disappears.
  const [mounted, setMounted] = useState(open);

  /* Body scroll lock */
  useEffect(() => {
    const anyOpen = open || forgotOpen;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, forgotOpen]);

  /* Auto-focus email on open */
  useEffect(() => {
    if (open && !forgotOpen)
      setTimeout(() => firstInputRef.current?.focus(), 120);
  }, [open, forgotOpen]);

  /* Escape key */
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === "Escape") {
        if (forgotOpen) setForgotOpen(false);
        else onClose?.();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, forgotOpen, onClose]);

  /* Reset on open */
  useEffect(() => {
    if (open) {
      setForm({ email: "", password: "" });
      setErrors({});
      setAlert(null);
      setShowPw(false);
    }
  }, [open]);

  /* Mount / animate in / animate out */
  useEffect(() => {
    if (open) {
      setMounted(true);
    } else if (mounted) {
      if (prefersReducedMotion() || !overlayRef.current || !modalRef.current) {
        setMounted(false);
        return;
      }
      const tl = gsap.timeline({ onComplete: () => setMounted(false) });
      tl.to(modalRef.current, {
        opacity: 0,
        y: 14,
        scale: 0.97,
        duration: 0.22,
        ease: "power2.in",
      }).to(overlayRef.current, { opacity: 0, duration: 0.18, ease: "power1.in" }, "<");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* Entrance animation once mounted.
     The overlay + modal fade/scale in is already handled by CSS
     (.login-overlay { animation: overlayIn } / .login-modal { animation: modalIn }),
     so we only stagger the fields — timed to start as the modal's
     own CSS entrance (0.28s) is settling. */
  useLayoutEffect(() => {
    if (!mounted || !open) return;
    if (prefersReducedMotion() || !modalRef.current) return;

    const ctx = gsap.context(() => {
      const fields = modalRef.current.querySelectorAll(
        ".login-modal-logo, .auth-form-title, .auth-form-sub, .auth-field, .auth-options, .auth-submit"
      );
      gsap.fromTo(
        fields,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.05, delay: 0.15 }
      );
    }, modalRef);

    return () => ctx.revert();
  }, [mounted, open]);

  /* Shake the alert into view instead of just popping it in */
  useEffect(() => {
    if (!alert || !alertRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      alertRef.current,
      { opacity: 0, x: 0 },
      {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
        keyframes: { x: [0, -6, 6, -4, 4, 0] },
      }
    );
  }, [alert]);

  if (!mounted) return null;

  const change = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: null }));
    setAlert(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email address.";
    if (!form.password) errs.password = "Password is required.";
    return errs;
  };

  /* ── Email submit ── */
  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setAlert(null);
    try {
      const user = await loginWithEmail(form);
      onSuccess?.(user);
      onClose?.();
    } catch (err) {
      setAlert(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchToSignup = (e) => {
    e.preventDefault();
    onClose?.();
    onSignup?.();
  };

  return (
    <>
      {/* ── Main login modal ── */}
      <div
        className="login-overlay"
        ref={overlayRef}
        onClick={(e) =>
          e.target === e.currentTarget && !forgotOpen && onClose?.()
        }
        role="dialog"
        aria-modal="true"
        aria-label="Sign in to Dime Executive"
      >
        <div className="login-modal" style={{ position: "relative" }} ref={modalRef}>
          {/* Close */}
          <button className="login-close" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>

          {/* Logo */}
          <div className="login-modal-logo">
            <div className="login-modal-mark">D</div>
            <div>
              <div className="login-modal-name">Dime Executive</div>
              <div className="login-modal-sub">AI Assistant</div>
            </div>
          </div>

          {/* Heading */}
          <h2 className="auth-form-title" style={{ marginBottom: 6 }}>
            Welcome back
          </h2>
          <p className="auth-form-sub">
            Don't have an account?{" "}
            <a href="#" onClick={switchToSignup}>
              Create one free
            </a>
          </p>

          {/* Error alert */}
          {alert && (
            <div className="auth-alert error" style={{ marginBottom: 16 }} ref={alertRef}>
              <IconAlertCircle />
              {alert}
            </div>
          )}

          {/* ── Email form ── */}
          <form className="auth-form" onSubmit={submit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">
                Email address
              </label>
              <div className="auth-input-wrap">
                <input
                  id="login-email"
                  ref={firstInputRef}
                  className={`auth-input${errors.email ? " error" : ""}`}
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={change("email")}
                  autoComplete="email"
                  disabled={loading}
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
              <label className="auth-label" htmlFor="login-password">
                Password
              </label>
              <div className="auth-input-wrap">
                <input
                  id="login-password"
                  className={`auth-input${errors.password ? " error" : ""}`}
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={change("password")}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <div className="auth-input-icon">
                  <IconLock />
                </div>
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {errors.password && (
                <div className="auth-field-error">
                  <IconAlertCircle />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Remember / Forgot */}
            <div className="auth-options">
              <label className="auth-checkbox-wrap">
                <input className="auth-checkbox" type="checkbox" />
                <span className="auth-checkbox-label">Remember me</span>
              </label>

              {/* ── Forgot password — opens modal ── */}
              <button
                type="button"
                className="auth-forgot"
                onClick={() => setForgotOpen(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "inherit",
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : "Sign in to Dime"}
            </button>
          </form>
        </div>
      </div>

      {/* ── Forgot password modal — stacked on top ── */}
      {/* <ForgotPassword
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onBack={() => setForgotOpen(false)}
      /> */}
    </>
  );
}


// import { useState, useEffect, useRef } from "react";
// import { loginWithEmail } from "../chat/Authservice";
// // import ForgotPassword from "./Forgotpassword";
// import "../styles/auth.css";

// /* ════════════════════════════════════════════════════
//    ICONS
// ════════════════════════════════════════════════════ */
// function IconMail() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect x="2" y="4" width="20" height="16" rx="2" />
//       <polyline points="2 7 12 13 22 7" />
//     </svg>
//   );
// }
// function IconLock() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//       <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//     </svg>
//   );
// }
// function IconEye() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
//       <circle cx="12" cy="12" r="3" />
//     </svg>
//   );
// }
// function IconEyeOff() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
//       <line x1="1" y1="1" x2="23" y2="23" />
//     </svg>
//   );
// }
// function IconClose() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//     >
//       <line x1="18" y1="6" x2="6" y2="18" />
//       <line x1="6" y1="6" x2="18" y2="18" />
//     </svg>
//   );
// }
// function IconAlertCircle() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <circle cx="12" cy="12" r="10" />
//       <line x1="12" y1="8" x2="12" y2="12" />
//       <line x1="12" y1="16" x2="12.01" y2="16" />
//     </svg>
//   );
// }
// /* ════════════════════════════════════════════════════
//    LOGIN MODAL
//    Props:
//      open      — boolean
//      onClose   — dismiss modal
//      onSignup  — switch to signup
//      onSuccess — called with user object on success
// ════════════════════════════════════════════════════ */
// export default function Login({ open, onClose, onSignup, onSuccess }) {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [errors, setErrors] = useState({});
//   const [showPw, setShowPw] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [alert, setAlert] = useState(null);
//   const [forgotOpen, setForgotOpen] = useState(false);
//   const firstInputRef = useRef(null);

//   /* Body scroll lock */
//   useEffect(() => {
//     const anyOpen = open || forgotOpen;
//     document.body.style.overflow = anyOpen ? "hidden" : "";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [open, forgotOpen]);

//   /* Auto-focus email on open */
//   useEffect(() => {
//     if (open && !forgotOpen)
//       setTimeout(() => firstInputRef.current?.focus(), 120);
//   }, [open, forgotOpen]);

//   /* Escape key */
//   useEffect(() => {
//     if (!open) return;
//     const h = (e) => {
//       if (e.key === "Escape") {
//         if (forgotOpen) setForgotOpen(false);
//         else onClose?.();
//       }
//     };
//     window.addEventListener("keydown", h);
//     return () => window.removeEventListener("keydown", h);
//   }, [open, forgotOpen, onClose]);

//   /* Reset on open */
//   useEffect(() => {
//     if (open) {
//       setForm({ email: "", password: "" });
//       setErrors({});
//       setAlert(null);
//       setShowPw(false);
//     }
//   }, [open]);

//   if (!open) return null;

//   const change = (field) => (e) => {
//     setForm((f) => ({ ...f, [field]: e.target.value }));
//     setErrors((er) => ({ ...er, [field]: null }));
//     setAlert(null);
//   };

//   const validate = () => {
//     const errs = {};
//     if (!form.email) errs.email = "Email is required.";
//     else if (!/\S+@\S+\.\S+/.test(form.email))
//       errs.email = "Enter a valid email address.";
//     if (!form.password) errs.password = "Password is required.";
//     return errs;
//   };

//   /* ── Email submit ── */
//   const submit = async (e) => {
//     e.preventDefault();
//     const errs = validate();
//     if (Object.keys(errs).length) {
//       setErrors(errs);
//       return;
//     }
//     setLoading(true);
//     setAlert(null);
//     try {
//       const user = await loginWithEmail(form);
//       onSuccess?.(user);
//       onClose?.();
//     } catch (err) {
//       setAlert(err.message || "Invalid email or password. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const switchToSignup = (e) => {
//     e.preventDefault();
//     onClose?.();
//     onSignup?.();
//   };

//   return (
//     <>
//       {/* ── Main login modal ── */}
//       <div
//         className="login-overlay"
//         onClick={(e) =>
//           e.target === e.currentTarget && !forgotOpen && onClose?.()
//         }
//         role="dialog"
//         aria-modal="true"
//         aria-label="Sign in to Dime Executive"
//       >
//         <div className="login-modal" style={{ position: "relative" }}>
//           {/* Close */}
//           <button className="login-close" onClick={onClose} aria-label="Close">
//             <IconClose />
//           </button>

//           {/* Logo */}
//           <div className="login-modal-logo">
//             <div className="login-modal-mark">D</div>
//             <div>
//               <div className="login-modal-name">Dime Executive</div>
//               <div className="login-modal-sub">AI Assistant</div>
//             </div>
//           </div>

//           {/* Heading */}
//           <h2 className="auth-form-title" style={{ marginBottom: 6 }}>
//             Welcome back
//           </h2>
//           <p className="auth-form-sub">
//             Don't have an account?{" "}
//             <a href="#" onClick={switchToSignup}>
//               Create one free
//             </a>
//           </p>

//           {/* Error alert */}
//           {alert && (
//             <div className="auth-alert error" style={{ marginBottom: 16 }}>
//               <IconAlertCircle />
//               {alert}
//             </div>
//           )}

//           {/* ── Email form ── */}
//           <form className="auth-form" onSubmit={submit} noValidate>
//             {/* Email */}
//             <div className="auth-field">
//               <label className="auth-label" htmlFor="login-email">
//                 Email address
//               </label>
//               <div className="auth-input-wrap">
//                 <input
//                   id="login-email"
//                   ref={firstInputRef}
//                   className={`auth-input${errors.email ? " error" : ""}`}
//                   type="email"
//                   placeholder="you@company.com"
//                   value={form.email}
//                   onChange={change("email")}
//                   autoComplete="email"
//                   disabled={loading}
//                 />
//                 <div className="auth-input-icon">
//                   <IconMail />
//                 </div>
//               </div>
//               {errors.email && (
//                 <div className="auth-field-error">
//                   <IconAlertCircle />
//                   {errors.email}
//                 </div>
//               )}
//             </div>

//             {/* Password */}
//             <div className="auth-field">
//               <label className="auth-label" htmlFor="login-password">
//                 Password
//               </label>
//               <div className="auth-input-wrap">
//                 <input
//                   id="login-password"
//                   className={`auth-input${errors.password ? " error" : ""}`}
//                   type={showPw ? "text" : "password"}
//                   placeholder="Enter your password"
//                   value={form.password}
//                   onChange={change("password")}
//                   autoComplete="current-password"
//                   disabled={loading}
//                 />
//                 <div className="auth-input-icon">
//                   <IconLock />
//                 </div>
//                 <button
//                   type="button"
//                   className="auth-pw-toggle"
//                   onClick={() => setShowPw((v) => !v)}
//                   aria-label={showPw ? "Hide password" : "Show password"}
//                 >
//                   {showPw ? <IconEyeOff /> : <IconEye />}
//                 </button>
//               </div>
//               {errors.password && (
//                 <div className="auth-field-error">
//                   <IconAlertCircle />
//                   {errors.password}
//                 </div>
//               )}
//             </div>

//             {/* Remember / Forgot */}
//             <div className="auth-options">
//               <label className="auth-checkbox-wrap">
//                 <input className="auth-checkbox" type="checkbox" />
//                 <span className="auth-checkbox-label">Remember me</span>
//               </label>

//               {/* ── Forgot password — opens modal ── */}
//               <button
//                 type="button"
//                 className="auth-forgot"
//                 onClick={() => setForgotOpen(true)}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   cursor: "pointer",
//                   padding: 0,
//                   fontFamily: "inherit",
//                 }}
//               >
//                 Forgot password?
//               </button>
//             </div>

//             {/* Submit */}
//             <button className="auth-submit" type="submit" disabled={loading}>
//               {loading ? <span className="auth-spinner" /> : "Sign in to Dime"}
//             </button>
//           </form>
//         </div>
//       </div>

//       {/* ── Forgot password modal — stacked on top ── */}
//       {/* <ForgotPassword
//         open={forgotOpen}
//         onClose={() => setForgotOpen(false)}
//         onBack={() => setForgotOpen(false)}
//       /> */}
//     </>
//   );
// }
