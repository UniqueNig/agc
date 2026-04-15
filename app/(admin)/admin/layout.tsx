import { redirect } from "next/navigation";
import { getAdminSession, isAdminSetupRequired } from "@/src/lib/admin-auth";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getAdminSession();

  if (!session) {
    redirect((await isAdminSetupRequired()) ? "/admin/setup" : "/admin/login");
  }

  return children;
}
