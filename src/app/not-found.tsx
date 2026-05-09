import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-start gap-8 px-5 py-20 sm:px-8 sm:py-28">
      <p className="text-[10px] uppercase tracking-[0.25em] text-ink-soft">
        404 · Filed under nothing
      </p>
      <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.03em]">
        We couldn&rsquo;t find that{" "}
        <span className="text-accent">page.</span>
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-ink-soft">
        Either the URL is wrong, or the record was discarded. Nothing here either way.
        Try one of the routes below.
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link href="/dashboard" className="link-ink text-ink hover:text-accent">
          Dashboard
        </Link>
        <Link href="/board" className="link-ink text-ink hover:text-accent">
          Pipeline
        </Link>
        <Link href="/contacts" className="link-ink text-ink hover:text-accent">
          Contacts
        </Link>
        <Link href="/companies" className="link-ink text-ink hover:text-accent">
          Companies
        </Link>
        <Link href="/reminders" className="link-ink text-ink hover:text-accent">
          Reminders
        </Link>
      </div>
    </div>
  );
}
