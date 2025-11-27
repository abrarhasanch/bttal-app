import React from 'react';

export default function Customers({
  customers,
  newCustomerName,
  setNewCustomerName,
  newCustomerAddress,
  setNewCustomerAddress,
  newCustomerPhone,
  setNewCustomerPhone,
  newCustomerEmail,
  setNewCustomerEmail,
  handleAddCustomer,
  customerSearchQuery,
  setCustomerSearchQuery,
  currentCustomerPage,
  setCurrentCustomerPage,
  itemsPerPage,
  getCustomerOrderSummary,
  editingCustomer,
  setEditingCustomer,
  handleUpdateCustomer,
  handleCancelEditCustomer,
  handleDeleteCustomer,
  pageLoading,
  userRole,
}) {
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.phone.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()))
  );

  const indexOfLastItem = currentCustomerPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const exportCustomersToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent +=
      'Name,Address,Phone,Email,Total Orders,Total Amount Billed (৳),Total Paid (৳),Total Due (৳)\n';
    filteredCustomers.forEach((customer) => {
      const summary = getCustomerOrderSummary(customer.id);
      csvContent += `${customer.name},"${customer.address}",${customer.phone},${customer.email || '-'},${summary.totalOrders},${summary.totalAmount.toFixed(2)},${summary.totalPaid.toFixed(2)},${summary.totalDue.toFixed(2)}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'customers_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Customer Management
      </h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Add New Customer
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Customer Name"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <input
            type="text"
            placeholder="Address"
            value={newCustomerAddress}
            onChange={(e) => setNewCustomerAddress(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <input
            type="text"
            placeholder="Phone"
            value={newCustomerPhone}
            onChange={(e) => setNewCustomerPhone(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <input
            type="email"
            placeholder="Email (Optional)"
            value={newCustomerEmail}
            onChange={(e) => setNewCustomerEmail(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <button
          onClick={handleAddCustomer}
          className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out shadow-lg"
          disabled={pageLoading || (userRole !== 'admin' && userRole !== 'super_admin')}
        >
          {pageLoading ? 'Adding...' : 'Add Customer'}
        </button>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search customers by name, phone, or email..."
          value={customerSearchQuery}
          onChange={(e) => {
            setCustomerSearchQuery(e.target.value);
            setCurrentCustomerPage(1);
          }}
          className="w-full sm:w-2/3 p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={exportCustomersToCSV}
          className="w-full sm:w-auto bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-lg"
        >
          Export CSV
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 p-2 md:p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Existing Customers
        </h3>
        {currentItems.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            No customers found matching your search.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Total (৳)
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Paid (৳)
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Due (৳)
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((customer) => {
                  const summary = getCustomerOrderSummary(customer.id);
                  return (
                    <React.Fragment key={customer.id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          {customer.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                          {customer.address}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          {customer.phone}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                          {customer.email || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                          {summary.totalOrders}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                          ৳{summary.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                          ৳{summary.totalPaid.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                          ৳{summary.totalDue.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm whitespace-nowrap">
                          <button
                            onClick={() => setEditingCustomer({ ...customer })}
                            className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs hover:bg-yellow-600 mr-1 transition-colors"
                            disabled={userRole !== 'admin' && userRole !== 'super_admin'}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
                            disabled={userRole !== 'admin' && userRole !== 'super_admin'}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      {editingCustomer && editingCustomer.id === customer.id && (
                        <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                          <td colSpan="9" className="p-4">
                            <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-100">
                              Edit Customer: {editingCustomer.name}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <input
                                type="text"
                                placeholder="Name"
                                value={editingCustomer.name}
                                onChange={(e) =>
                                  setEditingCustomer({ ...editingCustomer, name: e.target.value })
                                }
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                              />
                              <input
                                type="text"
                                placeholder="Address"
                                value={editingCustomer.address}
                                onChange={(e) =>
                                  setEditingCustomer({
                                    ...editingCustomer,
                                    address: e.target.value,
                                  })
                                }
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                              />
                              <input
                                type="text"
                                placeholder="Phone"
                                value={editingCustomer.phone}
                                onChange={(e) =>
                                  setEditingCustomer({ ...editingCustomer, phone: e.target.value })
                                }
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                              />
                              <input
                                type="email"
                                placeholder="Email"
                                value={editingCustomer.email}
                                onChange={(e) =>
                                  setEditingCustomer({ ...editingCustomer, email: e.target.value })
                                }
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleUpdateCustomer}
                                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                                disabled={pageLoading}
                              >
                                {pageLoading ? 'Saving...' : 'Save Changes'}
                              </button>
                              <button
                                onClick={handleCancelEditCustomer}
                                className="bg-gray-400 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-500 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-x-1">
            <button
              onClick={() => setCurrentCustomerPage((prev) => Math.max(1, prev - 1))}
              disabled={currentCustomerPage === 1}
              className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentCustomerPage(page)}
                className={`px-3 py-1 rounded-md text-sm ${currentCustomerPage === page ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'} transition-colors`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentCustomerPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentCustomerPage === totalPages}
              className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
