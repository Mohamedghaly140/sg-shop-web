import { auth } from "@clerk/nextjs/server";

import { customersSearchParamsCache } from "./hooks/use-customers-params";
import { getCustomers } from "./services/get-customers";
import { CustomersToolbar } from "./components/customers-toolbar";
import { CustomersTable } from "./components/customers-table";

type AdminCustomersFeatureProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function AdminCustomersFeature({ searchParams }: AdminCustomersFeatureProps) {
  const params = await customersSearchParamsCache.parse(searchParams);
  const [{ customers, total, pageCount }, { userId: currentUserId }] = await Promise.all([
    getCustomers(params),
    auth(),
  ]);

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Browse and manage registered customer accounts
        </p>
      </div>
      <CustomersToolbar total={total} />
      <CustomersTable
        customers={customers}
        pageCount={pageCount}
        currentUserId={currentUserId}
      />
    </div>
  );
}
