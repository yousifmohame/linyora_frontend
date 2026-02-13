// src/app/dashboard/wallet/page.tsx
"use client";

import UnifiedWalletDashboard from "@/components/dashboards/shared/UnifiedWalletDashboard";
import Navigation from "@/components/dashboards/Navigation";

export default function MerchantWalletPage() {
  return (
    <>
      <Navigation />
      <UnifiedWalletDashboard />;
    </>
  );
}
