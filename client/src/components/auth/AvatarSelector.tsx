import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Default avatar options
const DEFAULT_AVATARS = [
  "/avatars/avatar-1.png",
  "/avatars/avatar-2.png",
  "/avatars/avatar-3.png",
  "/avatars/avatar-4.png",
  "/avatars/avatar-5.png",
  "/avatars/avatar-6.png",
  "/avatars/avatar-7.png",
  "/avatars/avatar-8.png",
];

interface AvatarSelectorProps {
  selectedAvatar: string | null;
  onChange: (avatarUrl: string) => void;
  className?: string;
}

export function AvatarSelector({ selectedAvatar, onChange, className }: AvatarSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-sm font-medium">Select an avatar</div>
      <div className="grid grid-cols-4 gap-2">
        {DEFAULT_AVATARS.map((avatar, index) => (
          <button
            key={index}
            type="button"
            className={cn(
              "relative aspect-square rounded-md overflow-hidden hover:ring-2 ring-primary/50 transition-all", 
              selectedAvatar === avatar && "ring-2 ring-primary"
            )}
            onClick={() => onChange(avatar)}
          >
            <img
              src={avatar}
              alt={`Avatar ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback for missing images - show placeholder with the first letter
                e.currentTarget.src = `https://placehold.co/100x100/69d2e7/fff?text=${index + 1}`;
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}