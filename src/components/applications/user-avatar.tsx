import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: { username: string; avatarUrl: string | null };
  className?: string;
}

/** Avatar d'un membre : photo si disponible, sinon ses initiales. */
export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("size-10", className)}>
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
      <AvatarFallback className="bg-brand-soft font-semibold text-brand-text">
        {getInitials(user.username)}
      </AvatarFallback>
    </Avatar>
  );
}
