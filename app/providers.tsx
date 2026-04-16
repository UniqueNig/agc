"use client";

import React from "react";
import AppThemeProvider from "@/src/components/ui/AppThemeProvider";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return <AppThemeProvider>{children}</AppThemeProvider>;
}
