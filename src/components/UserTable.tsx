"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function UserTable({ data }: { data: any[] }) {
  const [users, setUsers] = useState(data);

  const [newUser, setNewUser] = useState<any>({
    email: "",
    username: "",
    password: "",
    role: "CCRO",
    region: "",
    bussinessUnit: "",
  });

  const [editingUser, setEditingUser] = useState<any | null>(null);

  // ✅ Toggle Active/Inactive
  const toggleActive = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`/api/users/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !current }),
      });
      if (!res.ok) throw new Error("Failed");

      const updated = await res.json();
      setUsers(users.map((u) => (u.id === id ? updated : u)));
      toast.success(`User ${updated.active ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Error toggling user");
    }
  };

  // ✅ Delete user with confirmation
  const deleteUser = async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setUsers(users.filter((u) => u.id !== id));
      toast.success("User deleted");
    } catch {
      toast.error("Error deleting user");
    }
  };

  // ✅ Save Edit
  const saveEdit = async () => {
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
      setEditingUser(null);
      toast.success("User updated");
    } catch {
      toast.error("Error updating user");
    }
  };

  // ✅ Create user
  const createUser = async () => {
    try {
      const res = await fetch(`/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error("Failed");
      const created = await res.json();
      setUsers([created, ...users]);
      toast.success("User created");
      setNewUser({
        email: "",
        username: "",
        password: "",
        role: "CCRO",
        region: "",
        bussinessUnit: "",
      });
    } catch {
      toast.error("Error creating user");
    }
  };

  return (
    <div>
      {/* Create User Button + Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4">+ Create User</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Email</Label>
              <Input
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Username</Label>
              <Input
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Role</Label>
              <select
                className="border p-2 rounded w-full"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="CCRO">CCRO</option>
                <option value="CCO">CCO</option>
                <option value="CAO">CAO</option>
                <option value="MD">MD</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div>
              <Label>Region</Label>
              <Input
                value={newUser.region}
                onChange={(e) =>
                  setNewUser({ ...newUser, region: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Business Unit</Label>
              <Input
                value={newUser.bussinessUnit}
                onChange={(e) =>
                  setNewUser({ ...newUser, bussinessUnit: e.target.value })
                }
              />
            </div>
            <Button onClick={createUser} className="w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-3">
              <div>
                <Label>Email</Label>
                <Input
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Username</Label>
                <Input
                  value={editingUser.username}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      username: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Role</Label>
                <select
                  className="border p-2 rounded w-full"
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                >
                  <option value="CCRO">CCRO</option>
                  <option value="CCO">CCO</option>
                  <option value="CAO">CAO</option>
                  <option value="MD">MD</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <Label>Region</Label>
                <Input
                  value={editingUser.region}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, region: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Business Unit</Label>
                <Input
                  value={editingUser.bussinessUnit}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      bussinessUnit: e.target.value,
                    })
                  }
                />
              </div>
              <Button onClick={saveEdit} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Region</th>
            <th className="border p-2">Business Unit</th>
            <th className="border p-2">Active</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border p-2">{u.id}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.username}</td>
              <td className="border p-2">{u.role}</td>
              <td className="border p-2">{u.region}</td>
              <td className="border p-2">{u.bussinessUnit}</td>
              <td className="border p-2 text-center">
                <Switch
                  checked={u.active}
                  onCheckedChange={() => toggleActive(u.id, u.active)}
                />
              </td>
              <td className="border p-2 flex gap-2">
                <Button onClick={() => setEditingUser(u)} size="sm">
                  Edit
                </Button>

                {/* Delete confirmation */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete User {u.username}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The user will be
                        permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteUser(u.id)}
                        className="bg-red-600 text-white"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
