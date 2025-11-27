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

function Header({ toggleSidebar, currentPage }) {
  const title = currentPage.replace(/([A-Z])/g, ' $1').trim();
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm p-4 h-16 flex items-center border-b dark:border-gray-700 flex-shrink-0">
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 mr-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <MenuIcon />
      </button>
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 capitalize">{title}</h1>
    </header>
  );
}

export default Header;
