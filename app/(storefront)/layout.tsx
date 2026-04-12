export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header>Storefront Nav</header>
      <main className="flex-1">{children}</main>
      <footer>Storefront Footer</footer>
    </>
  );
}
