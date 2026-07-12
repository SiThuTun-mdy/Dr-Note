import React from "react";

type Props = {
  params: { id: string };
};

export default function PatientProfilePage({ params }: Props) {
  const { id } = params;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Patient Profile</h1>
      <p className="text-sm text-muted-foreground">Patient ID: {id}</p>
      <p className="mt-4">This page is a scaffold for viewing and editing patient details. Implement fields and actions per issue #22.</p>
    </div>
  );
}
