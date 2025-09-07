"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function UserTable({ data }: { data: any[] }) {
  const [users, setUsers] = useState(data);
  const [loading, setLoading] = useState(false);

  const [newUser, setNewUser] = useState<any>({
    email: "",
    username: "",
    password: "",
    role: "CCRO",
    region: "",
    bussinessUnit: "",
  });

  const [editingUser, setEditingUser] = useState<any | null>(null);

  const [showPassword, setShowPassword] = useState(false); // for edit modal
  const [showNewPassword, setShowNewPassword] = useState(false); // for create modal

  // ✅ Delete user
  const deleteUser = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setUsers(users.filter((u) => u.id !== id));
      toast.success("User deleted");
    } catch {
      toast.error("Error deleting user");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save Edit
  const saveEdit = async () => {
    if (!editingUser) return;
    setLoading(true);

    try {
      const payload = { ...editingUser };
      if (!payload.password) delete payload.password;

      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");

      const updated = await res.json();
      setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
      setEditingUser(null);
      toast.success("User updated");
    } catch {
      toast.error("Error updating user");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create user
  const createUser = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Username</Label>
              <Input
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-2 text-gray-500"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <Label>Role</Label>
              <select
                className="border p-2 rounded w-full"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="CCRO">CCRO</option>
                <option value="HCC">HCC</option>
                <option value="BM">BM</option>
                <option value="RH">RH</option>
                <option value="RA">RA</option>
                <option value="IA">IA</option>
                <option value="CIA">CIA</option>
                <option value="MD">MD</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div>
              <Label>Region</Label>
              <Input
                value={newUser.region}
                onChange={(e) => setNewUser({ ...newUser, region: e.target.value })}
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
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving....
                </>
              ) : (
                <>Save</>
              )}
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
                    setEditingUser({ ...editingUser, username: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Password (leave blank to keep current)</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={editingUser.password || ""}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
                  <option value="HCC">HCC</option>
                  <option value="BM">BM</option>
                  <option value="RH">RH</option>
                  <option value="RA">RA</option>
                  <option value="IA">IA</option>
                  <option value="CIA">CIA</option>
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
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving
                    Changes.....
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Table (unchanged) */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Region</th>
            <th className="border p-2">Business Unit</th>
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
              <td className="border p-2 flex gap-2">
                <Button onClick={() => setEditingUser(u)} size="sm">
                  Edit
                </Button>

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
                        This action cannot be undone. The user will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteUser(u.id)}
                        className="bg-red-600 text-white"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Deleting...
                          </>
                        ) : (
                          <>Delete</>
                        )}
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
