import AdminGate from './_components/AdminGate';
import AdminHeader from './_components/AdminHeader';
import AdminSidebar from './_components/AdminSidebar';
import './styles/admin.css';

export default function AdminLayout({ children }) {
  return (
    <AdminGate>
      <div className='admin-shell flex min-h-screen bg-[#ffffff]'>
        {/* Fixed Sidebar */}
        <div className='fixed left-0 top-0 h-screen w-64'>
          <AdminSidebar />
        </div>

        {/* Main content area with margin for sidebar */}
        <div className='ml-64 flex flex-1 flex-col'>
          {/* Fixed Header */}
          <div className='fixed left-64 right-0 top-0 z-10 bg-[#ffffff]'>
            <AdminHeader />
          </div>

          {/* Scrollable main content with padding for header */}
          <main className='mt-[88px] overflow-y-auto px-10 py-12'>
            {children}
          </main>
        </div>
      </div>
    </AdminGate>
  );
}
