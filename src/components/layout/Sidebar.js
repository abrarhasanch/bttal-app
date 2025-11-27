import React from 'react';

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

function Sidebar({
  availableNavItems,
  currentPage,
  setCurrentPage,
  isSidebarOpen,
  toggleSidebar,
  darkMode,
  setDarkMode,
  userEmail,
  userRole,
  handleLogout,
}) {
  return (
    <aside
      className={`bg-gray-800 text-gray-200 flex flex-col sidebar-transition shadow-lg ${isSidebarOpen ? 'w-60' : 'w-20'}`}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-700 h-16 flex-shrink-0">
        {isSidebarOpen && (
          <span className="text-lg font-bold whitespace-nowrap text-indigo-400">BTTAL</span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {isSidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </button>
      </div>
      <nav className="flex-1 py-2 px-2 space-y-1.5 overflow-y-auto">
        {availableNavItems.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              setCurrentPage(item.page);
              if (window.innerWidth < 768 && isSidebarOpen) toggleSidebar();
            }}
            title={isSidebarOpen ? '' : item.name}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150 ease-in-out group ${
              currentPage === item.page
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            } ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <span
              className={`flex-shrink-0 w-5 h-5 flex items-center justify-center ${currentPage === item.page ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}
            >
              {item.icon}
            </span>
            {isSidebarOpen && <span className="ml-3 whitespace-nowrap">{item.name}</span>}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-700 mt-auto flex-shrink-0">
        {isSidebarOpen && (
          <div className="text-xs text-gray-400 mb-2 truncate">
            <p>User: {userEmail}</p>
            <p>
              Role: <span className="font-semibold">{userRole}</span>
            </p>
          </div>
        )}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={isSidebarOpen ? '' : darkMode ? 'Light Mode' : 'Dark Mode'}
          className={`w-full flex items-center px-3 py-2 text-sm rounded-md text-gray-300 hover:bg-gray-700 hover:text-white mb-1 ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
        >
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {darkMode ? '☀️' : '🌙'}
          </span>
          {isSidebarOpen && (
            <span className="ml-3 whitespace-nowrap">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>
        <button
          onClick={handleLogout}
          title={isSidebarOpen ? '' : 'Logout'}
          className={`w-full flex items-center px-3 py-2 text-sm rounded-md text-red-400 hover:bg-red-600 hover:text-white ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
        >
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">🚪</span>
          {isSidebarOpen && <span className="ml-3 whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
