"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/guards";
import { UserRole, UserStatus } from "@prisma/client";

// L'API Express gère l'administration. On utilise l'URL interne ou publique de l'API.
const API_URL = process.env.API_URL || "https://api.vyper.lol/v1";

export async function getUsers() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "OWNER") throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/admin/users`, {
    headers: {
      "x-api-key": process.env.AUTH_SECRET || "",
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Erreur lors de la récupération des utilisateurs");
  return res.json();
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "OWNER") return { ok: false, error: "Non autorisé" };

  try {
    const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.AUTH_SECRET || "",
      },
      body: JSON.stringify({ role: newRole }),
    });

    if (!res.ok) return { ok: false, error: "Erreur API" };
    
    revalidatePath("/dashboard/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: "Erreur lors de la modification" };
  }
}

export async function updateUserStatus(userId: string, newStatus: UserStatus) {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "OWNER") return { ok: false, error: "Non autorisé" };

  try {
    const res = await fetch(`${API_URL}/admin/users/${userId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.AUTH_SECRET || "",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) return { ok: false, error: "Erreur API" };

    revalidatePath("/dashboard/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: "Erreur lors de la modification" };
  }
}
