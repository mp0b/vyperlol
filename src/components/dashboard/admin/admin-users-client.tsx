"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { UserRole, UserStatus } from "@prisma/client";
import { updateUserRole, updateUserStatus } from "@/server/actions/admin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ShieldAlert, Shield, ShieldCheck, Ban, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type UserSummary = {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
};

export function AdminUsersClient({ 
  initialUsers,
  currentUserRole,
  currentUserId
}: { 
  initialUsers: UserSummary[];
  currentUserRole: UserRole;
  currentUserId: string;
}) {
  const [isPending, setIsPending] = useState(false);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setIsPending(true);
    const result = await updateUserRole(userId, newRole);
    if (result.ok) {
      toast.success(`Rôle mis à jour avec succès`);
    } else {
      toast.error(result.error || "Erreur lors de la modification");
    }
    setIsPending(false);
  };

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    setIsPending(true);
    const result = await updateUserStatus(userId, newStatus);
    if (result.ok) {
      toast.success(`Statut mis à jour avec succès`);
    } else {
      toast.error(result.error || "Erreur lors de la modification");
    }
    setIsPending(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "OWNER": return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Propriétaire</Badge>;
      case "ADMIN": return <Badge className="bg-white/20 text-white/70 border-white/20">Admin</Badge>;
      case "MODERATOR": return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Modérateur</Badge>;
      default: return <Badge variant="outline" className="text-[#968e85] border-white/10">Membre</Badge>;
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "BANNED": return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Banni</Badge>;
      case "SUSPENDED": return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Suspendu</Badge>;
      case "DELETED": return <Badge className="bg-neutral-800 text-neutral-400 border-white/10">Supprimé</Badge>;
      default: return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Actif</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-[#c3bbb1]">
        <thead className="border-b border-white/10 text-xs uppercase text-[#80786f]">
          <tr>
            <th className="px-4 py-3 font-medium">Utilisateur</th>
            <th className="px-4 py-3 font-medium">Rôle</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">Inscription</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {initialUsers.map((user) => {
            const isSelf = user.id === currentUserId;
            const isTargetOwner = user.role === "OWNER";
            const canModify = !isSelf && (currentUserRole === "OWNER" || !isTargetOwner);

            return (
              <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 border border-white/10">
                      <AvatarFallback className="bg-white/15 text-xs text-white/50">
                        {(user.displayName || user.email).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-[#fffaf4]">{user.displayName || "Sans nom"}</span>
                      <span className="text-xs text-[#968e85]">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                <td className="px-4 py-4">{getStatusBadge(user.status)}</td>
                <td className="px-4 py-4 text-[#968e85]">{format(new Date(user.createdAt), "dd/MM/yyyy")}</td>
                <td className="px-4 py-4 text-right">
                  {canModify ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#968e85] hover:text-white" disabled={isPending}>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 border-white/10 bg-[#1b1916] text-[#fffaf4]">
                        
                        <DropdownMenuLabel className="text-xs text-[#80786f]">Gérer le rôle</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, "USER")} className="focus:bg-white/10 cursor-pointer">
                          <Shield className="mr-2 size-4" /> Membre
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, "MODERATOR")} className="focus:bg-white/10 cursor-pointer">
                          <ShieldCheck className="mr-2 size-4 text-blue-400" /> Modérateur
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, "ADMIN")} className="focus:bg-white/10 cursor-pointer">
                          <ShieldAlert className="mr-2 size-4 text-white/80" /> Admin
                        </DropdownMenuItem>
                        
                        {currentUserRole === "OWNER" && (
                          <DropdownMenuItem onClick={() => handleRoleChange(user.id, "OWNER")} className="focus:bg-white/10 cursor-pointer text-purple-400">
                            <ShieldAlert className="mr-2 size-4" /> Propriétaire
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuLabel className="text-xs text-[#80786f]">Gérer le statut</DropdownMenuLabel>
                        
                        {user.status !== "ACTIVE" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(user.id, "ACTIVE")} className="focus:bg-white/10 cursor-pointer text-green-400">
                            <CheckCircle2 className="mr-2 size-4" /> Réactiver
                          </DropdownMenuItem>
                        )}
                        
                        {user.status !== "BANNED" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(user.id, "BANNED")} className="focus:bg-red-500/20 cursor-pointer text-red-400">
                            <Ban className="mr-2 size-4" /> Bannir (Définitif)
                          </DropdownMenuItem>
                        )}
                        
                        {user.status !== "SUSPENDED" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(user.id, "SUSPENDED")} className="focus:bg-yellow-500/20 cursor-pointer text-yellow-400">
                            <AlertTriangle className="mr-2 size-4" /> Suspendre
                          </DropdownMenuItem>
                        )}
                        
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-xs text-[#80786f] italic">{isSelf ? "Vous-même" : "Protégé"}</span>
                  )}
                </td>
              </tr>
            );
          })}
          
          {initialUsers.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-[#80786f]">
                Aucun utilisateur trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
