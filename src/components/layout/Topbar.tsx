"use client";

import { Bell, Maximize2, Menu, SlidersHorizontal, Search as SearchIcon, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type TopbarProps = {
  onToggleSidebar?: () => void;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  status?: "Unread" | "New";
  color?: "yellow" | "green" | "blue" | "purple";
};

const demoNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "John Doe",
    message: "It is a long established fact that a reader will be distracted",
    time: "2 min ago",
    status: "Unread",
    color: "yellow",
  },
  {
    id: "2",
    title: "Store Verification Done",
    message: "We have successfully received your request.",
    time: "2 min ago",
    status: "Unread",
    color: "green",
  },
  {
    id: "3",
    title: "Check Your Mail.",
    message: "All done! Now check your inbox as you're in for a sweet treat!",
    time: "2 min ago",
    status: "New",
    color: "blue",
  },
];

export default function Topbar({ onToggleSidebar, searchValue = "", onSearchChange }: TopbarProps) {
  const unreadCount = demoNotifications.filter((n) => n.status === "Unread" || n.status === "New").length;

  const onToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      // ignore
    }
  };

  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-4 sm:px-6 gap-3 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="h-10 w-10 rounded-xl" aria-label="Toggle sidebar">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 min-w-0 w-[400px] max-w-[50vw]">
          <div className="relative w-full">
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search..."
              className="h-10 rounded-xl pl-10 pr-10"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg"
              title="Filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl" title="Notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[11px] flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" sideOffset={10} className="w-[360px] p-0 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold">All Notifications</div>
                <Badge variant="secondary" className="text-[11px]">
                  {String(unreadCount).padStart(2, "0")}
                </Badge>
              </div>
              <button className="text-xs text-primary hover:underline">Mark as all read</button>
            </div>

            {/* List */}
            <ScrollArea className="max-h-[420px]">
              {demoNotifications.map((n) => (
                <div key={n.id} className="px-4 py-3 border-b last:border-b-0 hover:bg-muted/40 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full grid place-items-center text-sm font-semibold shrink-0",
                        n.color === "yellow" && "bg-yellow-400/20 text-yellow-700",
                        n.color === "green" && "bg-green-500/15 text-green-700",
                        n.color === "blue" && "bg-blue-500/15 text-blue-700",
                        n.color === "purple" && "bg-primary/15 text-primary",
                      )}
                    >
                      {n.title.slice(0, 1).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold truncate">{n.title}</div>
                        <div className="text-[11px] text-muted-foreground shrink-0">{n.time}</div>
                      </div>

                      <div className="text-[13px] text-muted-foreground mt-1 line-clamp-2">{n.message}</div>

                      {/* Status badges */}
                      {(n.status === "Unread" || n.status === "New") && (
                        <div className="flex items-center gap-2 mt-2">
                          {n.status === "Unread" && (
                            <Badge variant="destructive" className="text-[11px]">
                              Unread
                            </Badge>
                          )}
                          {n.status === "New" && (
                            <Badge variant="secondary" className="text-[11px]">
                              New
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>

            {/* Footer */}
            <div className="px-4 py-3 border-t text-center">
              <button className="text-sm text-primary hover:underline">View All</button>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="icon" onClick={onToggleFullscreen} className="h-10 w-10 rounded-xl hidden sm:inline-flex" title="Fullscreen">
          <Maximize2 className="h-5 w-5" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 rounded-xl px-2 gap-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">A</div>
              <span className="hidden md:inline text-sm font-medium">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
