import React from 'react';

export default function CreateInvoice({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  salespersons,
  selectedInvoiceSalesperson,
  setSelectedInvoiceSalesperson,
  products,
  invoiceProducts,
  handleInvoiceProductChange,
  removeInvoiceProductRow,
  addInvoiceProductRow,
  businessSettings,
  totalPaid,
  setTotalPaid,
  calculateInvoiceTotals,
  handleGenerateInvoice,
  generatePrintableInvoice,
  showMessage,
  pageLoading,
  userRole,
}) {
  const {
    subTotal,
    taxAmount,
    totalWithTax,
    paidAmount,
    finalDue,
    totalSquareMeters,
    commissionAmount,
  } = calculateInvoiceTotals();

  const handlePrintPreview = () => {
    if (!invoiceProducts.length) {
      showMessage('Add at least one product to the invoice.');
      return;
    }

    const invoicePreviewData = {
      invoiceNumber: 'PREVIEW',
      invoiceDate: new Date().toISOString(),
      customerName: selectedCustomer
        ? customers.find((c) => c.id === selectedCustomer)?.name
        : 'N/A',
      customerAddress: selectedCustomer
        ? customers.find((c) => c.id === selectedCustomer)?.address
        : 'N/A',
      customerPhone: selectedCustomer
        ? customers.find((c) => c.id === selectedCustomer)?.phone
        : 'N/A',
      customerEmail: selectedCustomer
        ? customers.find((c) => c.id === selectedCustomer)?.email
        : '',
      products: invoiceProducts.map((p) => ({
        productName: p.productName || 'N/A',
        type: p.type || 'sheet',
        quantity: parseFloat(p.quantity) || 0,
        length: p.type === 'sheet' ? parseFloat(p.length) || 0 : null,
        width: p.type === 'sheet' ? parseFloat(p.width) || 0 : null,
        squareMeters: p.type === 'sheet' ? parseFloat(p.length) * parseFloat(p.width) || 0 : 0,
        pricePerUnit: parseFloat(p.unitPrice) || 0,
        amount:
          (parseFloat(p.squareMeters) || 0) *
          (parseFloat(p.unitPrice) || 0) *
          (parseFloat(p.quantity) || 0),
      })),
      subTotal: subTotal || 0,
      taxRate: businessSettings.taxRate || 0,
      taxAmount: taxAmount || 0,
      totalAmount: totalWithTax || 0,
      totalPaid: paidAmount || 0,
      finalDue: finalDue || 0,
      totalSquareMeters: totalSquareMeters || 0,
      salespersonName: salespersons.find((s) => s.id === selectedInvoiceSalesperson)?.name || null,
      commissionAmount: commissionAmount || 0,
    };

    if (
      isNaN(invoicePreviewData.taxRate) ||
      isNaN(invoicePreviewData.taxAmount) ||
      isNaN(invoicePreviewData.totalAmount) ||
      isNaN(invoicePreviewData.totalPaid) ||
      isNaN(invoicePreviewData.finalDue)
    ) {
      showMessage('Invalid invoice data. Please check the numbers.');
      return;
    }

    generatePrintableInvoice(invoicePreviewData);
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Create New Invoice
      </h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Invoice Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="customer-select"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Select Customer:
            </label>
            <select
              id="customer-select"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
            >
              <option value="">-- Select a Customer --</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="invoice-salesperson-select"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Salesperson (Optional):
            </label>
            <select
              id="invoice-salesperson-select"
              value={selectedInvoiceSalesperson}
              onChange={(e) => setSelectedInvoiceSalesperson(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
            >
              <option value="">-- Select Salesperson --</option>
              {salespersons.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Products</h4>
        {invoiceProducts.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-x-4 gap-y-2 mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50 items-end"
          >
            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Product (GSM)
              </label>
              <select
                value={item.productId}
                onChange={(e) => handleInvoiceProductChange(item.id, 'productId', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-gray-600"
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.gsm} ({product.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Qty ({item.type === 'sheet' ? 'Rolls' : 'Pcs'})
              </label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleInvoiceProductChange(item.id, 'quantity', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-600"
                placeholder="Qty"
              />
            </div>
            {item.type === 'sheet' && (
              <>
                <div className="lg:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Length (m)
                  </label>
                  <input
                    type="number"
                    value={item.length}
                    onChange={(e) => handleInvoiceProductChange(item.id, 'length', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-600"
                    placeholder="L"
                  />
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Width (m)
                  </label>
                  <input
                    type="number"
                    value={item.width}
                    onChange={(e) => handleInvoiceProductChange(item.id, 'width', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-600"
                    placeholder="W"
                  />
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Sq. Meters
                  </label>
                  <input
                    type="text"
                    value={item.squareMeters ? item.squareMeters.toFixed(2) : '0.00'}
                    readOnly
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-500"
                  />
                </div>
              </>
            )}
            {item.type === 'bag' && <div className="md:col-span-2 lg:col-span-3"></div>}
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Unit Price (৳)
              </label>
              <input
                type="number"
                value={item.unitPrice}
                onChange={(e) => handleInvoiceProductChange(item.id, 'unitPrice', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-600"
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Line Total (৳)
              </label>
              <input
                type="text"
                value={`৳ ${item.lineTotal ? item.lineTotal.toFixed(2) : '0.00'}`}
                readOnly
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-500 font-semibold"
              />
            </div>
            <button
              onClick={() => removeInvoiceProductRow(item.id)}
              className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-300 ease-in-out text-sm self-end h-10"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={addInvoiceProductRow}
          className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out text-sm mb-4"
        >
          Add Product Row
        </button>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          {totalSquareMeters > 0 && (
            <div className="flex justify-end items-center gap-4 mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Sheet Area:
              </span>
              <span className="text-md font-semibold text-gray-800 dark:text-gray-100">
                {totalSquareMeters.toFixed(2)} sq.m
              </span>
            </div>
          )}
          <div className="flex justify-end items-center gap-4 mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub-total:</span>
            <span className="text-md font-semibold text-gray-800 dark:text-gray-100">
              ৳ {subTotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-end items-center gap-4 mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tax ({businessSettings.taxRate.toFixed(1)}%):
            </span>
            <span className="text-md font-semibold text-gray-800 dark:text-gray-100">
              ৳ {taxAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-end items-center gap-4 mb-1">
            <label
              htmlFor="total-paid"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Total Paid:
            </label>
            <input
              id="total-paid"
              type="number"
              value={totalPaid}
              onChange={(e) => setTotalPaid(e.target.value)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-md font-semibold text-green-600 w-36 text-right bg-gray-50 dark:bg-gray-700"
              placeholder="0.00"
            />
          </div>
          <div className="flex justify-end items-center gap-4 mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Amount:
            </span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              ৳ {totalWithTax.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-end items-center gap-4 mt-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Final Due:</span>
            <span className="text-lg font-bold text-red-600 dark:text-red-400">
              ৳ {finalDue.toFixed(2)}
            </span>
          </div>
          {commissionAmount > 0 && (
            <div className="flex justify-end items-center gap-4 mt-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Commission:
              </span>
              <span className="text-md font-semibold text-gray-800 dark:text-gray-100">
                ৳ {commissionAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <button
            onClick={handleGenerateInvoice}
            className="flex-1 bg-purple-600 text-white p-3 rounded-md text-md font-semibold hover:bg-purple-700 transition duration-300 ease-in-out shadow-lg"
            disabled={pageLoading || (userRole !== 'admin' && userRole !== 'super_admin')}
          >
            {pageLoading ? 'Generating...' : 'Generate Invoice & Save'}
          </button>
          <button
            onClick={handlePrintPreview}
            className="flex-1 bg-gray-600 text-white p-3 rounded-md text-md font-semibold hover:bg-gray-700 transition duration-300 ease-in-out shadow-lg"
          >
            Print Preview
          </button>
        </div>
      </div>
    </div>
  );
}
