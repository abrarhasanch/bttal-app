import React from 'react';
import CommissionReport from './CommissionReport';
import CustomerSpendingReport from './CustomerSpendingReport';

function Reports({ invoices }) {
  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Reports</h2>
      <div className="space-y-8">
        <CommissionReport invoices={invoices} />
        <CustomerSpendingReport invoices={invoices} />
      </div>
    </div>
  );
}

export default Reports;
