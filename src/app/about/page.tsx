import { Container } from "@/components/ui/container";

const values = [
  {
    title: "One landlord, direct contact",
    body: "Venturo is independently run — no call centre, no faceless property manager passing you between departments.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0"
      />
    ),
  },
  {
    title: "Well-maintained rooms",
    body: "Every room is cleaned, furnished, and presented properly before you move in, and kept that way while you're there.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"
      />
    ),
  },
  {
    title: "Straightforward leasing",
    body: "Clear pricing, a lease you sign online, and a simple deposit process — no surprise conditions buried in fine print.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />,
  },
];

export default function AboutPage() {
  return (
    <Container className="py-16 sm:py-20">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        About Us
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-foreground/80">
        Venturo is a small, independently run room rental operation. Rather
        than managing dozens of properties at arm&apos;s length, we focus on
        doing a handful of rooms properly — good presentation, responsive
        communication, and a straightforward process from listing to lease.
      </p>

      <div className="mt-12 grid grid-cols-1 divide-y divide-venturo-olive/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {values.map((value, i) => (
          <div
            key={value.title}
            className="py-8 first:pt-0 sm:px-8 sm:py-0 sm:first:pl-0 sm:last:pr-0"
          >
            <span className="font-display text-3xl text-venturo-olive/30">
              {String(i + 1).padStart(2, "0")}
            </span>
            <svg
              viewBox="0 0 24 24"
              className="mt-3 h-5 w-5 text-venturo-olive"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              {value.icon}
            </svg>
            <h2 className="font-display mt-3 text-lg font-semibold text-foreground">
              {value.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">{value.body}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
