// src/app/dashboard/models/wallet/page.tsx
"use client";

import UnifiedWalletDashboard from "@/components/dashboards/shared/UnifiedWalletDashboard";
import ModelNav from "@/components/dashboards/ModelNav";

export default function ModelWalletPage() {
  return (
    <>
      <ModelNav />
      <UnifiedWalletDashboard />;
    </>
  );
}
