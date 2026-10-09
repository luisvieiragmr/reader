"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveArticleAction } from "@/app/actions";

export function AddUrlForm({
  onCancel,
}: {
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await saveArticleAction(url);
    setPending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setUrl("");
    onCancel?.();
    router.push(`/read/${result.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          type="url"
          inputMode="url"
          autoComplete="url"
          autoFocus
          placeholder="Paste a URL to save"
          aria-label="Article URL"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          required
          className="h-11 rounded-full border-white/10 bg-white/6 px-4 text-[15px] text-white placeholder:text-white/35 md:h-12 md:text-base"
        />
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={pending || !url.trim()}
            className="h-11 flex-1 rounded-full px-6 sm:flex-none md:h-12"
          >
            {pending ? "Saving…" : "Save"}
          </Button>
          {onCancel ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="h-11 rounded-full px-4 text-white/70 hover:bg-white/8 hover:text-white md:h-12"
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
