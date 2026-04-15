import { usersSearchParamsCache } from "./hooks/use-users-params";
import { getUsers } from "./services/get-users";
import { UsersToolbar } from "./components/users-toolbar";
import { UsersTable } from "./components/users-table";

type AdminUsersFeatureProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function AdminUsersFeature({ searchParams }: AdminUsersFeatureProps) {
  const params = await usersSearchParamsCache.parse(searchParams);
  const { users, total, pageCount } = await getUsers(params);

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage user accounts, roles, and access
        </p>
      </div>
      <UsersToolbar total={total} />
      <UsersTable users={users} pageCount={pageCount} />
    </div>
  );
}
