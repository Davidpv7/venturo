import { requireUser } from "@/lib/require-user";
import { AccountTabs } from "@/components/account/account-tabs";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="flex flex-1 flex-col sm:flex-row">
      <AccountTabs />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
