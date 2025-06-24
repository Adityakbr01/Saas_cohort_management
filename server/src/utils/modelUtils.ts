// backend/utils/modelUtils.ts
import Mentor, { IMentor } from "../models/mentor.model";
import Student, { IStudent } from "../models/student.model";
import Organization, { IOrganization } from "../models/organization.model";
import SuperAdmin, { ISuperAdmin } from "../models/superAdmin.model";

export const getUserByRole = async (
  role: string,
  email: string,
  selectFields: string = ""
): Promise<IMentor | IStudent | IOrganization | ISuperAdmin | null> => {
  switch (role) {
    case "mentor":
      return await Mentor.findOne({ email }).select(selectFields);
    case "student":
      return await Student.findOne({ email }).select(selectFields);
    case "organization":
      return await Organization.findOne({ email }).select(selectFields);
    case "super_admin":
      return await SuperAdmin.findOne({ email }).select(selectFields);
    default:
      return null;
  }
};