import { redirect } from "next/navigation";
import { getAdminSession } from "@/src/lib/admin-auth";

type AdminAuthLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminAuthLayout({
  children,
}: AdminAuthLayoutProps) {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return children;
}
