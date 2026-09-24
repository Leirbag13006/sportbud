"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import { Loader2, MapPin, Search } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { searchAddresses, type AddressSuggestion } from "@/lib/geocoding";
import { cn } from "@/lib/utils";

/** Délai avant de lancer la recherche, pour ne pas interroger l'API à chaque touche. */
const DEBOUNCE_MS = 250;

interface AddressSearchProps {
  /** Position de référence pour classer les résultats (centre de la carte). */
  near?: () => [number, number] | undefined;
  onSelect: (suggestion: AddressSuggestion) => void;
  /** Recherche limitée aux villes (parcours d'accueil). */
  citiesOnly?: boolean;
  /** Valeur initiale du champ (ville déjà choisie). */
  defaultValue?: string;
  className?: string;
}

/** Champ de recherche d'adresse (ou de ville) avec suggestions (Base Adresse Nationale). */
export function AddressSearch({ near, onSelect, citiesOnly = false, defaultValue = "", className }: AddressSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const noun = citiesOnly ? "ville" : "adresse";
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = (value: string) => {
    abortRef.current?.abort();
    if (timerRef.current) clearTimeout(timerRef.current);
    // L'API exige au moins 3 caractères.
    if (value.trim().length < 3) {
      setResults([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    timerRef.current = setTimeout(() => {
      startTransition(async () => {
        try {
          const suggestions = await searchAddresses(value, { near: near?.(), signal: controller.signal, citiesOnly });
          if (!controller.signal.aborted) {
            startTransition(() => {
              setResults(suggestions);
              setError(null);
            });
          }
        } catch {
          if (!controller.signal.aborted) {
            startTransition(() => setError("Recherche indisponible pour le moment."));
          }
        }
      });
    }, DEBOUNCE_MS);
  };

  const status = isPending
    ? "Recherche…"
    : error
      ? error
      : query.trim().length >= 3 && results.length === 0
        ? `Aucune ${noun} trouvée`
        : null;

  return (
    <Autocomplete.Root
      items={results}
      value={query}
      filter={null}
      itemToStringValue={(item: AddressSuggestion) => (citiesOnly ? item.name : item.label)}
      onValueChange={(value, details) => {
        setQuery(value);
        if (details.reason === "item-press") {
          const suggestion = results.find((item) => (citiesOnly ? item.name : item.label) === value);
          if (suggestion) onSelect(suggestion);
          return;
        }
        search(value);
      }}
    >
      <div className={cn("relative", className)}>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Autocomplete.Input
          aria-label={`Rechercher une ${noun}`}
          placeholder={citiesOnly ? "Marseille, Lyon, Aix-en-Provence…" : "Rechercher une adresse…"}
          className="h-10 w-full rounded-lg border bg-background pr-9 pl-9 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        />
        {isPending && (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
        )}
      </div>

      <Autocomplete.Portal hidden={!status && results.length === 0}>
        <Autocomplete.Positioner sideOffset={6} align="start" className="z-50">
          <Autocomplete.Popup
            aria-busy={isPending || undefined}
            className="w-(--anchor-width) max-w-(--available-width) overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
          >
            <Autocomplete.Status>
              {status && <p className="px-3 py-2 text-sm text-muted-foreground">{status}</p>}
            </Autocomplete.Status>
            <Autocomplete.List className="max-h-[min(var(--available-height),18rem)] overflow-y-auto overscroll-contain py-1">
              {(item: AddressSuggestion) => (
                <Autocomplete.Item
                  key={item.id}
                  value={item}
                  className="flex cursor-default items-start gap-2.5 px-3 py-2 text-sm outline-none select-none data-highlighted:bg-muted"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand-text" aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{item.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{item.context}</span>
                  </span>
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
