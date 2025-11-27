import { render, screen } from '@testing-library/react';
import Reports from './Reports';

describe('Reports', () => {
  test('renders both report sections with empty invoices', () => {
    render(<Reports invoices={[]} />);
    expect(screen.getByText(/Salesperson Commission Report/i)).toBeInTheDocument();
    expect(screen.getByText(/Customer Spending Report/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Export to CSV/i).length).toBe(2);
    expect(screen.getByText(/No commission data available/i)).toBeInTheDocument();
    expect(screen.getByText(/No customer spending data available/i)).toBeInTheDocument();
  });

  test('renders aggregated data when invoices provided', () => {
    const invoices = [
      {
        salespersonId: 's1',
        salespersonName: 'Alice',
        commissionAmount: 50,
        customerId: 'c1',
        customerName: 'ACME',
        totalAmount: 500,
        totalPaid: 200,
      },
      {
        salespersonId: 's1',
        salespersonName: 'Alice',
        commissionAmount: 25,
        customerId: 'c1',
        customerName: 'ACME',
        totalAmount: 300,
        totalPaid: 300,
      },
      {
        salespersonId: 's2',
        salespersonName: 'Bob',
        commissionAmount: 10,
        customerId: 'c2',
        customerName: 'Beta',
        totalAmount: 100,
        totalPaid: 0,
      },
    ];
    render(<Reports invoices={invoices} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('ACME')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });
});
