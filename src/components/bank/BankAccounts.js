import React from 'react';

export default function BankAccounts({
  bankAccounts,
  newBankName,
  setNewBankName,
  newAccountName,
  setNewAccountName,
  newAccountNumber,
  setNewAccountNumber,
  newRoutingNumber,
  setNewRoutingNumber,
  newBankBranch,
  setNewBankBranch,
  editingBankAccount,
  handleEditBankAccount,
  handleUpdateBankAccount,
  handleAddBankAccount,
  handleDeleteBankAccount,
  handleCancelEdit,
  bankAccountSearchQuery,
  setBankAccountSearchQuery,
  itemsPerPage,
  currentBankAccountsPage,
  setCurrentBankAccountsPage,
  pageLoading,
  userRole,
}) {
  const filteredBankAccounts = bankAccounts.filter(
    (account) =>
      (account.bankName &&
        account.bankName.toLowerCase().includes(bankAccountSearchQuery.toLowerCase())) ||
      (account.accountNumber && account.accountNumber.includes(bankAccountSearchQuery))
  );

  const indexOfLastItem = currentBankAccountsPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBankAccounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(bankAccounts.length / itemsPerPage);

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Bank Accounts
      </h2>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="mb-4">
          <input
            type="text"
            id="newBankName"
            value={newBankName}
            onChange={(e) => setNewBankName(e.target.value)}
            placeholder="Bank Name *"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            id="newAccountName"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="Account Name *"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            id="newAccountNumber"
            value={newAccountNumber}
            onChange={(e) => setNewAccountNumber(e.target.value)}
            placeholder="Account Number *"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            id="newRoutingNumber"
            value={newRoutingNumber}
            onChange={(e) => setNewRoutingNumber(e.target.value)}
            placeholder="Routing Number (optional)"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            id="newBankBranch"
            value={newBankBranch}
            onChange={(e) => setNewBankBranch(e.target.value)}
            placeholder="Branch (optional)"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
          />
        </div>
        <button
          onClick={editingBankAccount ? handleUpdateBankAccount : handleAddBankAccount}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          disabled={pageLoading || (userRole !== 'admin' && userRole !== 'super_admin')}
        >
          {editingBankAccount
            ? pageLoading
              ? 'Updating...'
              : 'Update Bank Account'
            : pageLoading
              ? 'Adding...'
              : 'Add New Bank Account'}
        </button>

        {editingBankAccount && (
          <button
            onClick={handleCancelEdit}
            className="ml-2 mb-4 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
          >
            Cancel
          </button>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by bank name or account number"
            value={bankAccountSearchQuery}
            onChange={(e) => setBankAccountSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-left">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bank Name
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Account Number
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentItems.map((account) => (
                <tr key={account.id}>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                    {account.bankName}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                    {account.accountNumber}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 flex space-x-2">
                    <button
                      onClick={() => handleEditBankAccount(account)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                      disabled={userRole !== 'admin' && userRole !== 'super_admin'}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBankAccount(account.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
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

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentBankAccountsPage((prev) => Math.max(1, prev - 1))}
            disabled={currentBankAccountsPage === 1}
            className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentBankAccountsPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentBankAccountsPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentBankAccountsPage === totalPages}
            className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
