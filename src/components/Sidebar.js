import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FileText, MessageSquare, User, LogOut, Menu, X, FolderOpen, Plus, UserCog, AppWindow, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/sliceData";
import useIsMobile from "./useIsMobile";


function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}


export default function DashboardSidebar({ className }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();


  const navigate = useNavigate();
  const dispatch = useDispatch();


  const userData = useSelector((state) => state?.data?.userData);
  const loggedInUser = useSelector((state) => state?.data?.userData?.user?.user_role);
  let user = userData?.user || {};


  const navigation = [
    {
      name: "My Applications",
      href: "/",
      icon: FileText,
      current: location.pathname === "/",
    },
    {
      name: "My Documents",
      href: "/documents",
      icon: FolderOpen,
      current: location.pathname === "/dashboard/documents",
    },
    {
      name: "Communications",
      href: "/communications",
      icon: MessageSquare,
      current: location.pathname === "/communications",
    },
  ];


  const adminNavigation = [
    {
      name: "Admin Users",
      href: "/",
      icon: UserCog,
      current: location.pathname === "/",
    },
    {
      name: "Applications",
      href: "/application",
      icon: AppWindow,
      current: location.pathname === "/application",
    },
    {
      name: "Communications",
      href: "/communications",
      icon: MessageSquare,
      current: location.pathname === "/communications",
    },
  ];


  function handleLogout() {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.clear();
      dispatch(setUserData({}));
    }
  }


  // Determine if sidebar should show expanded content
  const isExpanded = !isCollapsed || isHovered || isMobile;


  return (
    <>
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 z-40 bg-card border-b p-4 w-full shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="text-lg font-bold text-foreground">
                SmartVisa
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 rounded-md"
              aria-label="Open menu"
              title="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}


      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-50 flex mobile-overlay">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />


          <div className="relative z-50 flex flex-col bg-card border-r transition-all duration-300 h-full w-72 shadow-xl">
            {/* Mobile Header */}
            <div className="p-4 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">SmartVisa</h2>
                    <p className="text-xs text-muted-foreground">Dashboard</p>
                  </div>
                </div>
                <button
                  className="hover:bg-accent rounded-md p-1.5 transition-colors"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>


            {/* User Profile - Mobile */}
            <div className="p-4 border-b bg-muted/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {loggedInUser === "admin" ? "Admin User" : `${user.target_visa_type} Application`}
                  </p>
                </div>
              </div>
            </div>


            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
              {(loggedInUser === "admin" ? adminNavigation : navigation).map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </NavLink>
              ))}


              {loggedInUser !== "admin" && (
                <div className="pt-4">
                  <button
                    className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium border border-primary/20 text-primary hover:bg-primary/10 transition-all duration-200"
                    onClick={() => {
                      navigate("/newvisaform");
                      setMobileOpen(false);
                    }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    New Application
                  </button>
                </div>
              )}
            </nav>


            {/* Sign Out */}
            <div className="p-4 border-t bg-muted/20">
              <button
                className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-card border-r transition-all duration-300 h-full relative group",
          isMobile ? "hidden" : isExpanded ? "w-64" : "w-20",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Expand indicator when collapsed */}
        {isCollapsed && !isMobile && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        )}


        {/* Header */}
        <div className={cn("p-4 border-b transition-all duration-300", isCollapsed && !isHovered && "p-3")}>
          <div className="flex items-center justify-between">
            {isExpanded && (
              <div className="flex items-center gap-2 transition-all duration-300">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">SmartVisa</h2>
                  <p className="text-xs text-muted-foreground">Dashboard</p>
                </div>
              </div>
            )}


            {!isExpanded && (
              <div className="w-full flex justify-center">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
            )}


            {!isMobile && isExpanded && (
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 rounded-md"
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>


        {/* User Profile - Desktop Expanded */}
        {isExpanded && (
          <div className="p-4 border-b bg-muted/20 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {loggedInUser === "admin" ? "Admin User" : `${user.target_visa_type} Application`}
                </p>
              </div>
            </div>
          </div>
        )}


        {/* Collapsed User Avatar - Desktop */}
        {!isExpanded && (
          <div className="p-3 border-b bg-muted/20 flex justify-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        )}


        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {(loggedInUser === "admin" ? adminNavigation : navigation).map((item) => (
            <div key={item.name} className="relative group/item">
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-lg text-sm font-medium transition-all duration-200",
                    isExpanded ? "px-3 py-2.5" : "px-3 py-3 justify-center",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <item.icon className={cn("transition-all duration-200", isExpanded ? "h-5 w-5 mr-3" : "h-6 w-6")} />
                {isExpanded && <span>{item.name}</span>}
              </NavLink>


              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 whitespace-nowrap z-50 border">
                  {item.name}
                </div>
              )}
            </div>
          ))}


          {loggedInUser !== "admin" && (
            <div className="pt-4">
              <div className="relative group/item">
                <button
                  className={cn(
                    "flex items-center w-full rounded-lg text-sm font-medium border border-primary/20 text-primary hover:bg-primary/10 transition-all duration-200",
                    isExpanded ? "px-3 py-2.5 justify-start" : "px-3 py-3 justify-center"
                  )}
                  onClick={() => navigate("/newvisaform")}
                >
                  <Plus className={cn("transition-all duration-200", isExpanded ? "h-5 w-5 mr-2" : "h-6 w-6")} />
                  {isExpanded && "New Application"}
                </button>


                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 whitespace-nowrap z-50 border">
                    New Application
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>


        {/* Sign Out */}
        <div className="p-3 border-t bg-muted/20">
          <div className="relative group/item">
            <button
              className={cn(
                "flex items-center w-full rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200",
                isExpanded ? "px-3 py-2.5 justify-start" : "px-3 py-3 justify-center"
              )}
              onClick={handleLogout}
            >
              <LogOut className={cn("transition-all duration-200", isExpanded ? "h-5 w-5 mr-2" : "h-6 w-6")} />
              {isExpanded && "Sign Out"}
            </button>


            {/* Tooltip for collapsed state */}
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 whitespace-nowrap z-50 border bottom-0">
                Sign Out
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
