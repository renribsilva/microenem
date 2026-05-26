export type SidebarContextType = {
  // Estados
  isMobile: boolean;
  isExpanded: boolean;
  isMobileOpen: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  // Funções
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
};
