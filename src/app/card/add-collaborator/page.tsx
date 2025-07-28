"use client";

import { CollaboratorData } from "@/components/card/collaborator-data";
import { ButtonBack } from "@/components/ui/button-back";
import { ColumnDef } from "@tanstack/react-table";

export default function Page() {
  return (
    <div>
      <ButtonBack />

      <h1 className="text-2xl font-semibold text-center mb-6">
        Add Collaborator
      </h1>
      <p className="text-center mb-4">
        Add a collaborator to your card. You can select an existing collaborator
        or create a new one.
      </p>
      <div className="h-full max-w-[960px] mx-auto px-4 lg:px-6">
        <CollaboratorData />
      </div>
    </div>
  );
}
