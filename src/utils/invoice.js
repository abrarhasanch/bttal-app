export function calculateInvoiceTotals({
  invoiceProducts,
  taxRate,
  totalPaid,
  salespersons,
  selectedSalespersonId,
}) {
  const subTotal = invoiceProducts.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
  const taxAmount = subTotal * ((taxRate || 0) / 100);
  const totalWithTax = subTotal + taxAmount;
  const paidAmountNum = parseFloat(totalPaid) || 0;
  const finalDue = totalWithTax - paidAmountNum;
  const totalSquareMeters = invoiceProducts.reduce((sum, item) => {
    if (item.type === 'sheet' && item.squareMeters) {
      const quantity = parseFloat(item.quantity);
      if (!isNaN(quantity)) {
        return sum + (quantity * item.squareMeters || 0);
      }
    }
    return sum;
  }, 0);

  let commissionAmount = 0;
  const salesperson = salespersons.find((s) => s.id === selectedSalespersonId);
  if (salesperson && salesperson.commission) {
    if (salesperson.commission.type === 'percentage') {
      commissionAmount = subTotal * ((salesperson.commission.percentageRate || 0) / 100);
    } else if (salesperson.commission.type === 'fixed') {
      commissionAmount = invoiceProducts.reduce((acc, p) => {
        let itemCommission = 0;
        if (p.type === 'sheet' && salesperson.commission.fixedSheetRate != null) {
          const quantity = parseFloat(p.quantity);
          const squareMeters = p.squareMeters;
          if (!isNaN(quantity) && !isNaN(squareMeters)) {
            itemCommission = quantity * squareMeters * salesperson.commission.fixedSheetRate;
          }
        } else if (p.type === 'bag' && salesperson.commission.fixedBagRate != null) {
          const quantity = parseFloat(p.quantity);
          if (!isNaN(quantity)) {
            itemCommission = quantity * salesperson.commission.fixedBagRate;
          }
        }
        return acc + itemCommission;
      }, 0);
    }
  }

  return {
    subTotal,
    taxAmount,
    totalWithTax,
    paidAmount: paidAmountNum,
    finalDue,
    totalSquareMeters,
    commissionAmount,
  };
}

export function buildPrintableInvoiceHtml(invoice, businessSettings, bankAccounts = []) {
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'long' })}, ${d.getFullYear()}`;
  };

  const bankDetails = bankAccounts[0] || {
    bankName: 'Bank Name',
    accountName: 'Account Holder',
    accountNumber: '1234567890',
    routingNumber: 'ROUTING123',
    bankBranch: 'Main Branch',
  };

  const formatNumber = (value, decimals = 2) =>
    value !== null && value !== undefined && !isNaN(value)
      ? parseFloat(value).toFixed(decimals)
      : '0.00';

  return `
    <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: 'Segoe UI', 'Helvetica Neue', sans-serif; margin: 0; padding: 20px; color: #333; font-size: 12px; line-height: 1.5; }
          .invoice-container { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0; }
          .header-left { text-align: left; }
          .header-right { text-align: right; }
          .header h1 { margin: 0 0 5px 0; font-size: 24px; font-weight: 600; color: #2c3e50; }
          .header p { margin: 0; font-size: 12px; color: #555; }
          .invoice-details, .customer-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .invoice-details div, .customer-details div { font-size: 13px; width: 48%; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 10px; vertical-align: top; }
          th { background-color: #f8f9fa; font-weight: 600; color: #333; }
          .text-right { text-align: right; }
          .totals { float: right; width: 280px; margin-top: 20px; font-size: 13px; }
          .totals p { margin: 6px 0; display: flex; justify-content: space-between; font-size: 13px; }
          .totals hr { border: none; border-top: 1px solid #eee; margin: 8px 0; }
          .final-due { font-size: 16px; font-weight: bold; color: #2c3e50; }
          .bank-details { font-size: 12px; margin-top: 30px; text-align: left; width: 100%; }
          .bank-details h3 { font-size: 14px; font-weight: 600; margin-bottom: 10px; color: #333; }
          .bank-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px 20px; }
          .bank-info div { min-width: 200px; }
          .bank-label { color: #666; font-size: 11px; margin-bottom: 4px; }
          .bank-value { font-weight: 500; color: #333; }
          @media print { body { padding: 0; } .invoice-container { box-shadow: none; border: none; margin: 0; max-width: 100%; } .header, .footer { page-break-inside: avoid; page-break-after: avoid; } .footer { text-align: center; font-size: 11px; color: #888; margin-top: 40px; padding-top: 10px; border-top: 1px solid #eee; position: relative; } @media print { .footer { position: fixed; bottom: 0; left: 0; width: 100%; background: white; } } }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="header-left">
              ${businessSettings.logoUrl ? `<img src="${businessSettings.logoUrl}" style="max-height: 80px; max-width: 200px; margin-bottom: 10px;" alt="Company Logo">` : `<h2 style="font-size: 20px; font-weight: 600; margin-bottom: 5px;">${businessSettings.name}</h2>`}
            </div>
            <div class="header-right">
              <h1>${businessSettings.name}</h1>
              <p>${businessSettings.officeAddress || ''}</p>
              <p>Phone: ${businessSettings.phone || ''}</p>
              <p>Email: ${businessSettings.email || ''}</p>
            </div>
          </div>

          <div class="invoice-details">
            <div>
              <strong>Invoice No:</strong> ${invoice.invoiceNumber}<br>
              <strong>Date:</strong> ${formatDate(invoice.invoiceDate)}<br>
              ${invoice.salespersonName ? `<strong>Salesperson:</strong> ${invoice.salespersonName}<br>` : ''}
            </div>
            <div>
              <strong>Bill To:</strong><br>
              ${invoice.customerName}<br>
              ${invoice.customerAddress}<br>
              ${invoice.customerPhone}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="text-center" style="width: 5%;">SL</th>
                <th class="text-center" style="width: 8%;">Type</th>
                <th class="text-center" style="width: 8%;">Qty</th>
                <th class="text-center" style="width: 10%;">Lenght(m)</th>
                <th class="text-center" style="width: 10%;">Width(m)</th>
                <th class="text-center" style="width: 10%;">Sq.M</th>
                <th class="text-right" style="width: 12%;">Price(৳)</th>
                <th class="text-right" style="width: 14%;">Amount(৳)</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.products
                .map(
                  (p, i) => `
                <tr>
                  <td class="text-center"> ${i + 1}</td>
                  <td class="text-center"> ${p.type || 'N/A'}</td>
                  <td class="text-center"> ${formatNumber(p.quantity)}</td>
                  <td class="text-center"> ${p.length !== null ? formatNumber(p.length) : '-'}</td>
                  <td class="text-center"> ${p.width !== null ? formatNumber(p.width) : '-'}</td>
                  <td class="text-center"> ${formatNumber(p.squareMeters)}</td>
                  <td class="text-right">৳ ${formatNumber(p.pricePerUnit)}</td>
                  <td class="text-right">৳ ${formatNumber(p.amount)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="totals">
            <p><strong>Total Sheet Area:</strong> <span> ${formatNumber(invoice.totalSquareMeters)}</span></p>
            <p><strong>Subtotal:</strong> <span>৳ ${formatNumber(invoice.subTotal)}</span></p>
            <p><strong>Tax (${formatNumber(invoice.taxRate)}%):</strong> <span>৳ ${formatNumber(invoice.taxAmount)}</span></p>
            <hr>
            <p class="final-due">Total: <span>৳ ${formatNumber(invoice.totalAmount)}</span></p>
            <p>Paid: <span>৳ ${formatNumber(invoice.totalPaid)}</span></p>
            <p class="final-due">Due: <span>৳ ${formatNumber(invoice.finalDue)}</span></p>
          </div>

          <br><br><br><br><br><br><br><br><br><br>
          <div class="bank-details">
            <h3>Bank Details</h3>
            <p><strong>A/C Name</strong> : ${bankDetails.accountName || 'N/A'}</p>
            <p><strong>A/C Number</strong> : ${bankDetails.accountNumber || 'N/A'}</p>
            <p><strong>Bank Name</strong> : ${bankDetails.bankName || 'N/A'}</p>
            <p><strong>Branch</strong> : ${bankDetails.bankBranch || 'N/A'}</p>
            <p><strong>Routing Number</strong> : ${bankDetails.routingNumber || 'N/A'}</p>
          </div>

          <div class="footer">This is a computer-generated invoice. No signature required.<br></div>
        </div>

        <script>
          (function() {
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          })();
        </script>
      </body>
    </html>
  `;
}

export function generatePrintableInvoice(invoice, businessSettings, bankAccounts = []) {
  const htmlContent = buildPrintableInvoiceHtml(invoice, businessSettings, bankAccounts);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups for this site to print invoices.');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.print();
}
