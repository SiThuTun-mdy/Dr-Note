import type { Metadata } from "next"
import { notFound } from "next/navigation";
import { getVisitSummary } from "./actions";
import { VisitSummary } from "@/components/features/consult/visit-summary";

export const metadata: Metadata = {
  title: "Visit Summary",
  description: "Consultation summary and print view",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VisitSummaryPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getVisitSummary(id);

  if (!data) {
    notFound();
  }

  return <VisitSummary data={data} />;
}
