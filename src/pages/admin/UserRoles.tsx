import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, UserCog } from "lucide-react";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
};

type UserRole = {
  id: string;
  user_id: string;
  role: string;
};

const UserRoles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);

      if (profilesRes.data) setProfiles(profilesRes.data);
      if (rolesRes.data) setUserRoles(rolesRes.data);
    } catch (error: any) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = (userId: string): string => {
    const role = userRoles.find((r) => r.user_id === userId);
    return role?.role || "customer";
  };

  const handleRoleChange = async () => {
    if (!selectedUserId || !selectedNewRole) return;

    try {
      const existingRole = userRoles.find((r) => r.user_id === selectedUserId);

      if (existingRole) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: selectedNewRole as any })
          .eq("user_id", selectedUserId);

        if (error) throw error;
        
        // Update local state immediately
        setUserRoles(prev => 
          prev.map(r => r.user_id === selectedUserId ? { ...r, role: selectedNewRole } : r)
        );
      } else {
        const { data, error } = await supabase
          .from("user_roles")
          .insert({ user_id: selectedUserId, role: selectedNewRole as any })
          .select()
          .single();

        if (error) throw error;
        
        // Add to local state immediately
        if (data) {
          setUserRoles(prev => [...prev, data]);
        }
      }

      toast.success("Role updated successfully");
      setRoleChangeDialogOpen(false);
      setSelectedUserId(null);
      setSelectedNewRole(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;

    try {
      // Delete user_roles first (foreign key constraint)
      await supabase.from("user_roles").delete().eq("user_id", selectedUserId);
      
      // Delete profile
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", selectedUserId);

      if (error) throw error;

      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-center text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCog className="h-8 w-8" />
            User Role Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles and permissions
          </p>
        </div>
      </div>

      <Card className="p-4">
        <div className="mb-4">
          <Label htmlFor="search">Search Users</Label>
          <Input
            id="search"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.full_name}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>{profile.phone || "—"}</TableCell>
                    <TableCell>
                      <Select
                        value={getUserRole(profile.id)}
                        onValueChange={(value) => {
                          setSelectedUserId(profile.id);
                          setSelectedNewRole(value);
                          setRoleChangeDialogOpen(true);
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedUserId(profile.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={roleChangeDialogOpen} onOpenChange={setRoleChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change this user's role to {selectedNewRole}?
              This will affect their access permissions immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSelectedUserId(null);
              setSelectedNewRole(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange}>
              Change Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account and all associated data.
              This action cannot be undone. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUserId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserRoles;