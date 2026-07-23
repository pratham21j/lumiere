"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  loginWithCredentials,
  registerUser,
  type AuthFormState,
} from "../actions";

interface Props {
  mode: "login" | "register";
}

export function CredentialsForm({ mode }: Props) {
  const action = mode === "login" ? loginWithCredentials : registerUser;
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      {mode === "register" && (
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm text-ash">
            Name
          </label>
          <Input id="name" name="name" autoComplete="name" required minLength={2} />
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-ash">
          Email
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-ash">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={8}
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-tungsten text-[#171203] hover:bg-tungsten/90"
      >
        {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
        {mode === "login" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}
