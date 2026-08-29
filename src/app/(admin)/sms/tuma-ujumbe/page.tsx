import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TumaUjumbe from "@/components/sms/tuma-ujumbe";

export const metadata: Metadata = {
  title: "Tuma SMS",
  description: "Sehemu ya SMS",
  icons: {
    icon: "/logo.png",
  },
};

export default function Page() {
  return (
    <main className="w-full min-w-0 max-w-full overflow-x-hidden">
      <div className="w-full min-w-0 max-w-full space-y-6">
        <PageBreadcrumb pageTitle="Tuma SMS" />

        <div className="w-full min-w-0 max-w-7xl mx-auto overflow-x-hidden">
          <TumaUjumbe />
        </div>
      </div>
    </main>
  );
}