export function LocationMap({ address }: { address: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-venturo-olive/25">
      <iframe
        src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
        className="h-72 w-full border-0"
        loading="lazy"
        title={`Map of ${address}`}
      />
    </div>
  );
}
