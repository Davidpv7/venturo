"use client";

import { useEffect, useRef, useState } from "react";
import { Field, inputClasses } from "@/components/ui/field";
import { loadGoogleMaps } from "@/lib/google-maps";

const DEBOUNCE_MS = 200;

export function AddressAutocompleteField({ defaultValue = "" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [predictions, setPredictions] = useState<google.maps.places.PlacePrediction[]>([]);
  const [open, setOpen] = useState(false);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  async function fetchPredictions(input: string) {
    await loadGoogleMaps();
    const { AutocompleteSessionToken, AutocompleteSuggestion } =
      (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;

    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input,
      sessionToken: sessionTokenRef.current,
      includedRegionCodes: ["au"],
    });

    setPredictions(
      suggestions
        .map((suggestion) => suggestion.placePrediction)
        .filter((prediction): prediction is google.maps.places.PlacePrediction => prediction !== null),
    );
    setOpen(true);
  }

  function handleChange(nextValue: string) {
    setValue(nextValue);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!nextValue.trim()) {
      setPredictions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => fetchPredictions(nextValue), DEBOUNCE_MS);
  }

  async function handleSelect(prediction: google.maps.places.PlacePrediction) {
    const { place } = await prediction.toPlace().fetchFields({ fields: ["formattedAddress"] });
    setValue(place.formattedAddress ?? prediction.text.text);
    setPredictions([]);
    setOpen(false);
    sessionTokenRef.current = null;
  }

  return (
    <Field label="Address">
      <div ref={containerRef} className="relative">
        <input
          name="address"
          type="text"
          required
          autoComplete="off"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => predictions.length > 0 && setOpen(true)}
          className={inputClasses}
          placeholder="Start typing an address…"
        />
        {open && predictions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-venturo-olive/25 bg-white shadow-md">
            {predictions.map((prediction) => (
              <li key={prediction.placeId}>
                <button
                  type="button"
                  onClick={() => handleSelect(prediction)}
                  className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-venturo-cream-alt"
                >
                  {prediction.text.text}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  );
}
