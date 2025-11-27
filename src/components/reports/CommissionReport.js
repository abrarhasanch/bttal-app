import React from 'react';

function CommissionReport({ invoices }) {
  const commissionsBySalesperson = invoices.reduce((acc, invoice) => {
    if (invoice.salespersonId) {
      const existing = acc[invoice.salespersonId] || {
        name: invoice.salespersonName,
        totalCommission: 0,
        invoiceCount: 0,
      };
      existing.totalCommission += invoice.commissionAmount || 0;
      existing.invoiceCount += 1;
      acc[invoice.salespersonId] = existing;
    }
    return acc;
  }, {});

  const commissionData = Object.values(commissionsBySalesperson);

  const exportCommissionsToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Salesperson Name,Total Commission (৳),Invoice Count\n';
    commissionData.forEach((item) => {
      csvContent += `${item.name},${item.totalCommission.toFixed(2)},${item.invoiceCount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'commission_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Salesperson Commission Report
        </h2>
        <button
          onClick={exportCommissionsToCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow"
        >
          Export to CSV
        </button>
      </div>
      {commissionData.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No commission data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Salesperson Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Total Commission (৳)
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Invoices
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {commissionData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                    ৳ {item.totalCommission.toFixed(2)}
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

export default CommissionReport;
