import { auth } from "@/lib/auth/server";

export type AuthUser = {
  id: string;
  name: string;
};

export async function getSessionUser(): Promise<AuthUser | null> {
  const { data: session } = await auth.getSession();
  const user = session?.user;
  if (!user?.id) {
    return null;
  }

  const name =
    (typeof user.name === "string" && user.name.trim()) ||
    (typeof user.email === "string" && user.email.split("@")[0]) ||
    "User";

  return { id: user.id, name: name.slice(0, 80) };
}

export async function getRequiredSessionUser(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
