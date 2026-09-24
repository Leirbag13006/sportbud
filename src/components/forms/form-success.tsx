import { CircleCheck } from "lucide-react";

/** Message de confirmation d'un formulaire, annoncé aux lecteurs d'écran. */
export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-lg border border-mint-600/30 bg-mint-100/60 px-3 py-2.5 text-sm text-mint-700"
    >
      <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{message}</p>
    </div>
  );
}
