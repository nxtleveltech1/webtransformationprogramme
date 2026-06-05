import {
  getDocuments,
  getDocumentFormOptions,
  summariseDocuments,
} from "@/lib/services/documents";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { DocumentsClient } from "./documents-client";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  let documents: Awaited<ReturnType<typeof getDocuments>> = [];
  let options: Awaited<ReturnType<typeof getDocumentFormOptions>> = {
    projects: [],
    people: [],
  };
  let loadError = false;
  try {
    [documents, options] = await Promise.all([
      getDocuments(),
      getDocumentFormOptions(),
    ]);
  } catch {
    loadError = true;
  }

  return (
    <ViewGuard entity="document" entityLabel="documents">
      {loadError ? (
        <ErrorState description="We couldn't load documents from the database." />
      ) : (
        <DocumentsClient
          documents={documents}
          options={options}
          summary={summariseDocuments(documents)}
        />
      )}
    </ViewGuard>
  );
}
