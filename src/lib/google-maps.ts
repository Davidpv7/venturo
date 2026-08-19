let loadPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (typeof google !== "undefined") {
      resolve();
      return;
    }

    const callbackName = "__venturoGoogleMapsLoaded";
    (window as unknown as Record<string, () => void>)[callbackName] = resolve;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&loading=async&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load the Google Maps JavaScript API"));
    document.head.appendChild(script);
  });

  return loadPromise;
}
