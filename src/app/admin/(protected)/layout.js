import AdminAuthGuard from "../AdminAuthGuard";
import AdminNavbar from "./AdminNavbar";

export default function AdminProtectedLayout({ children }) {
  return (
    <AdminAuthGuard>
      <AdminNavbar />
      {children}
    </AdminAuthGuard>
  );
}
