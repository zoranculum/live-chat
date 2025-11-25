"use client";

import { CurrentUserAvatar } from "@/components/current-user-avatar";
import { LogoutButton } from "@/components/logout-button";
import { usePathname } from "next/navigation";

export default function ClientNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/auth")) {
    return null;
  }
  return (
    <div className="flex items-center gap-4">
      <CurrentUserAvatar />
      <LogoutButton />
    </div>
  );
}
