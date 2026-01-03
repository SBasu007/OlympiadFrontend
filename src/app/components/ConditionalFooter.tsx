"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on admin pages
  const isAdminPage = pathname?.startsWith("/admin");
  
  if (isAdminPage) {
    return null;
  }
  
  return <Footer />;
}
