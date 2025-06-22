"use client";

import type { ComponentProps } from 'react';

import { type SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from './button';
import { PanelLeftCloseIcon, PanelLeftIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SidebarToggle({

}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar, open, openMobile } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          className={cn("md:px-2 md:h-fit flex", { "justify-start" : open})}
        >
          { (!open && !openMobile) && <PanelLeftIcon size={16} />}
          { (open || openMobile) && <PanelLeftCloseIcon size={16} />}
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start">Toggle Sidebar</TooltipContent>
    </Tooltip>
  );
}
