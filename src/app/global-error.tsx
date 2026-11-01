"use client";

// Last-resort fallback when even the root layout fails. Kept dependency-free on purpose.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="de">
      <body style={{ margin: 0, minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "96px 24px" }}>
          <p style={{ color: "#7aa8ff", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            KW Sports · Club Needs
          </p>
          <h1 style={{ fontSize: 44, lineHeight: 1, margin: "16px 0" }}>Etwas ist schiefgelaufen</h1>
          <p style={{ color: "rgba(255,255,255,.75)", lineHeight: 1.6 }}>
            Die Seite konnte nicht geladen werden. Bitte versuche es erneut. / Something went wrong, please try again.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button
              type="button"
              onClick={reset}
              style={{ minHeight: 44, padding: "0 20px", background: "#0055ff", color: "#fff", border: 0, fontWeight: 700, cursor: "pointer" }}
            >
              Erneut versuchen
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the app shell may be broken here */}
            <a href="/" style={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 20px", color: "#fff", border: "1px solid rgba(255,255,255,.3)", textDecoration: "none", fontWeight: 700 }}>
              Zur Startseite
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
