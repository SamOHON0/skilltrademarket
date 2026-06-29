export const metadata = { title: "Contact | Skill Trade" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="shout text-3xl">Contact us</h1>
      <p className="mt-3 text-ink/70">
        Questions about a job or your account? Reach out and we will get back to
        you.
      </p>
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm space-y-3 text-sm">
        <p>
          <span className="text-ink/50">Email</span>
          <br />
          <a href="mailto:hello@skilltrade.ie" className="font-medium underline">
            hello@skilltrade.ie
          </a>
        </p>
        <p className="text-ink/50">
          A contact form and live chat are planned for a later phase.
        </p>
      </div>
    </div>
  );
}
