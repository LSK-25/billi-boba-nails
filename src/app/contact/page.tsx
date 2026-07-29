export default function ContactPage() {
  return (
    <section className="page-shell py-14">
      <span className="pill">Contact</span>
      <h1 className="mt-5 font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">Talk to the studio</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <div className="liquid-glass h-fit rounded-[2rem] p-6">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Quick links</h2>
          <div className="mt-6 grid gap-3 text-sm font-bold text-[#5f5263]"><p>Email: hello@billiboba.com</p><p>Instagram: @billibobanails</p><p>WhatsApp: add later</p></div>
        </div>
        <form className="liquid-glass grid gap-4 rounded-[2rem] p-6">
          <input className="input-field" placeholder="Name" />
          <input className="input-field" placeholder="Email or phone" />
          <textarea className="input-field min-h-36" placeholder="Message" />
          <button type="button" className="btn-primary">Send message</button>
        </form>
      </div>
    </section>
  );
}
