import { AppNav } from "@/components/shared/app-nav";
import { auth } from "@/lib/auth";
import { logout } from "@/features/auth/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user
    ? {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }
    : null;

  return (
    <>
      <AppNav user={user} signOutAction={logout} />
      {children}
    </>
  );
}
