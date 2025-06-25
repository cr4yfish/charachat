"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  /**
   * Whether to show content in the status bar area.
   * Default: true for iOS PWA
   */
  showInStatusBar?: boolean;
  
  /**
   * Background opacity (0-1)
   * Default: 0.8
   */
  backgroundOpacity?: number;
  
  /**
   * Custom content to display in status bar
   */
  children?: React.ReactNode;
  
  /**
   * App name to display in status bar when no custom content
   */
  appName?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({
  showInStatusBar = true,
  backgroundOpacity = 0.8,
  children,
  appName = "Charachat"
}) => {
  const pathname = usePathname();
  
  // Don't show status bar content on certain pages
  const hideOnPaths = ["/auth/login"];
  const shouldHide = hideOnPaths.some(path => pathname.startsWith(path));
  
  if (!showInStatusBar || shouldHide) {
    return null;
  }

  return (
    <div 
      className={cn(
        "status-bar-overlay",
        "flex items-center justify-center",
        "text-white text-sm font-medium"
      )}
      style={{
        background: `rgba(2, 6, 24, ${backgroundOpacity})`
      }}
    >
      {children || (
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
          <span>{appName}</span>
        </div>
      )}
    </div>
  );
};

export { StatusBar };
