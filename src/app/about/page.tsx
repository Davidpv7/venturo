const values = [
  {
    title: "One landlord, direct contact",
    body: "Venturo is independently run — no call centre, no faceless property manager passing you between departments.",
  },
  {
    title: "Well-maintained rooms",
    body: "Every room is cleaned, furnished, and presented properly before you move in, and kept that way while you're there.",
  },
  {
    title: "Straightforward leasing",
    body: "Clear pricing, a lease you sign online, and a simple deposit process — no surprise conditions buried in fine print.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold text-venturo-olive">About Us</h1>
      <p className="mt-4 text-foreground/80">
        Venturo is a small, independently run room rental operation. Rather
        than managing dozens of properties at arm&apos;s length, we focus on
        doing a handful of rooms properly — good presentation, responsive
        communication, and a straightforward process from listing to lease.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {values.map((value) => (
          <div key={value.title}>
            <h2 className="font-semibold text-venturo-olive">{value.title}</h2>
            <p className="mt-2 text-sm text-foreground/70">{value.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
