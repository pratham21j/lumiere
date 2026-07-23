import { Button } from "@/components/ui/button";
import { loginWithProvider } from "../actions";

/**
 * OAuth sign-in buttons — server component with form actions,
 * rendered only for providers that have keys configured.
 */
export function OAuthButtons({ google, github }: { google: boolean; github: boolean }) {
  if (!google && !github) return null;
  return (
    <div className="space-y-2">
      {google && (
        <form
          action={async () => {
            "use server";
            await loginWithProvider("google");
          }}
        >
          <Button type="submit" variant="outline" className="w-full">
            Continue with Google
          </Button>
        </form>
      )}
      {github && (
        <form
          action={async () => {
            "use server";
            await loginWithProvider("github");
          }}
        >
          <Button type="submit" variant="outline" className="w-full">
            Continue with GitHub
          </Button>
        </form>
      )}
      <div className="flex items-center gap-3 py-2" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="font-data text-[10px] uppercase tracking-widest text-ash">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
