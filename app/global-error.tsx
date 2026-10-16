"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>ZYRON</div>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Algo deu muito errado</h1>
          <p style={{ color: "#71717a", maxWidth: 320, marginTop: "0.5rem" }}>
            A aplicação encontrou um erro crítico. Tente recarregar a página.
          </p>
        </div>
        <button
          onClick={reset}
          style={{
            background: "#2E6BFF",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "0.6rem 1.2rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
