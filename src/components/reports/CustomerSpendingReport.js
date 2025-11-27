import React from 'react';

function CustomerSpendingReport({ invoices }) {
  const customerSpending = invoices.reduce((acc, invoice) => {
    const existing = acc[invoice.customerId] || {
      name: invoice.customerName,
      totalBilled: 0,
      totalPaid: 0,
      invoiceCount: 0,
    };
    existing.totalBilled += invoice.totalAmount || 0;
    existing.totalPaid += invoice.totalPaid || 0;
    existing.invoiceCount += 1;
    acc[invoice.customerId] = existing;
    return acc;
  }, {});

  const spendingData = Object.values(customerSpending);

  const exportSpendingToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Customer Name,Total Billed (৳),Total Paid (৳),Invoice Count\n';
    spendingData.forEach((item) => {
      csvContent += `${item.name},${item.totalBilled.toFixed(2)},${item.totalPaid.toFixed(2)},${item.invoiceCount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'customer_spending_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Customer Spending Report
        </h2>
        <button
          onClick={exportSpendingToCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow"
        >
          Export to CSV
        </button>
      </div>
      {spendingData.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No customer spending data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Total Billed (৳)
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Total Paid (৳)
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Invoice Count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {spendingData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                    ৳ {item.totalBilled.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                    ৳ {item.totalPaid.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                    {item.invoiceCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CustomerSpendingReport;
