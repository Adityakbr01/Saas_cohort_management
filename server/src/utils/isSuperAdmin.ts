import { ISuperAdmin } from "@/models/superAdmin.model";

function isSuperAdmin(user: any): user is ISuperAdmin {
  return user?.role === "super_admin" && "isVerifiedByAdmin" in user;
}
export default  isSuperAdmin;