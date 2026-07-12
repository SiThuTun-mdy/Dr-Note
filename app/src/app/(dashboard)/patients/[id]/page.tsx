import React from "react";
import { createClient } from "@/lib/supabase/server";
import { userHasRole } from "@/lib/auth/roles";

type Props = {
  params: { id: string };
};

export default async function PatientProfilePage({ params }: Props) {
  const { id } = params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.id === id;
  const canStaffAccess = user
    ?
        (await userHasRole(supabase, user.id, "admin")) ||
        (await userHasRole(supabase, user.id, "doctor")) ||
        (await userHasRole(supabase, user.id, "nurse")) ||
        (await userHasRole(supabase, user.id, "receptionist"))
    :
        false;

  if (!user || (!isOwner && !canStaffAccess)) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="mt-2">You do not have permission to view this patient.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Patient Profile</h1>
      <p className="text-sm text-muted-foreground">Patient ID: {id}</p>
      <p className="mt-4">This page is a scaffold for viewing and editing patient details. Implement fields and actions per issue #22.</p>
    </div>
  );
}
