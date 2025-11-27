import { calculateInvoiceTotals } from './invoice';

describe('calculateInvoiceTotals', () => {
  test('calculates totals with percentage commission', () => {
    const invoiceProducts = [
      { type: 'sheet', lineTotal: 1000, quantity: 2, squareMeters: 1 },
      { type: 'bag', lineTotal: 500, quantity: 5 },
    ];
    const taxRate = 10; // percent
    const totalPaid = '200';
    const salespersons = [
      { id: 's1', name: 'Alice', commission: { type: 'percentage', percentageRate: 5 } },
    ];
    const { subTotal, taxAmount, totalWithTax, paidAmount, finalDue, commissionAmount } =
      calculateInvoiceTotals({
        invoiceProducts,
        taxRate,
        totalPaid,
        salespersons,
        selectedSalespersonId: 's1',
      });
    expect(subTotal).toBe(1500);
    expect(taxAmount).toBeCloseTo(150);
    expect(totalWithTax).toBeCloseTo(1650);
    expect(paidAmount).toBe(200);
    expect(finalDue).toBeCloseTo(1450);
    expect(commissionAmount).toBeCloseTo(75); // 5% of 1500
  });

  test('calculates totals with fixed commission for sheet and bag', () => {
    const invoiceProducts = [
      { type: 'sheet', lineTotal: 0, quantity: 3, squareMeters: 2 }, // area: 6
      { type: 'bag', lineTotal: 0, quantity: 10 },
    ];
    const taxRate = 0;
    const totalPaid = 0;
    const salespersons = [
      { id: 's2', name: 'Bob', commission: { type: 'fixed', fixedSheetRate: 2, fixedBagRate: 1 } },
    ];
    const { subTotal, taxAmount, totalWithTax, finalDue, commissionAmount, totalSquareMeters } =
      calculateInvoiceTotals({
        invoiceProducts,
        taxRate,
        totalPaid,
        salespersons,
        selectedSalespersonId: 's2',
      });
    // No line totals provided; subTotal remains 0
    expect(subTotal).toBe(0);
    expect(taxAmount).toBe(0);
    expect(totalWithTax).toBe(0);
    expect(finalDue).toBe(0);
    // Commission: sheet 3 * 2 sqm * 2 rate = 12; bag 10 * 1 = 10; total 22
    expect(commissionAmount).toBeCloseTo(22);
    // totalSquareMeters should sum quantity * sq.m for sheet lines: 3 * 2 = 6
    expect(totalSquareMeters).toBe(6);
  });
});
