// src/app/dashboard/supplier/wallet/page.tsx
"use client";

import UnifiedWalletDashboard from "@/components/dashboards/shared/UnifiedWalletDashboard";
import Navigation from "@/components/dashboards/Navigation";
import SupplierNav from "@/components/dashboards/SupplierNav";

export default function SupplierWalletPage() {
  return (
    <>
      <SupplierNav />
      <UnifiedWalletDashboard />;
    </>
  );
}