import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Home,
  LogOut,
} from "lucide-react";
import { useSidebarStore } from "@/lib/sidebar-store";
import { useAuthStore } from "@/stores/auth-store";
import api from "@/lib/api";
import { toast } from "react-toastify";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <Home /> },
  { label: "Requests", href: "/requests", icon: <ClipboardList /> },
];

export default function Sidebar() {
  const { isOpen, toggle } = useSidebarStore();
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/logout/");
      logout();
      // Brief delay to ensure session is cleared on server
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <aside
      className={`md:absolute md:left-6 md:top-6 md:bottom-6 md:w-auto fixed bottom-0 left-0 w-full overflow-hidden md:rounded-3xl border border-gray-300 bg-slate-50 shadow-lg transition-all duration-300 ease-out z-1000 ${
        isOpen ? "md:w-[320px]" : "md:w-20"
      }`}
    >
      <div className="hidden md:flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div className={`${isOpen ? "block" : "hidden"}`}>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Quick Navigation
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Control Panel
          </h2>
        </div>

        <button
          type="button"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          onClick={toggle}
          className={`group flex items-center gap-4 rounded-2xl px-3 py-3 text-slate-700 transition duration-300 cursor-pointer border border-slate-700 ${
            isOpen
              ? "bg-white  hover:bg-blue-50 hover:text-slate-900"
              : "justify-center bg-white/95 hover:bg-blue-50"
          }`}
        >
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>

      <nav className="flex flex-1 md:flex-col gap-3 overflow-y-auto px-2 md:py-4 py-2 justify-between">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-4 rounded-2xl px-3 py-3 text-slate-700 transition duration-300 hover:bg-blue-100 ${
              isOpen || router.pathname === item.href
                ? "border border-transparent bg-white hover:border-blue-200 hover:text-slate-900"
                : "justify-center bg-white/95"
            }`}
            title={isOpen ? "" : item.label}
          >
            <span className="text-lg">{item.icon}</span>
            <span className={`${isOpen ? "block" : "hidden"} font-medium`}>
              {item.label}
            </span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className={`group flex items-center gap-4 rounded-2xl px-3 py-3 text-red-700 transition duration-300 cursor-pointer ${
            isOpen
              ? "border border-transparent bg-red-50 hover:border-red-200 hover:bg-red-100"
              : "justify-center bg-red-50 transition hover:bg-red-100"
          }`}
          title="Logout"
        >
          <LogOut />
          <span className={`${isOpen ? "block" : "hidden"} font-medium`}>
            Logout
          </span>
        </button>
      </nav>
    </aside>
  );
}
