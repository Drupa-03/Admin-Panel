//20/06/ full working
import React, { useEffect, useState } from "react";
import { Key, Unlock } from "lucide-react";
import api from "@/utills/api";
import { toast } from "react-toastify";

// Frontend roles mapped to backend role_id
const roles = [ { id: 1, name: "Admin" }, { id: 2, name: "Staff" } ];

// rights_menu_id and label — should match backend `rights_menu` table
const permissionsData = [
  { id: 1, label: "Blogs" },
  { id: 2, label: "Existing Clients" },
  { id: 3, label: "Leads" },
  { id: 4, label: "Follow-ups" },
  { id: 5, label: "Manage Staff" },
  // { id: 6, label: "manage role" },
  // { id: 7, label: "manage rights" },
  // { id: 9, label: "Manage Permissions" },
];

export default function Permission() {
  const [selectedRole, setSelectedRole] = useState(1); // Default: Admin
  const [permissions, setPermissions] = useState(() =>
    permissionsData.map((menu) => ({
      ...menu, view: false, add: false, edit: false, delete: false,
    }))
  );

  useEffect(() => {
    const fetchPermissions = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const res = await api.get(
          `/nodesetup/permissions/${selectedRole}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const backendData = res.data.data;
        const updated = permissionsData.map((menu) => {
          const match = backendData.find(
            (perm) => perm.rights_menu_id === menu.id
          );
          return {
            ...menu,
            view: match?.is_view === 1,
            add: match?.is_add === 1,
            edit: match?.is_update === 1,
            delete: match?.is_delete === 1,
          };
        });

        setPermissions(updated);
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      }
    };

    fetchPermissions();
  }, [selectedRole]);

  const handlePermissionChange = (id, type) => {
    if (selectedRole === 1) return; // Prevent Admin edits
    setPermissions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [type]: !item[type] } : item
      )
    );
  };

  const handleSelectAll = (type) => {
    if (selectedRole === 1) return; // Prevent Admin edits
    const allSelected = permissions.every((perm) => perm[type]);
    setPermissions((prev) =>
      prev.map((perm) => ({ ...perm, [type]: !allSelected }))
    );
  };

  const preparePayload = () => {
    const result = {};
    permissions.forEach((perm) => {
      result[perm.id] = {
        is_view: perm.view ? 1 : 0,
        is_add: perm.add ? 1 : 0,
        is_update: perm.edit ? 1 : 0,
        is_delete: perm.delete ? 1 : 0,
      };
    });
    return result;
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Login required");
    try {
      const res = await api.post(
        "/nodesetup/permissions",
        {
          role_id: selectedRole,
          permissions: preparePayload(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message || "Permissions updated successfully 😊");
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to update permissions ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-12 px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Key className="text-[#004b8f] size-7" />
            <h1 className="text-3xl font-bold text-[#004b8f] dark:text-white">
              Manage Permissions
            </h1>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(Number(e.target.value))}
            className="w-60 px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 mt-5">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#004b8f] text-white">
              <tr>
                <th className="px-4 py-5">#</th>
                <th className="px-4 py-5">Menu</th>
                {["view", "add", "edit", "delete"].map((type) => (
                  <th key={type} className="px-4 py-5 text-center">
                    <div className="flex items-center justify-center gap-2 capitalize">
                      {type}
                      <input
                        type="checkbox"
                        onChange={() => handleSelectAll(type)}
                        checked={permissions.every((perm) => perm[type])}
                        disabled={selectedRole === 1}
                        className="accent-[#004b8f]"
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, idx) => (
                <tr
                  key={perm.id}
                  className={
                    idx % 2 === 0 ? "bg-white" : "bg-gray-100 dark:bg-gray-800"
                  }
                >
                  <td className="px-4 py-5 font-medium">{idx + 1}</td>
                  <td className="px-4 py-5">{perm.label}</td>
                  {["view", "add", "edit", "delete"].map((type) => (
                    <td key={type} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={perm[type]}
                        onChange={() => handlePermissionChange(perm.id, type)}
                        disabled={selectedRole === 1}
                        className="accent-[#004b8f] scale-125"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={selectedRole === 1}
            className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] shadow-lg disabled:opacity-50 mt-5 cursor-pointer"
          >
            <Unlock size={18} />
            <span className="font-semibold">Submit Permission</span>
          </button>
        </div>
      </div>
    </div>
  );
}

