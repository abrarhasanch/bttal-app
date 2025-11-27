import React, { useState, useEffect, useCallback } from 'react';
import { auth, db, appId } from './services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  setDoc,
  getDoc,
} from 'firebase/firestore';

// Recharts imports for charting
// Removed Recharts imports (not used)

// Helper for generating unique IDs (simple, for client-side)
import { generateUniqueId } from './utils/id';
import BankAccounts from './components/bank/BankAccounts';
import Customers from './components/customers/Customers';
import Products from './components/products/Products';
import CreateInvoice from './components/invoices/CreateInvoice';
import InvoicesList from './components/invoices/InvoicesList';
import {
  calculateInvoiceTotals as calculateInvoiceTotalsUtil,
  generatePrintableInvoice as generatePrintableInvoiceUtil,
} from './utils/invoice';
import Salespersons from './components/salespersons/Salespersons';
import Reports from './components/reports/Reports';
import Settings from './components/settings/Settings';
import Dashboard from './components/dashboard/Dashboard';
import UserManagement from './components/users/UserManagement';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Toast from './components/common/Toast';

// Simplified Icon Components (just the emoji for now)
const HomeIcon = () => <>🏠</>;
const UsersIcon = () => <>👥</>;
const PackageIcon = () => <>📦</>;
const DocumentPlusIcon = () => <>📝</>;
const DocumentTextIcon = () => <>🧾</>;
const UserGroupIcon = () => <>🧑‍💼</>;
const ChartBarIcon = () => <>📊</>;
const CogIcon = () => <>⚙️</>;
const BankIcon = () => <>🏦</>;

function App() {
  // --- Firebase Core States ---
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState('viewer');
  const [userAccountStatus, setUserAccountStatus] = useState('loading');

  // --- Application Loading & Error States ---
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // --- Authentication UI States ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);

  // --- Business Settings States ---
  const [businessSettings, setBusinessSettings] = useState({
    name: 'BTTAL',
    officeAddress: 'Office Address',
    factoryAddress: 'Factory Address',
    phone: 'Business Phone',
    email: 'Business Email',
    logoUrl: 'https://i.ibb.co/6R5f5tDh/49f94a12-6614-4dcb-a91e-cc1d4a232256.png',
    taxRate: 0,
    defaultBankAccountId: '',
  });
  const [tempBusinessSettings, setTempBusinessSettings] = useState(businessSettings);

  // --- Password Change States ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // --- User Management State (for Super Admin) ---
  const [allUsers, setAllUsers] = useState([]);

  // --- Data States ---
  const [customers, setCustomers] = useState([]);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const [products, setProducts] = useState([]);
  const [newProductGSM, setNewProductGSM] = useState('');
  const [newProductType, setNewProductType] = useState('sheet');
  const [newProductUnitPrice, setNewProductUnitPrice] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  const [invoices, setInvoices] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [invoiceProducts, setInvoiceProducts] = useState([]);
  const [totalPaid, setTotalPaid] = useState('');
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [selectedInvoiceSalesperson, setSelectedInvoiceSalesperson] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [invoiceStartDateFilter, setInvoiceStartDateFilter] = useState('');
  const [invoiceEndDateFilter, setInvoiceEndDateFilter] = useState('');

  const [salespersons, setSalespersons] = useState([]);
  const [newSalespersonName, setNewSalespersonName] = useState('');
  const [newSalespersonCommissionType, setNewSalespersonCommissionType] = useState('percentage');
  const [newSalespersonPercentageRate, setNewSalespersonPercentageRate] = useState('');
  const [newSalespersonFixedSheetRate, setNewSalespersonFixedSheetRate] = useState('');
  const [newSalespersonFixedBagRate, setNewSalespersonFixedBagRate] = useState('');
  

  // --- Bank Details States ---
  const [bankAccounts, setBankAccounts] = useState([]);
  const [newBankName, setNewBankName] = useState('');
  const [newBankBranch, setNewBankBranch] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newRoutingNumber, setNewRoutingNumber] = useState('');
  const [editingBankAccount, setEditingBankAccount] = useState(null);
  const [bankAccountSearchQuery, setBankAccountSearchQuery] = useState('');

  // --- Pagination States ---
  const itemsPerPage = 10;
  const [currentCustomerPage, setCurrentCustomerPage] = useState(1);
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [currentInvoicePage, setCurrentInvoicePage] = useState(1);
  const [currentSalespersonPage, setCurrentSalespersonPage] = useState(1);
  const [currentUserManagementPage, setCurrentUserManagementPage] = useState(1);
  const [currentBankAccountsPage, setCurrentBankAccountsPage] = useState(1);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [message, setMessage] = useState('');
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const showMessage = (msg, duration = 3000) => {
    setMessage(msg);
    setIsMessageVisible(true);
    setTimeout(() => {
      setIsMessageVisible(false);
      setMessage('');
    }, duration);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[Auth State Change] User:', user ? user.uid : 'No User');
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email || 'Anonymous User');
        try {
          const userDocRef = doc(db, `artifacts/${appId}/users`, user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserAccountStatus(userData.status || 'pending');
            if (userData.status === 'approved') {
              setUserRole(userData.role || 'admin');
              console.log('[Auth State Change] User approved. Role:', userData.role || 'admin');
            } else {
              setUserRole('pending_viewer');
              console.log('[Auth State Change] User status:', userData.status || 'pending');
            }
          } else {
            console.log(
              '[Auth State Change] User document not found in Firestore for UID:',
              user.uid
            );
            setUserAccountStatus('pending');
            setUserRole('pending_viewer');
          }
        } catch (e) {
          console.error('Error reading user doc:', e);
          setError('Failed to load user profile.');
        }
      } else {
        setUserId(null);
        setUserEmail(null);
        setUserRole('viewer');
        setUserAccountStatus('loading');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const collectionsToListen = [
    { name: 'customers', setter: setCustomers, roles: ['admin', 'super_admin'] },
    { name: 'products', setter: setProducts, roles: ['admin', 'super_admin'] },
    { name: 'invoices', setter: setInvoices, roles: ['admin', 'super_admin'] },
    { name: 'salespersons', setter: setSalespersons, roles: ['admin', 'super_admin'] },
    { name: 'bank_accounts', setter: setBankAccounts, roles: ['admin', 'super_admin'] },
    { name: 'users', setter: setAllUsers, roles: ['super_admin'] },
  ];

  useEffect(() => {
    if (!userId || userAccountStatus !== 'approved') {
      setCustomers([]);
      setProducts([]);
      setInvoices([]);
      setSalespersons([]);
      setAllUsers([]);
      setBankAccounts([]);
      const defaultSettings = {
        name: 'BTTAL',
        officeAddress: 'Office Address',
        factoryAddress: 'Factory Address',
        phone: 'Business Phone',
        email: 'Business Email',
        logoUrl: 'https://i.ibb.co/6R5f5tDh/49f94a12-6614-4dcb-a91e-cc1d4a232256.png',
        taxRate: 0,
        defaultBankAccountId: '',
      };
      setBusinessSettings(defaultSettings);
      setTempBusinessSettings(defaultSettings);
      if (pageLoading && userAccountStatus !== 'loading') setPageLoading(false);
      return;
    }

    console.log(
      '[Data Fetch Effect] Initiating for UserID:',
      userId,
      'Role:',
      userRole,
      'Status:',
      userAccountStatus
    );
    setPageLoading(true);
    setError(null);

    const dataSources = [
      ...collectionsToListen.filter((c) => c.roles.includes(userRole)).map((c) => c.name),
      'settings',
    ];
    const initialLoadStatus = Object.fromEntries(dataSources.map((name) => [name, false]));
    let allInitialLoadsDone = false;

    const checkAllInitialLoads = (sourceName) => {
      if (allInitialLoadsDone) return;
      initialLoadStatus[sourceName] = true;
      if (Object.values(initialLoadStatus).every((status) => status === true)) {
        setPageLoading(false);
        allInitialLoadsDone = true;
      }
    };

    const unsubscribes = collectionsToListen
      .map((colInfo) => {
        if (!colInfo.roles.includes(userRole)) return null;

        const basePath = `artifacts/${appId}`;
        const q = query(
          collection(
            db,
            `${basePath}/${colInfo.name === 'users' ? '' : 'users/' + userId + '/'}${colInfo.name}`
          )
        );

        return onSnapshot(
          q,
          (snapshot) => {
            const fetchedData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            colInfo.setter(fetchedData);
            if (!initialLoadStatus[colInfo.name]) checkAllInitialLoads(colInfo.name);
          },
          (err) => {
            console.error(`[Data Error] Fetching ${colInfo.name}:`, err);
            setError((prev) => `${prev || ''}Load failed for ${colInfo.name}. `);
            if (!initialLoadStatus[colInfo.name]) checkAllInitialLoads(colInfo.name);
          }
        );
      })
      .filter((unsub) => unsub !== null);

    const settingsDocRef = doc(db, `artifacts/${appId}/users/${userId}/settings/businessProfile`);
    const unsubscribeSettings = onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const fetchedSettings = { id: docSnap.id, ...docSnap.data() };
          setBusinessSettings(fetchedSettings);
        } else {
          console.log('[Data Fetch Effect] Settings doc not found, creating with defaults.');
          const defaultSettings = {
            name: 'BTTAL',
            officeAddress: 'Office Address',
            factoryAddress: 'Factory Address',
            phone: 'Business Phone',
            email: 'Business Email',
            logoUrl: 'https://i.ibb.co/6R5f5tDh/49f94a12-6614-4dcb-a91e-cc1d4a232256.png',
            taxRate: 0,
            defaultBankAccountId: '',
          };
          setDoc(settingsDocRef, defaultSettings).catch((err) =>
            console.error('Error creating default settings:', err)
          );
          setBusinessSettings(defaultSettings);
        }
        if (!initialLoadStatus['settings']) checkAllInitialLoads('settings');
      },
      (err) => {
        console.error('[Data Error] Fetching settings:', err);
        setError((prev) => `${prev || ''}Load failed for settings. `);
        if (!initialLoadStatus['settings']) checkAllInitialLoads('settings');
      }
    );
    unsubscribes.push(unsubscribeSettings);

    const safetyTimeout = setTimeout(() => {
      if (!allInitialLoadsDone && pageLoading) {
        console.warn(
          '[Data Fetch Effect] Safety timeout (8s) triggered. Forcing pageLoading to false.'
        );
        setPageLoading(false);
        allInitialLoadsDone = true;
        if (!error)
          setError(
            (prev) =>
              `${prev || ''}Data loading timed out. Some parts may be missing. Please refresh.`
          );
      }
    }, 8000);

    return () => {
      console.log('[Data Fetch Effect] Cleanup. Detaching listeners.');
      unsubscribes.forEach((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
      clearTimeout(safetyTimeout);
    };
    // Intentionally depend only on auth/account status to avoid reattaching
    // all Firestore listeners when transient state like error/pageLoading changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userRole, userAccountStatus]);

  useEffect(() => {
    setTempBusinessSettings(businessSettings);
  }, [businessSettings]);

  const handleEditBankAccount = (account) => {
    setEditingBankAccount(account);
    setNewBankName(account.bankName);
    setNewAccountName(account.accountName);
    setNewAccountNumber(account.accountNumber);
    setNewRoutingNumber(account.routingNumber || '');
    setNewBankBranch(account.bankBranch || '');
  };

  const handleUpdateBankAccount = async () => {
    if (!newBankName.trim() || !newAccountName.trim() || !newAccountNumber.trim()) {
      showMessage('Please fill in all required fields (*)');
      return;
    }

    if (!userId || (userRole !== 'admin' && userRole !== 'super_admin')) {
      showMessage('Admin access required.');
      return;
    }

    setPageLoading(true);
    try {
      const accountRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/bank_accounts`,
        editingBankAccount.id
      );
      await updateDoc(accountRef, {
        bankName: newBankName.trim(),
        bankBranch: newBankBranch.trim() || '',
        accountName: newAccountName.trim(),
        accountNumber: newAccountNumber.trim(),
        routingNumber: newRoutingNumber.trim() || '',
      });

      setEditingBankAccount(null);
      setNewBankName('');
      setNewAccountName('');
      setNewAccountNumber('');
      setNewRoutingNumber('');
      setNewBankBranch('');
      showMessage('✅ Bank account updated successfully!');
    } catch (error) {
      console.error('Error updating bank account:', error);
      setError('❌ Failed to update bank account: ' + error.message);
      showMessage(`Error: ${error.message}`, 5000);
    } finally {
      setPageLoading(false);
    }
  };

  const handleDeleteBankAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) return;

    if (!userId || (userRole !== 'admin' && userRole !== 'super_admin')) {
      showMessage('Admin access required.');
      return;
    }

    setPageLoading(true);
    try {
      const accountRef = doc(db, `artifacts/${appId}/users/${userId}/bank_accounts`, accountId);
      await deleteDoc(accountRef);
      showMessage('✅ Bank account deleted successfully!');
    } catch (error) {
      console.error('Error deleting bank account:', error);
      setError('❌ Failed to delete bank account: ' + error.message);
      showMessage(`Error: ${error.message}`, 5000);
    } finally {
      setPageLoading(false);
    }
  };

  const handleAuth = async (isSignUpMode) => {
    setPageLoading(true);
    setError(null);
    try {
      if (isSignUpMode) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          loginEmail,
          loginPassword
        );
        await setDoc(doc(db, `artifacts/${appId}/users`, userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          role: 'admin',
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
        showMessage('Account created! Awaiting super admin approval.');
      } else {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      }
      setLoginEmail('');
      setLoginPassword('');
    } catch (e) {
      console.error('Auth error:', e);
      setError(`Auth failed: ${e.message}`);
      showMessage(`Auth error: ${e.message}`, 5000);
    } finally {
      setPageLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    setPageLoading(true);
    try {
      await signOut(auth);
      setCurrentPage('dashboard');
      setUserAccountStatus('loading');
      showMessage('Logged out!');
    } catch (e) {
      console.error('Logout error:', e);
      setError('Logout failed.');
    } finally {
      setPageLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!userId || (userRole !== 'admin' && userRole !== 'super_admin')) {
      showMessage('Admin access required to update settings.');
      return;
    }
    setPageLoading(true);
    try {
      const settingsDocRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/settings`,
        'businessProfile'
      );
      await setDoc(settingsDocRef, tempBusinessSettings, { merge: true });
      showMessage('Settings updated successfully!');
    } catch (e) {
      console.error('Error updating settings: ', e);
      setError('Failed to update settings: ' + e.message);
      showMessage('Error updating settings: ' + e.message, 5000);
    } finally {
      setPageLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !currentPassword || !confirmNewPassword) {
      showMessage('All password fields are required.', 3000);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showMessage('New passwords do not match.', 3000);
      return;
    }
    if (newPassword.length < 6) {
      showMessage('New password should be at least 6 characters.', 3000);
      return;
    }
    if (!auth || !auth.currentUser) {
      showMessage('User not authenticated. Please log in again.', 3000);
      return;
    }

    setPageLoading(true);
    setError(null);
    const user = auth.currentUser;

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      showMessage('Password updated successfully!', 3000);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (e) {
      console.error('Password change error: ', e);
      setError(`Password change failed: ${e.message}`);
      showMessage(`Error: ${e.message}`, 5000);
    } finally {
      setPageLoading(false);
    }
  };
  const handleAddBankAccount = async () => {
    // Validate required fields
    if (!newBankName.trim() || !newAccountName.trim() || !newAccountNumber.trim()) {
      showMessage('Please fill in all required fields (*)');
      return;
    }

    // Ensure user has permission
    if (!userId || (userRole !== 'admin' && userRole !== 'super_admin')) {
      showMessage('Admin access required to add bank accounts');
      return;
    }

    setPageLoading(true); // Show loading indicator

    try {
      const bankAccountsRef = collection(db, `artifacts/${appId}/users/${userId}/bank_accounts`);

      await addDoc(bankAccountsRef, {
        bankName: newBankName.trim(),
        bankBranch: newBankBranch.trim() || '',
        accountName: newAccountName.trim(),
        accountNumber: newAccountNumber.trim(),
        routingNumber: newRoutingNumber.trim() || '',
        createdAt: new Date(),
        createdBy: userId,
      });

      // Reset form fields
      setNewBankName('');
      setNewBankBranch('');
      setNewAccountName('');
      setNewAccountNumber('');
      setNewRoutingNumber('');

      showMessage('✅ Bank account added successfully!');
    } catch (error) {
      console.error('Error adding bank account:', error);
      setError('❌ Failed to add bank account: ' + error.message);
      showMessage(`Error: ${error.message}`, 5000);
    } finally {
      setPageLoading(false); // Hide loading indicator
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName || !newCustomerAddress || !newCustomerPhone) {
      showMessage('Fill required fields.');
      return;
    }
    if (!userId || (userRole !== 'admin' && userRole !== 'super_admin')) {
      showMessage('Admin access required.');
      return;
    }
    setPageLoading(true);
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/customers`), {
        name: newCustomerName,
        address: newCustomerAddress,
        phone: newCustomerPhone,
        email: newCustomerEmail,
        createdAt: new Date().toISOString(),
      });
      setNewCustomerName('');
      setNewCustomerAddress('');
      setNewCustomerPhone('');
      setNewCustomerEmail('');
      showMessage('Customer added!');
    } catch (e) {
      console.error('Error adding customer: ', e);
      setError('Failed: ' + e.message);
    } finally {
      setPageLoading(false);
    }
  };
  const handleCancelEditCustomer = () => setEditingCustomer(null);
  const handleUpdateCustomer = async () => {
    if (!editingCustomer.name || !editingCustomer.address || !editingCustomer.phone) {
      showMessage('Fill required fields.');
      return;
    }
    if (!userId) {
      showMessage('User not ready.');
      return;
    }
    setPageLoading(true);
    try {
      const customerRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/customers`,
        editingCustomer.id
      );
      await updateDoc(customerRef, {
        name: editingCustomer.name,
        address: editingCustomer.address,
        phone: editingCustomer.phone,
        email: editingCustomer.email,
      });
      setEditingCustomer(null);
      showMessage('Customer updated!');
    } catch (e) {
      console.error('Error updating customer: ', e);
      setError('Failed: ' + e.message);
    } finally {
      setPageLoading(false);
    }
  };
  const handleDeleteCustomer = async (customerId) => {
    if (!userId || (userRole !== 'admin' && userRole !== 'super_admin')) {
      showMessage('Admin access required.');
      return;
    }
    setPageLoading(true);
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/customers`, customerId));
      showMessage('Customer deleted!');
    } catch (e) {
      console.error('Error deleting customer: ', e);
      setError('Failed to delete customer: ' + e.message);
      showMessage('Error: ' + e.message, 5000);
    } finally {
      setPageLoading(false);
    }
  };
  const getCustomerOrderSummary = useCallback(
    (customerId) => {
      const customerInvoices = invoices.filter((inv) => inv.customerId === customerId);
      let totalOrders = customerInvoices.length,
        totalAmount = 0,
        totalPaidSum = 0,
        totalDue = 0;
      customerInvoices.forEach((inv) => {
        totalAmount += inv.totalAmount || 0;
        totalPaidSum += inv.totalPaid || 0;
        totalDue += inv.finalDue || 0;
      });
      return { totalOrders, totalAmount, totalPaid: totalPaidSum, totalDue };
    },
    [invoices]
  );

  const handleAddProduct = async () => {
    if (!newProductGSM || !newProductUnitPrice || isNaN(parseFloat(newProductUnitPrice))) {
      showMessage('Valid GSM and Price needed.');
      return;
    }
    if (!userId || (userRole !== 'admin' && userRole !== 'super_admin')) {
      showMessage('Admin access required.');
      return;
    }
    setPageLoading(true);
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/products`), {
        gsm: newProductGSM,
        type: newProductType,
        unitPrice: parseFloat(newProductUnitPrice),
        createdAt: new Date().toISOString(),
      });
      setNewProductGSM('');
      setNewProductType('sheet');
      setNewProductUnitPrice('');
      showMessage('Product added!');
    } catch (e) {
      console.error('Error adding product: ', e);
      setError('Failed: ' + e.message);
    } finally {
      setPageLoading(false);
    }
  };
  const handleEditProduct = (product) => setEditingProduct({ ...product });
  const handleCancelEditProduct = () => setEditingProduct(null);
  const handleUpdateProduct = async () => {
    if (
      !editingProduct.gsm ||
      !editingProduct.unitPrice ||
      isNaN(parseFloat(editingProduct.unitPrice))
    ) {
      showMessage('Valid GSM and Price needed.');
      return;
    }
    if (!userId) {
      showMessage('User not ready.');
      return;
    }
    setPageLoading(true);
    try {
      const productRef = doc(db, `artifacts/${appId}/users/${userId}/products`, editingProduct.id);
      await updateDoc(productRef, {
        gsm: editingProduct.gsm,
        type: editingProduct.type,
        unitPrice: parseFloat(editingProduct.unitPrice),
      });
      setEditingProduct(null);
      showMessage('Product updated!');
    } catch (e) {
      console.error('Error updating product: ', e);
      setError('Failed: ' + e.message);
    } finally {
      setPageLoading(false);
    }
  };
  const handleDeleteProduct = async (productId) => {
    if (!userId || (userRole !== 'admin' && userRole !== 'super_admin')) {
      showMessage('Admin access required.');
      return;
    }
    setPageLoading(true);
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/products`, productId));
      showMessage('Product deleted!');
    } catch (e) {
      console.error('Error deleting product: ', e);
      setError('Failed to delete product: ' + e.message);
      showMessage('Error: ' + e.message, 5000);
    } finally {
      setPageLoading(false);
    }
  };
  const handleProductChangeLogic = (prevProducts, id, field, value) => {
    return prevProducts.map((item) => {
      if (item.id === id) {
        let updatedItem = { ...item, [field]: value };
        if (field === 'productId') {
          const product = products.find((p) => p.id === value);
          if (product) {
            updatedItem = {
              ...updatedItem,
              gsm: product.gsm,
              type: product.type,
              unitPrice: product.unitPrice,
              quantity: '',
              length: product.type === 'sheet' ? '' : '-',
              width: product.type === 'sheet' ? '' : '-',
              squareMeters: 0,
            };
          }
        } else if (field === 'unitPrice') {
          updatedItem.unitPrice = parseFloat(value) || 0;
        }

        let lineTotal = 0,
          squareMeters = 0;
        const qty = parseFloat(updatedItem.quantity);
        const currentUnitPrice = parseFloat(updatedItem.unitPrice);
        const len = parseFloat(updatedItem.length);
        const wid = parseFloat(updatedItem.width);

        if (!isNaN(qty) && !isNaN(currentUnitPrice)) {
          if (updatedItem.type === 'sheet' && !isNaN(len) && !isNaN(wid)) {
            squareMeters = len * wid;
            lineTotal = qty * squareMeters * currentUnitPrice;
          } else if (updatedItem.type === 'bag') {
            lineTotal = qty * currentUnitPrice;
            squareMeters = 0;
          }
        }
        updatedItem.lineTotal = lineTotal;
        updatedItem.squareMeters = squareMeters;
        return updatedItem;
      }
      return item;
    });
  };
  const addInvoiceProductRow = () =>
    setInvoiceProducts([
      ...invoiceProducts,
      {
        id: generateUniqueId(),
        productId: '',
        gsm: '',
        type: '',
        quantity: '',
        length: '',
        width: '',
        unitPrice: '',
        lineTotal: 0,
        squareMeters: 0,
      },
    ]);
  const removeInvoiceProductRow = (id) =>
    setInvoiceProducts(invoiceProducts.filter((item) => item.id !== id));
  const handleInvoiceProductChange = (id, field, value) =>
    setInvoiceProducts((prev) => handleProductChangeLogic(prev, id, field, value));

  const calculateInvoiceTotals = () =>
    calculateInvoiceTotalsUtil({
      invoiceProducts,
      taxRate: businessSettings.taxRate,
      totalPaid,
      salespersons,
      selectedSalespersonId: selectedInvoiceSalesperson,
    });

  const handleGenerateInvoice = async () => {
    if (!selectedCustomer) {
      showMessage('Please select a customer.');
      return;
    }
    if (
      invoiceProducts.length === 0 ||
      invoiceProducts.some(
        (p) => !p.productId || !p.quantity || (p.type === 'sheet' && (!p.length || !p.width))
      )
    ) {
      showMessage('Please fill in all product details.');
      return;
    }
    if (!db || !userId || (userRole !== 'admin' && userRole !== 'super_admin')) {
      showMessage('Admin access required.');
      return;
    }

    setPageLoading(true);
    try {
      const customer = customers.find((c) => c.id === selectedCustomer);
      if (!customer) {
        showMessage('Customer not found.');
        setPageLoading(false);
        return;
      }

      const {
        subTotal,
        taxAmount,
        totalWithTax,
        paidAmount,
        finalDue,
        totalSquareMeters,
        commissionAmount,
      } = calculateInvoiceTotals();
      const salesperson = salespersons.find((s) => s.id === selectedInvoiceSalesperson);

      const invoiceData = {
        invoiceNumber: `BTTAL-INV-${Date.now()}`,
        invoiceDate: new Date().toISOString(),
        customerId: customer.id,
        customerName: customer.name,
        customerAddress: customer.address,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        products: invoiceProducts.map((p) => ({
          productId: p.productId,
          gsm: p.gsm,
          type: p.type,
          quantity: parseFloat(p.quantity) || 0,
          length: p.type === 'sheet' ? parseFloat(p.length) : null,
          width: p.type === 'sheet' ? parseFloat(p.width) : null,
          squareMeters: p.type === 'sheet' ? p.squareMeters : null,
          unitPrice: parseFloat(p.unitPrice) || 0,
          lineTotal: p.lineTotal || 0,
          pricePerUnit: parseFloat(p.unitPrice) || 0,
          amount: p.lineTotal || 0,
        })),
        subTotal,
        taxRate: businessSettings.taxRate,
        taxAmount,
        totalAmount: totalWithTax,
        totalPaid: paidAmount,
        finalDue,
        totalSquareMeters,
        salespersonId: selectedInvoiceSalesperson || null,
        salespersonName: salesperson ? salesperson.name : null,
        commissionAmount: commissionAmount || 0,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/invoices`), invoiceData);
      showMessage('Invoice saved! Generating PDF...');

      generatePrintableInvoice(invoiceData);
      setSelectedCustomer('');
      setInvoiceProducts([]);
      setTotalPaid('');
      setSelectedInvoiceSalesperson('');
    } catch (e) {
      console.error('Invoice generation error: ', e);
      setError('Invoice generation failed: ' + e.message);
      showMessage('Error: ' + e.message, 5000);
    } finally {
      setPageLoading(false);
    }
  };
  const handleEditInvoice = (invoice) => {
    setEditingInvoice({ ...invoice });
    setNewPaymentAmount('');
  };
  const handleCancelEditInvoice = () => {
    setEditingInvoice(null);
    setNewPaymentAmount('');
  };
  const handleUpdateInvoice = async () => {
    if (!userId || !editingInvoice) {
      showMessage('Invoice not ready.');
      return;
    }
    setPageLoading(true);
    try {
      const invoiceRef = doc(db, `artifacts/${appId}/users/${userId}/invoices`, editingInvoice.id);
      const paymentToAdd = parseFloat(newPaymentAmount) || 0;
      const updatedTotalPaid = (editingInvoice.totalPaid || 0) + paymentToAdd;
      const updatedFinalDue = editingInvoice.totalAmount - updatedTotalPaid;
      await updateDoc(invoiceRef, { totalPaid: updatedTotalPaid, finalDue: updatedFinalDue });
      setEditingInvoice(null);
      setNewPaymentAmount('');
      showMessage('Invoice payment updated!');
    } catch (e) {
      console.error('Error updating invoice: ', e);
      setError('Failed: ' + e.message);
    } finally {
      setPageLoading(false);
    }
  };

  const generatePrintableInvoice = (invoice) =>
    generatePrintableInvoiceUtil(invoice, businessSettings, bankAccounts);

  const handleAddSalesperson = async () => {
    if (!newSalespersonName) {
      showMessage('Salesperson name is required.');
      return;
    }
    let commissionPayload = {};
    if (newSalespersonCommissionType === 'percentage') {
      const rate = parseFloat(newSalespersonPercentageRate);
      if (isNaN(rate) || rate < 0) {
        showMessage('Valid percentage rate is required.');
        return;
      }
      commissionPayload = { type: 'percentage', percentageRate: rate };
    } else if (newSalespersonCommissionType === 'fixed') {
      const sheetRate = parseFloat(newSalespersonFixedSheetRate);
      const bagRate = parseFloat(newSalespersonFixedBagRate);

      let validFixedRateProvided = false;
      if (newSalespersonFixedSheetRate !== '' && !isNaN(sheetRate) && sheetRate >= 0)
        validFixedRateProvided = true;
      if (newSalespersonFixedBagRate !== '' && !isNaN(bagRate) && bagRate >= 0)
        validFixedRateProvided = true;

      if (
        !validFixedRateProvided &&
        (newSalespersonFixedSheetRate !== '' || newSalespersonFixedBagRate !== '')
      ) {
        showMessage(
          'At least one valid non-negative fixed rate (sheet or bag) is required if providing fixed rates.'
        );
        return;
      }
      commissionPayload = {
        type: 'fixed',
        fixedSheetRate:
          newSalespersonFixedSheetRate !== '' && !isNaN(sheetRate) && sheetRate >= 0
            ? sheetRate
            : null,
        fixedBagRate:
          newSalespersonFixedBagRate !== '' && !isNaN(bagRate) && bagRate >= 0 ? bagRate : null,
      };
      if (commissionPayload.fixedSheetRate === null && commissionPayload.fixedBagRate === null) {
        // Both can't be null if type is fixed
        showMessage(
          'For fixed commission, at least one rate (sheet or bag) must be provided and be a valid number.'
        );
        return;
      }
    } else {
      showMessage('Invalid commission type.');
      return;
    }

    if (!userId || (userRole !== 'admin' && userRole !== 'super_admin')) {
      showMessage('Admin access required.');
      return;
    }
    setPageLoading(true);
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/salespersons`), {
        name: newSalespersonName,
        commission: commissionPayload,
        createdAt: new Date().toISOString(),
      });
      setNewSalespersonName('');
      setNewSalespersonCommissionType('percentage');
      setNewSalespersonPercentageRate('');
      setNewSalespersonFixedSheetRate('');
      setNewSalespersonFixedBagRate('');
      showMessage('Salesperson added successfully!');
    } catch (e) {
      console.error('Error adding salesperson: ', e);
      setError('Failed to add salesperson: ' + e.message);
    } finally {
      setPageLoading(false);
    }
  };
  const handleDeleteSalesperson = async (salespersonId) => {
    if (!userId || (userRole !== 'admin' && userRole !== 'super_admin')) {
      showMessage('Admin access required.');
      return;
    }
    setPageLoading(true);
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/salespersons`, salespersonId));
      showMessage('Salesperson deleted!');
    } catch (e) {
      console.error('Error deleting salesperson: ', e);
      setError('Failed to delete salesperson: ' + e.message);
      showMessage('Error: ' + e.message, 5000);
    } finally {
      setPageLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!userId || (userRole !== 'admin' && userRole !== 'super_admin')) {
      showMessage('Admin access required.');
      return;
    }
    setPageLoading(true);
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/invoices`, invoiceId));
      showMessage('Invoice deleted!');
    } catch (e) {
      console.error('Error deleting invoice: ', e);
      setError('Failed to delete invoice: ' + e.message);
      showMessage('Error: ' + e.message, 5000);
    } finally {
      setPageLoading(false);
    }
  };
  const handleUpdateUserStatusAndRole = async (targetUserIdToUpdate, newStatus, newRole) => {
    if (!userId || userRole !== 'super_admin') {
      showMessage('Super Admin access required.');
      return;
    }
    if (!targetUserIdToUpdate || !newStatus || !newRole) {
      showMessage('Missing user ID, status, or role for update.');
      return;
    }
    setPageLoading(true);
    try {
      const userDocRef = doc(db, `artifacts/${appId}/users`, targetUserIdToUpdate);
      await updateDoc(userDocRef, {
        status: newStatus,
        role: newRole,
      });
      showMessage(`User status updated to ${newStatus} and role to ${newRole}.`);
    } catch (e) {
      console.error('Error updating user status/role: ', e);
      setError('Failed to update user: ' + e.message);
      showMessage('Error: ' + e.message, 5000);
    } finally {
      setPageLoading(false);
    }
  };

  // Reports moved to components

  // --- Page Rendering Functions ---
  // Dashboard moved to component
  const handleCancelEdit = () => {
    // Reset the editing state
    setEditingBankAccount(null);

    // Clear all form fields
    setNewBankName('');
    setNewAccountName('');
    setNewAccountNumber('');
    setNewRoutingNumber('');
    setNewBankBranch('');
  };
  // Bank Accounts page moved to component
  // Customers page moved to component
  // Products page moved to component

  // Create Invoice page moved to component
  // Invoices list page moved to component
  // Salespersons page moved to component
  // Settings moved to component
  // User management moved to component

  // --- Main Application Render Logic ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">Initializing BTTAL App...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    // Login Screen
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
            {isLoginView ? 'Login to ' : 'Sign Up for '}{' '}
            <span className="text-indigo-600">{businessSettings.name || 'BTTAL'}</span>
          </h2>
          {error && (
            <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-4 text-center">
              {error}
            </p>
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md mb-6 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={() => handleAuth(!isLoginView)}
            className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 font-semibold transition-colors duration-300"
            disabled={pageLoading}
          >
            {pageLoading ? 'Processing...' : isLoginView ? 'Login' : 'Sign Up'}
          </button>
          <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            {isLoginView ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setIsLoginView(!isLoginView);
                setError(null);
              }}
              className="text-indigo-600 hover:text-indigo-500 dark:hover:text-indigo-400 font-semibold"
            >
              {isLoginView ? 'Sign Up Here' : 'Login Here'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Conditional rendering for pending/rejected accounts
  if (userAccountStatus === 'pending' && userRole === 'pending_viewer') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Account Pending Approval
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your account has been created and is awaiting approval from an administrator. Please
            check back later.
          </p>
          <button
            onClick={handleLogout}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }
  if (userAccountStatus === 'rejected' && userRole === 'pending_viewer') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Account Rejected
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your account registration has been rejected. Please contact support for more
            information.
          </p>
          <button
            onClick={handleLogout}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', page: 'dashboard', icon: <HomeIcon />, roles: ['admin', 'super_admin'] },
    { name: 'Customers', page: 'customers', icon: <UsersIcon />, roles: ['admin', 'super_admin'] },
    { name: 'Products', page: 'products', icon: <PackageIcon />, roles: ['admin', 'super_admin'] },
    {
      name: 'Create Invoice',
      page: 'createInvoice',
      icon: <DocumentPlusIcon />,
      roles: ['admin', 'super_admin'],
    },
    {
      name: 'All Invoices',
      page: 'invoices',
      icon: <DocumentTextIcon />,
      roles: ['admin', 'super_admin'],
    },
    {
      name: 'Salespersons',
      page: 'salespersons',
      icon: <UserGroupIcon />,
      roles: ['admin', 'super_admin'],
    },
    {
      name: 'Bank Details',
      page: 'bankAccounts',
      icon: <BankIcon />,
      roles: ['admin', 'super_admin'],
    },
    { name: 'Reports', page: 'reports', icon: <ChartBarIcon />, roles: ['admin', 'super_admin'] },
    {
      name: 'User Management',
      page: 'userManagement',
      icon: <UserGroupIcon />,
      roles: ['super_admin'],
    },
    { name: 'Settings', page: 'settings', icon: <CogIcon />, roles: ['admin', 'super_admin'] },
  ];

  const availableNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className={`flex h-screen font-sans antialiased ${darkMode ? 'dark' : ''}`}>
      <style>{` @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'); body { font-family: 'Inter', sans-serif; } .sidebar-transition { transition: width 0.2s ease-in-out; } ::-webkit-scrollbar { width: 8px; height: 8px; } ::-webkit-scrollbar-thumb { background: ${darkMode ? '#4B5563' : '#A0AEC0'}; border-radius: 4px; } ::-webkit-scrollbar-track { background: ${darkMode ? '#1F2937' : '#E2E8F0'}; } `}</style>

      <Toast message={message} isVisible={isMessageVisible} />

      <Sidebar
        availableNavItems={availableNavItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        userEmail={userEmail}
        userRole={userRole}
        handleLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900">
        <Header toggleSidebar={toggleSidebar} currentPage={currentPage} />

        {pageLoading && userId && (
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
            <p className="ml-4 text-lg text-gray-600 dark:text-gray-300">Loading page data...</p>
          </div>
        )}

        {error && userId && !pageLoading && (
          <div
            className="p-4 m-4 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md relative shadow-md"
            role="alert"
          >
            <div className="flex">
              <div className="py-1">
                <svg
                  className="fill-current h-6 w-6 text-red-500 dark:text-red-400 mr-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Application Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500"
            >
              <svg
                className="fill-current h-6 w-6"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </button>
          </div>
        )}

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          {console.log(
            '[Render Main] Page:',
            currentPage,
            'PageLoading:',
            pageLoading,
            'UserID:',
            userId,
            'Error:',
            error
          )}
          {userId && !pageLoading && !error && userAccountStatus === 'approved' && (
            <>
              {currentPage === 'dashboard' && (
                <Dashboard
                  customers={customers}
                  products={products}
                  invoices={invoices}
                  salespersons={salespersons}
                />
              )}
              {currentPage === 'customers' &&
                (userRole === 'admin' || userRole === 'super_admin') && (
                  <Customers
                    customers={customers}
                    newCustomerName={newCustomerName}
                    setNewCustomerName={setNewCustomerName}
                    newCustomerAddress={newCustomerAddress}
                    setNewCustomerAddress={setNewCustomerAddress}
                    newCustomerPhone={newCustomerPhone}
                    setNewCustomerPhone={setNewCustomerPhone}
                    newCustomerEmail={newCustomerEmail}
                    setNewCustomerEmail={setNewCustomerEmail}
                    handleAddCustomer={handleAddCustomer}
                    customerSearchQuery={customerSearchQuery}
                    setCustomerSearchQuery={setCustomerSearchQuery}
                    currentCustomerPage={currentCustomerPage}
                    setCurrentCustomerPage={setCurrentCustomerPage}
                    itemsPerPage={itemsPerPage}
                    getCustomerOrderSummary={getCustomerOrderSummary}
                    editingCustomer={editingCustomer}
                    setEditingCustomer={setEditingCustomer}
                    handleUpdateCustomer={handleUpdateCustomer}
                    handleCancelEditCustomer={handleCancelEditCustomer}
                    handleDeleteCustomer={handleDeleteCustomer}
                    pageLoading={pageLoading}
                    userRole={userRole}
                  />
                )}
              {currentPage === 'products' &&
                (userRole === 'admin' || userRole === 'super_admin') && (
                  <Products
                    products={products}
                    newProductGSM={newProductGSM}
                    setNewProductGSM={setNewProductGSM}
                    newProductType={newProductType}
                    setNewProductType={setNewProductType}
                    newProductUnitPrice={newProductUnitPrice}
                    setNewProductUnitPrice={setNewProductUnitPrice}
                    handleAddProduct={handleAddProduct}
                    pageLoading={pageLoading}
                    userRole={userRole}
                    editingProduct={editingProduct}
                    setEditingProduct={setEditingProduct}
                    handleUpdateProduct={handleUpdateProduct}
                    handleCancelEditProduct={handleCancelEditProduct}
                    handleDeleteProduct={handleDeleteProduct}
                    handleEditProduct={handleEditProduct}
                    currentProductPage={currentProductPage}
                    setCurrentProductPage={setCurrentProductPage}
                    itemsPerPage={itemsPerPage}
                  />
                )}
              {currentPage === 'createInvoice' &&
                (userRole === 'admin' || userRole === 'super_admin') && (
                  <CreateInvoice
                    customers={customers}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={setSelectedCustomer}
                    salespersons={salespersons}
                    selectedInvoiceSalesperson={selectedInvoiceSalesperson}
                    setSelectedInvoiceSalesperson={setSelectedInvoiceSalesperson}
                    products={products}
                    invoiceProducts={invoiceProducts}
                    handleInvoiceProductChange={handleInvoiceProductChange}
                    removeInvoiceProductRow={removeInvoiceProductRow}
                    addInvoiceProductRow={addInvoiceProductRow}
                    businessSettings={businessSettings}
                    totalPaid={totalPaid}
                    setTotalPaid={setTotalPaid}
                    calculateInvoiceTotals={calculateInvoiceTotals}
                    handleGenerateInvoice={handleGenerateInvoice}
                    generatePrintableInvoice={generatePrintableInvoice}
                    showMessage={showMessage}
                    pageLoading={pageLoading}
                    userRole={userRole}
                  />
                )}
              {currentPage === 'invoices' &&
                (userRole === 'admin' || userRole === 'super_admin') && (
                  <InvoicesList
                    invoices={invoices}
                    invoiceSearchQuery={invoiceSearchQuery}
                    setInvoiceSearchQuery={setInvoiceSearchQuery}
                    invoiceStartDateFilter={invoiceStartDateFilter}
                    setInvoiceStartDateFilter={setInvoiceStartDateFilter}
                    invoiceEndDateFilter={invoiceEndDateFilter}
                    setInvoiceEndDateFilter={setInvoiceEndDateFilter}
                    currentInvoicePage={currentInvoicePage}
                    setCurrentInvoicePage={setCurrentInvoicePage}
                    itemsPerPage={itemsPerPage}
                    editingInvoice={editingInvoice}
                    newPaymentAmount={newPaymentAmount}
                    setNewPaymentAmount={setNewPaymentAmount}
                    handleUpdateInvoice={handleUpdateInvoice}
                    handleCancelEditInvoice={handleCancelEditInvoice}
                    handleEditInvoice={handleEditInvoice}
                    handleDeleteInvoice={handleDeleteInvoice}
                    generatePrintableInvoice={generatePrintableInvoice}
                    userRole={userRole}
                    pageLoading={pageLoading}
                  />
                )}
              {currentPage === 'salespersons' &&
                (userRole === 'admin' || userRole === 'super_admin') && (
                  <Salespersons
                    salespersons={salespersons}
                    newSalespersonName={newSalespersonName}
                    setNewSalespersonName={setNewSalespersonName}
                    newSalespersonCommissionType={newSalespersonCommissionType}
                    setNewSalespersonCommissionType={setNewSalespersonCommissionType}
                    newSalespersonPercentageRate={newSalespersonPercentageRate}
                    setNewSalespersonPercentageRate={setNewSalespersonPercentageRate}
                    newSalespersonFixedSheetRate={newSalespersonFixedSheetRate}
                    setNewSalespersonFixedSheetRate={setNewSalespersonFixedSheetRate}
                    newSalespersonFixedBagRate={newSalespersonFixedBagRate}
                    setNewSalespersonFixedBagRate={setNewSalespersonFixedBagRate}
                    handleAddSalesperson={handleAddSalesperson}
                    handleDeleteSalesperson={handleDeleteSalesperson}
                    pageLoading={pageLoading}
                    userRole={userRole}
                    currentSalespersonPage={currentSalespersonPage}
                    setCurrentSalespersonPage={setCurrentSalespersonPage}
                    itemsPerPage={itemsPerPage}
                  />
                )}
              {currentPage === 'bankAccounts' &&
                (userRole === 'admin' || userRole === 'super_admin') && (
                  <BankAccounts
                    bankAccounts={bankAccounts}
                    newBankName={newBankName}
                    setNewBankName={setNewBankName}
                    newAccountName={newAccountName}
                    setNewAccountName={setNewAccountName}
                    newAccountNumber={newAccountNumber}
                    setNewAccountNumber={setNewAccountNumber}
                    newRoutingNumber={newRoutingNumber}
                    setNewRoutingNumber={setNewRoutingNumber}
                    newBankBranch={newBankBranch}
                    setNewBankBranch={setNewBankBranch}
                    editingBankAccount={editingBankAccount}
                    handleEditBankAccount={handleEditBankAccount}
                    handleUpdateBankAccount={handleUpdateBankAccount}
                    handleAddBankAccount={handleAddBankAccount}
                    handleDeleteBankAccount={handleDeleteBankAccount}
                    handleCancelEdit={handleCancelEdit}
                    bankAccountSearchQuery={bankAccountSearchQuery}
                    setBankAccountSearchQuery={setBankAccountSearchQuery}
                    itemsPerPage={itemsPerPage}
                    currentBankAccountsPage={currentBankAccountsPage}
                    setCurrentBankAccountsPage={setCurrentBankAccountsPage}
                    pageLoading={pageLoading}
                    userRole={userRole}
                  />
                )}
              {currentPage === 'reports' &&
                (userRole === 'admin' || userRole === 'super_admin') && (
                  <Reports invoices={invoices} />
                )}
              {currentPage === 'settings' &&
                (userRole === 'admin' || userRole === 'super_admin') && (
                  <Settings
                    tempBusinessSettings={tempBusinessSettings}
                    setTempBusinessSettings={setTempBusinessSettings}
                    handleUpdateSettings={handleUpdateSettings}
                    userRole={userRole}
                    pageLoading={pageLoading}
                    bankAccounts={bankAccounts}
                    currentPassword={currentPassword}
                    setCurrentPassword={setCurrentPassword}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    confirmNewPassword={confirmNewPassword}
                    setConfirmNewPassword={setConfirmNewPassword}
                    handleChangePassword={handleChangePassword}
                  />
                )}
              {currentPage === 'userManagement' && userRole === 'super_admin' && (
                <UserManagement
                  allUsers={allUsers}
                  currentUserManagementPage={currentUserManagementPage}
                  setCurrentUserManagementPage={setCurrentUserManagementPage}
                  itemsPerPage={itemsPerPage}
                  userRole={userRole}
                  handleUpdateUserStatusAndRole={handleUpdateUserStatusAndRole}
                />
              )}
            </>
          )}
        </main>
        <footer className="p-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700">
          Software built by ABRAR HASAN CHOWDHURY
        </footer>
      </div>
    </div>
  );
}

export default App;
