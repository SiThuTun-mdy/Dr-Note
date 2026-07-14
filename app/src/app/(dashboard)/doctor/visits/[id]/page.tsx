import { notFound } from "next/navigation";
import { getVisitWithDetails } from "./actions";
import { ConsultView } from "@/components/features/consult/consult-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConsultPage({ params }: PageProps) {
  const { id } = await params;
  const visit = await getVisitWithDetails(id);

  if (!visit) {
    notFound();
  }

  return <ConsultView visit={visit} />;
}
