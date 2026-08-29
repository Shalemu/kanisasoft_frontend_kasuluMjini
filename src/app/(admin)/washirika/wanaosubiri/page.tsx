


import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Wanaosubiri from "@/components/washirika/wanaosubiri/Wanaosubiri";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
  title: "Ukurasa wa Washirika wanaosubiri",
  description:
    "Ukurasa wa Washirika wanaosubiri kuidhinishwa",
       icons: {
    icon: "/logo.png",
  },
  // other metadata
};
export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Wanaosubiri kuidhinishwa" />
      <Suspense fallback={<div className="p-6">Inapakia...</div>}>
        <Wanaosubiri />
      </Suspense>
    </div>
  );
}
