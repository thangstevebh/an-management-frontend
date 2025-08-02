"use client";

import { ButtonBack } from "@/components/ui/button-back";

export default function Page() {
  return (
    <div>
      <ButtonBack />

      <h1 className="text-2xl font-semibold text-center mb-6">
        List Card of Collaborator
      </h1>
      <p className="text-center mb-4 text-gray-500">
        View the list of cards associated with this collaborator. You can manage
        their permissions and roles from here.
      </p>
    </div>
  );
}
