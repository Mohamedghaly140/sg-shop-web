export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <aside>Admin Sidebar</aside>
      <div className="flex flex-1 flex-col">
        <header>Admin Topbar</header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
