import { render, screen, fireEvent } from '@testing-library/react';
import Settings from './Settings';

const baseProps = () => ({
  tempBusinessSettings: {
    name: 'BTTAL',
    officeAddress: 'Office Address',
    factoryAddress: 'Factory Address',
    phone: 'Business Phone',
    email: 'Business Email',
    logoUrl: '',
    taxRate: 0,
    defaultBankAccountId: '',
  },
  setTempBusinessSettings: jest.fn(),
  handleUpdateSettings: jest.fn(),
  userRole: 'admin',
  pageLoading: false,
  bankAccounts: [],
  currentPassword: '',
  setCurrentPassword: jest.fn(),
  newPassword: '',
  setNewPassword: jest.fn(),
  confirmNewPassword: '',
  setConfirmNewPassword: jest.fn(),
  handleChangePassword: jest.fn(),
});

describe('Settings', () => {
  test('shows Business Details for admin and calls save handler', () => {
    const props = baseProps();
    render(<Settings {...props} />);
    expect(screen.getByText(/Business Details/i)).toBeInTheDocument();
    const saveButton = screen.getByRole('button', { name: /Save Business Settings/i });
    fireEvent.click(saveButton);
    expect(props.handleUpdateSettings).toHaveBeenCalled();
  });

  test('hides Business Details for viewer but shows Change Password', () => {
    const props = { ...baseProps(), userRole: 'viewer' };
    render(<Settings {...props} />);
    expect(screen.queryByText(/Business Details/i)).not.toBeInTheDocument();
    const changeBtn = screen.getByRole('button', { name: /Change Password/i });
    fireEvent.click(changeBtn);
    expect(props.handleChangePassword).toHaveBeenCalled();
  });
});
