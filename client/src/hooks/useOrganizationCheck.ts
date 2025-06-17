// src/hooks/useOrganizationCheck.ts
import { useEffect } from "react";
import { useMyOrgQuery } from "@/store/features/api/organization/orgApi";
import { useNavigate } from "react-router-dom";

export function useOrganizationCheck(redirectTo: string = "/create-org") {
  const navigate = useNavigate();
  const { data: orgData, error, isLoading } = useMyOrgQuery();

  useEffect(() => {
    if (!isLoading && !orgData) {
      navigate(redirectTo); // ⛔️ Redirect if no org found
    }
  }, [isLoading, orgData, navigate, redirectTo]);

  return {
    orgData,
    isLoading,
    error,
    hasOrg: !!orgData,
  };
}
