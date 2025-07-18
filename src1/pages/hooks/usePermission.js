import { useEffect, useState } from "react";
import api from "@/utills/api";

export default function usePermission(rightsName) {
  const [permission, setPermission] = useState({
    is_view: 0,
    is_add: 0,
    is_update: 0,
    is_delete: 0,
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      const authData = JSON.parse(localStorage.getItem("Auth"));
      const roleId = authData?.role_id;
      const userType = authData?.user_type;

      // ✅ If admin, skip API and grant full permissions
      if (userType === "admin") {
        setPermission({
          is_view: 1,
          is_add: 1,
          is_update: 1,
          is_delete: 1,
        });
        return;
      }

      if (!roleId) return;

      try {
        const res = await api.get(`/nodesetup/permissions/${roleId}`);
        const allPermissions = res.data?.data || [];

        const matched = allPermissions.find(
          (item) => item.rights_name === rightsName
        );

        if (matched) {
          setPermission({
            is_view: matched.is_view,
            is_add: matched.is_add,
            is_update: matched.is_update,
            is_delete: matched.is_delete,
          });
        } else {
          // No match found; default to 0s
          setPermission({ is_view: 0, is_add: 0, is_update: 0, is_delete: 0 });
        }
      } catch (err) {
        console.error("Failed to fetch permissions", err);
      }
    };

    fetchPermissions();
  }, [rightsName]);

  return permission;
}
