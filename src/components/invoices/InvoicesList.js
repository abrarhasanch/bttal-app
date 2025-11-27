import React from 'react';

export default function InvoicesList({
  invoices,
  invoiceSearchQuery,
  setInvoiceSearchQuery,
  invoiceStartDateFilter,
  setInvoiceStartDateFilter,
  invoiceEndDateFilter,
  setInvoiceEndDateFilter,
  currentInvoicePage,
  setCurrentInvoicePage,
  itemsPerPage,
  editingInvoice,
  newPaymentAmount,
  setNewPaymentAmount,
  handleUpdateInvoice,
  handleCancelEditInvoice,
  handleEditInvoice,
  handleDeleteInvoice,
  generatePrintableInvoice,
  userRole,
  pageLoading,
}) {
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(invoiceSearchQuery.toLowerCase());
    const invoiceDate = new Date(invoice.invoiceDate);
    const startDate = invoiceStartDateFilter ? new Date(invoiceStartDateFilter) : null;
    const endDate = invoiceEndDateFilter ? new Date(invoiceEndDateFilter) : null;
    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(23, 59, 59, 999);
    const matchesDateRange =
      (!startDate || invoiceDate >= startDate) && (!endDate || invoiceDate <= endDate);
    return matchesSearch && matchesDateRange;
  });

  const indexOfLastItem = currentInvoicePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const exportInvoicesToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent +=
      'Invoice No.,Date,Customer,Salesperson,Total Amount (৳),Commission (৳),Paid (৳),Due (৳)\n';
    filteredInvoices.forEach((invoice) => {
      csvContent += `${invoice.invoiceNumber},${new Date(invoice.invoiceDate).toLocaleDateString()},"${invoice.customerName}",${invoice.salespersonName || '-'},${invoice.totalAmount.toFixed(2)},${(invoice.commissionAmount || 0).toFixed(2)},${invoice.totalPaid.toFixed(2)},${invoice.finalDue.toFixed(2)}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'invoices_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">All Invoices</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search by Inv No. or Customer"
          value={invoiceSearchQuery}
          onChange={(e) => {
            setInvoiceSearchQuery(e.target.value);
            setCurrentInvoicePage(1);
          }}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
        />
        <input
          type="date"
          value={invoiceStartDateFilter}
          onChange={(e) => {
            setInvoiceStartDateFilter(e.target.value);
            setCurrentInvoicePage(1);
          }}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
          title="Start Date"
        />
        <input
          type="date"
          value={invoiceEndDateFilter}
          onChange={(e) => {
            setInvoiceEndDateFilter(e.target.value);
            setCurrentInvoicePage(1);
          }}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
          title="End Date"
        />
      </div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={exportInvoicesToCSV}
          className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-lg"
        >
          Export CSV
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 p-2 md:p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Existing Invoices
        </h3>
        {currentItems.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No invoices found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Inv. No.
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Salesperson
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
                {currentItems.map((invoice) => (
                  <React.Fragment key={invoice.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                        {invoice.customerName}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                        {invoice.salespersonName || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                        ৳{invoice.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                        ৳{invoice.totalPaid.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                        ৳{invoice.finalDue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm whitespace-nowrap">
                        <button
                          onClick={() => generatePrintableInvoice(invoice)}
                          className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs hover:bg-blue-600 mr-1 transition-colors"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => handleEditInvoice(invoice)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs hover:bg-yellow-600 mr-1 transition-colors"
                          disabled={userRole !== 'admin' && userRole !== 'super_admin'}
                        >
                          Edit/Pay
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
                          disabled={userRole !== 'admin' && userRole !== 'super_admin'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {editingInvoice && editingInvoice.id === invoice.id && (
                      <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                        <td colSpan="8" className="p-4">
                          <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-100">
                            Add Payment to Invoice: {editingInvoice.invoiceNumber}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 items-end">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                Current Total Paid (৳)
                              </label>
                              <input
                                type="number"
                                value={editingInvoice.totalPaid.toFixed(2)}
                                readOnly
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full bg-gray-100 dark:bg-gray-700"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                Add New Payment (৳)
                              </label>
                              <input
                                type="number"
                                value={newPaymentAmount}
                                onChange={(e) => setNewPaymentAmount(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full bg-white dark:bg-gray-600"
                                placeholder="0.00"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleUpdateInvoice}
                                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                                disabled={pageLoading}
                              >
                                {pageLoading ? 'Saving...' : 'Save Payment'}
                              </button>
                              <button
                                onClick={handleCancelEditInvoice}
                                className="bg-gray-400 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-500 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-x-1">
            <button
              onClick={() => setCurrentInvoicePage((prev) => Math.max(1, prev - 1))}
              disabled={currentInvoicePage === 1}
              className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentInvoicePage(page)}
                className={`px-3 py-1 rounded-md text-sm ${currentInvoicePage === page ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'} transition-colors`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentInvoicePage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentInvoicePage === totalPages}
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
