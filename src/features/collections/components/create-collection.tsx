"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCollection } from "../actions";

export function CreateCollection() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        const { slug } = await createCollection(name.trim());
        toast(`Collection “${name.trim()}” created`);
        setName("");
        router.push(`/collections/${slug}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't create the collection.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-sm gap-2">
      <label htmlFor="collection-name" className="sr-only">
        New collection name
      </label>
      <Input
        id="collection-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Rainy Sunday films"
        maxLength={50}
      />
      <Button type="submit" disabled={pending || !name.trim()} variant="secondary">
        {pending ? (
          <Loader2 aria-hidden className="size-4 animate-spin" />
        ) : (
          <Plus aria-hidden className="size-4" />
        )}
        Create
      </Button>
    </form>
  );
}
