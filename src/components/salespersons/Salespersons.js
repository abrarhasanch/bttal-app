import React from 'react';

export default function Salespersons({
  salespersons,
  newSalespersonName,
  setNewSalespersonName,
  newSalespersonCommissionType,
  setNewSalespersonCommissionType,
  newSalespersonPercentageRate,
  setNewSalespersonPercentageRate,
  newSalespersonFixedSheetRate,
  setNewSalespersonFixedSheetRate,
  newSalespersonFixedBagRate,
  setNewSalespersonFixedBagRate,
  handleAddSalesperson,
  handleDeleteSalesperson,
  pageLoading,
  userRole,
  currentSalespersonPage,
  setCurrentSalespersonPage,
  itemsPerPage,
}) {
  const indexOfLastItem = currentSalespersonPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = salespersons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(salespersons.length / itemsPerPage);

  const exportSalespersonsToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent +=
      'Name,Commission Type,Percentage Rate (%),Fixed Sheet Rate (BDT/sq.m),Fixed Bag Rate (BDT/pc)\n';
    salespersons.forEach((sp) => {
      let commissionType = sp.commission?.type || 'N/A';
      let percentageRate =
        sp.commission?.type === 'percentage' ? sp.commission.percentageRate : '-';
      let sheetRate =
        sp.commission?.type === 'fixed' && sp.commission.fixedSheetRate != null
          ? sp.commission.fixedSheetRate
          : '-';
      let bagRate =
        sp.commission?.type === 'fixed' && sp.commission.fixedBagRate != null
          ? sp.commission.fixedBagRate
          : '-';
      csvContent += `${sp.name},${commissionType},${percentageRate},${sheetRate},${bagRate}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'salespersons_commission_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Salesperson Management
      </h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Add New Salesperson
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Salesperson Name"
            value={newSalespersonName}
            onChange={(e) => setNewSalespersonName(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
          />
          <div>
            <label
              htmlFor="commissionType"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Commission Type
            </label>
            <select
              id="commissionType"
              value={newSalespersonCommissionType}
              onChange={(e) => setNewSalespersonCommissionType(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Rate</option>
            </select>
          </div>
        </div>
        {newSalespersonCommissionType === 'percentage' && (
          <div className="mb-4">
            <label
              htmlFor="percentageRate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Percentage Rate (%)
            </label>
            <input
              type="number"
              id="percentageRate"
              placeholder="e.g., 5 for 5%"
              value={newSalespersonPercentageRate}
              onChange={(e) => setNewSalespersonPercentageRate(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
            />
          </div>
        )}
        {newSalespersonCommissionType === 'fixed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="fixedSheetRate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Sheet Rate (BDT/sq.m)
              </label>
              <input
                type="number"
                id="fixedSheetRate"
                placeholder="e.g., 2.5"
                value={newSalespersonFixedSheetRate}
                onChange={(e) => setNewSalespersonFixedSheetRate(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div>
              <label
                htmlFor="fixedBagRate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Bag Rate (BDT/piece)
              </label>
              <input
                type="number"
                id="fixedBagRate"
                placeholder="e.g., 1.0"
                value={newSalespersonFixedBagRate}
                onChange={(e) => setNewSalespersonFixedBagRate(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
              />
            </div>
          </div>
        )}
        <button
          onClick={handleAddSalesperson}
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-lg"
          disabled={pageLoading || (userRole !== 'admin' && userRole !== 'super_admin')}
        >
          {pageLoading ? 'Adding...' : 'Add Salesperson'}
        </button>
      </div>

      <div className="mb-4 flex justify-end">
        <button
          onClick={exportSalespersonsToCSV}
          className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-lg"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-2 md:p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Existing Salespersons
        </h3>
        {currentItems.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No salespersons added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Commission Details
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((sp) => (
                  <tr key={sp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {sp.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                      {sp.commission?.type === 'percentage'
                        ? `${sp.commission.percentageRate}% of Total Order`
                        : sp.commission?.type === 'fixed'
                          ? `Sheet: ৳${sp.commission.fixedSheetRate ?? 'N/A'}/sq.m, Bag: ৳${sp.commission.fixedBagRate ?? 'N/A'}/pc`
                          : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteSalesperson(sp.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
                        disabled={userRole !== 'admin' && userRole !== 'super_admin'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-x-1">
            <button
              onClick={() => setCurrentSalespersonPage((prev) => Math.max(1, prev - 1))}
              disabled={currentSalespersonPage === 1}
              className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentSalespersonPage(page)}
                className={`px-3 py-1 rounded-md text-sm ${currentSalespersonPage === page ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'} transition-colors`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentSalespersonPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentSalespersonPage === totalPages}
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
