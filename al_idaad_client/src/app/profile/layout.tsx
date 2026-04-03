import ProfileShell from "@/components/profile/ProfileShell";
import type { ReactNode } from "react";

export default function ProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ProfileShell>{children}</ProfileShell>;
}
