import { AuthView } from "@neondatabase/auth-ui";
import { authViewPaths } from "@neondatabase/auth-ui/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;

  return (
    <main
      className="auth-page"
      style={{
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--static-space-24)",
        minHeight: "60vh",
        width: "100%",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <AuthView path={path} />
      </div>
    </main>
  );
}
