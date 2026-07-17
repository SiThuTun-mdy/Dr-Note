"use client";

import { useState } from "react";
import Link from "next/link";
import { ChangePasswordDialog } from "@/components/features/shared/change-password-dialog";
import { Menu, Bell, KeyRound, LogOut, User, Settings, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface TopbarProps {
  onMenuClick: () => void;
  pageTitle: string;
  userName: string;
  userRole: string;
}

export function Topbar({
  onMenuClick,
  pageTitle,
  userName,
  userRole,
}: TopbarProps) {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Menu button + Page title — design system §4 */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px]"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-semibold text-foreground">{pageTitle}</h1>
      </div>

      {/* Right: Notifications + User — design system §4 */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px]"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* User dropdown menu — design system §4 */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center cursor-pointer outline-none"
            aria-label="User menu"
          >
            <span className="text-sm font-medium text-primary">{initials}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate capitalize">
                      {userRole}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/profile" />}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Change password
              </DropdownMenuItem>

              <div className="px-1.5 py-1.5">
                <p className="px-0.5 pb-1.5 text-xs text-muted-foreground">Theme</p>
                <ToggleGroup
                  value={theme ? [theme] : []}
                  onValueChange={(value) => value[0] && setTheme(value[0])}
                  variant="outline"
                  aria-label="Theme"
                  className="w-full"
                >
                  <ToggleGroupItem
                    value="light"
                    aria-label="Light theme"
                    className="min-h-[44px] min-w-[44px] flex-1"
                  >
                    <Sun className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="dark"
                    aria-label="Dark theme"
                    className="min-h-[44px] min-w-[44px] flex-1"
                  >
                    <Moon className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="system"
                    aria-label="System theme"
                    className="min-h-[44px] min-w-[44px] flex-1"
                  >
                    <Monitor className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={async () => {
                  const { logout } = await import("@/app/(auth)/login/actions");
                  await logout();
                }}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </header>
  );
}
