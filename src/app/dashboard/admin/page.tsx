import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getUsers } from "@/server/actions/admin";
import { AdminUsersClient } from "@/components/dashboard/admin/admin-users-client";

export const metadata = {
  title: "Administration | Vyper",
};

export default async function AdminPage() {
  const user = await requireUser();
  
  if (user.role !== "ADMIN" && user.role !== "OWNER") {
    redirect("/dashboard");
  }

  const users = await getUsers();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#fffaf4]">Administration</h2>
          <p className="text-sm text-[#968e85]">Gérez les utilisateurs, permissions et bannissements.</p>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-[#11100e] p-4">
        <AdminUsersClient initialUsers={users} currentUserRole={user.role} currentUserId={user.id} />
      </div>
    </div>
  );
}
