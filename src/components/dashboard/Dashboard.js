import React from 'react';

function Dashboard({ customers, products, invoices, salespersons }) {
  const totalBilledAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaidAmount = invoices.reduce((sum, inv) => sum + (inv.totalPaid || 0), 0);
  const totalCommissionPaid = invoices.reduce((sum, inv) => sum + (inv.commissionAmount || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 dark:text-gray-300">Total Customers</h3>
          <p className="text-3xl font-bold text-indigo-600">{customers.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 dark:text-gray-300">Total Products</h3>
          <p className="text-3xl font-bold text-green-600">{products.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 dark:text-gray-300">Total Invoices</h3>
          <p className="text-3xl font-bold text-purple-600">{invoices.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 dark:text-gray-300">Total Salespersons</h3>
          <p className="text-3xl font-bold text-orange-600">{salespersons.length}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 dark:text-gray-300">Total Billed</h3>
          <p className="text-3xl font-bold text-blue-600">৳ {totalBilledAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 dark:text-gray-300">Total Paid</h3>
          <p className="text-3xl font-bold text-teal-600">৳ {totalPaidAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 dark:text-gray-300">Total Commissions</h3>
          <p className="text-3xl font-bold text-pink-600">৳ {totalCommissionPaid.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
