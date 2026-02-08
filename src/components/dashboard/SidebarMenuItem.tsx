import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

interface SidebarMenuItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
}

export const SidebarMenuItem = ({ icon: Icon, label, path }: SidebarMenuItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link to={path}>
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )}
      >
        <Icon className={cn('w-5 h-5', isActive ? 'text-primary' : 'group-hover:text-foreground')} />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
};
