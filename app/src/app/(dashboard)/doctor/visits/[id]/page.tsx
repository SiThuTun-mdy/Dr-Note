import type { Metadata } from "next"
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVisitWithDetails } from "./actions";
import { ConsultView } from "@/components/features/consult/consult-view";

export const metadata: Metadata = {
  title: "Consult View",
  description: "Patient consultation details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConsultPage({ params }: PageProps) {
  const { id } = await params;
  const visit = await getVisitWithDetails(id);

  if (!visit) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <ConsultView visit={visit} currentUserId={user?.id || null} />;
}
