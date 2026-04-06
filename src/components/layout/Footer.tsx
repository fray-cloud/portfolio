import { CONTACT } from "@/lib/constants";

export default function Footer() {
  return (
    <footer
      className="border-t py-8 text-center text-sm"
      style={{
        borderColor: "var(--border)",
        color: "var(--muted)",
      }}
    >
      <div className="mx-auto max-w-5xl px-6">
        <p>
          &copy; {new Date().getFullYear()} Woohyun Kim.{" "}
          <a
            href={CONTACT.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--color-accent)]"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
