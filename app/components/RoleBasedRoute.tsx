"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";

interface RoleBasedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function RoleBasedRoute({ allowedRoles, children }: RoleBasedRouteProps) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If no user, redirect to login
        router.replace("/login");
      } else if (userRole && allowedRoles.includes(userRole)) {
        // If user has an allowed role, grant access
        setHasAccess(true);
      } else {
        // If user exists but doesn't have an allowed role, redirect to dashboard or unauthorized page
        router.replace("/dashboard"); // Or a specific unauthorized page
      }
    }
  }, [user, userRole, loading, allowedRoles, router]);

  if (loading || !hasAccess) {
    // Optionally render a loading spinner or nothing while checking access
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22A699]"></div>
      </div>
    );
  }

  return <>{children}</>;
}