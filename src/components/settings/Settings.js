import React from 'react';

function Settings({
  tempBusinessSettings,
  setTempBusinessSettings,
  handleUpdateSettings,
  userRole,
  pageLoading,
  bankAccounts,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  handleChangePassword,
}) {
  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'taxRate') processedValue = parseFloat(value) || 0;
    setTempBusinessSettings((prev) => ({ ...prev, [name]: processedValue }));
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Application Settings
      </h2>

      {(userRole === 'admin' || userRole === 'super_admin') && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Business Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                name="name"
                value={tempBusinessSettings.name || ''}
                onChange={handleSettingChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div>
              <label
                htmlFor="officeAddress"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Office Address
              </label>
              <input
                type="text"
                id="officeAddress"
                name="officeAddress"
                value={tempBusinessSettings.officeAddress || ''}
                onChange={handleSettingChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div>
              <label
                htmlFor="factoryAddress"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Factory Address
              </label>
              <input
                type="text"
                id="factoryAddress"
                name="factoryAddress"
                value={tempBusinessSettings.factoryAddress || ''}
                onChange={handleSettingChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div>
              <label
                htmlFor="businessPhone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Phone
              </label>
              <input
                type="text"
                id="businessPhone"
                name="phone"
                value={tempBusinessSettings.phone || ''}
                onChange={handleSettingChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div>
              <label
                htmlFor="businessEmail"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="businessEmail"
                name="email"
                value={tempBusinessSettings.email || ''}
                onChange={handleSettingChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div>
              <label
                htmlFor="taxRate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                id="taxRate"
                name="taxRate"
                value={tempBusinessSettings.taxRate || 0}
                onChange={handleSettingChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="logoUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Logo URL
              </label>
              <input
                type="text"
                id="logoUrl"
                name="logoUrl"
                value={tempBusinessSettings.logoUrl || ''}
                onChange={handleSettingChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="defaultBankAccountId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Default Bank for Invoices
              </label>
              <select
                id="defaultBankAccountId"
                name="defaultBankAccountId"
                value={tempBusinessSettings.defaultBankAccountId || ''}
                onChange={handleSettingChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
              >
                <option value="">-- None --</option>
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.bankName} - {account.accountNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handleUpdateSettings}
              className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 transition duration-300 ease-in-out shadow-lg"
              disabled={pageLoading || (userRole !== 'admin' && userRole !== 'super_admin')}
            >
              {pageLoading ? 'Saving...' : 'Save Business Settings'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-8">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Change Password
        </h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
            />
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
            />
          </div>
          <div>
            <label
              htmlFor="confirmNewPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
            />
          </div>
          <button
            onClick={handleChangePassword}
            className="w-full bg-orange-600 text-white p-3 rounded-md hover:bg-orange-700 transition duration-300 ease-in-out shadow-lg"
            disabled={pageLoading}
          >
            {pageLoading ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
