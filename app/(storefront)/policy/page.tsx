export default function PolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-8 py-20">
      <h1 className="font-heading text-3xl tracking-[0.15em] uppercase mb-12">
        Our Policy
      </h1>

      <section className="mb-12">
        <h2 className="font-sans text-xs tracking-[0.2em] uppercase mb-6 text-muted-foreground">
          Returns & Refunds
        </h2>
        <div className="space-y-4 font-sans text-sm leading-relaxed">
          <p>
            We offer refunds immediately upon receiving items from the courier
            at your doorstep only.
          </p>
          <p>
            You may try on your items while the courier awaits for up to{" "}
            <span className="font-medium">5 minutes</span>. If you choose to
            return the item on the spot, you will only be charged the shipping
            fees. This is the only way to process a refund.
          </p>
        </div>
      </section>

      <div className="border-t border-border mb-12" />

      <section className="mb-12">
        <h2 className="font-sans text-xs tracking-[0.2em] uppercase mb-6 text-muted-foreground">
          Exchanges
        </h2>
        <div className="space-y-4 font-sans text-sm leading-relaxed">
          <p>
            For exchanges, contact us after you receive your item and we will
            send you the piece you want instead.
          </p>
        </div>
      </section>

      <div className="border-t border-border mb-12" />

      <section>
        <h2 className="font-sans text-xs tracking-[0.2em] uppercase mb-6 text-muted-foreground">
          Contact Us
        </h2>
        <ul className="space-y-3 font-sans text-sm">
          <li>
            <span className="text-muted-foreground">WhatsApp</span>{" "}
            <a
              href="https://wa.me/201025440403"
              className="hover:text-gold transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              +20 102 544 0403
            </a>
          </li>
          <li>
            <span className="text-muted-foreground">Email</span>{" "}
            <a
              href="mailto:Safa@safaghaly.com"
              className="hover:text-gold transition-colors"
            >
              Safa@safaghaly.com
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
