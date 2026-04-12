"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideMoon, LucideSun } from "lucide-react";
import { useTheme } from "next-themes";

type ThemeSwitcherProps = {
  className?: string;
};

const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      size="icon"
      variant="outline"
      className={cn(className)}
      onClick={() =>
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }
    >
      <div className="relative w-4 h-4">
        <LucideSun className="absolute w-4 h-4 transition-all dark:-rotate-90 dark:scale-0" />
        <LucideMoon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeSwitcher;
