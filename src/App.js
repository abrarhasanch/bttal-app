import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword 
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  runTransaction,
  setDoc,
  getDoc 
} from 'firebase/firestore';

// Recharts imports for charting
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Helper for generating unique IDs (simple, for client-side)
const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// --- Icon Imports (SVG placeholders - consider replacing with a proper icon library like Heroicons or Font Awesome) ---
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);
// Simplified Icon Components (just the emoji for now)
const HomeIcon = () => <>🏠</>;
const UsersIcon = () => <>👥</>; 
const PackageIcon = () => <>📦</>;
const DocumentPlusIcon = () => <>📝</>;
const DocumentTextIcon = () => <>🧾</>;
const PlusCircleIcon = () => <>➕</>;
const ClipboardDocumentListIcon = () => <>🗒️</>;
const UserGroupIcon = () => <>🧑‍💼</>; 
const ChartBarIcon = () => <>📊</>;
const CogIcon = () => <>⚙️</>;
const SunIcon = () => <>☀️</>;
const MoonIcon = () => <>🌙</>;
const ArrowLeftOnRectangleIcon = () => <>🚪</>;


function App() {
  // --- Firebase Core States ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
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
    lowStockThreshold: 5,
  });
  const [tempBusinessSettings, setTempBusinessSettings] = useState(businessSettings);

  // --- Password Change States ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');


  // --- User Management State (for Admin) ---
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
  const [newProductStock, setNewProductStock] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  const [invoices, setInvoices] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [invoiceProducts, setInvoiceProducts] = useState([]);
  const [totalPaid, setTotalPaid] = useState('');
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [selectedOrderIdForInvoice, setSelectedOrderIdForInvoice] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [invoiceStartDateFilter, setInvoiceStartDateFilter] = useState('');
  const [invoiceEndDateFilter, setInvoiceEndDateFilter] = useState('');

  const [orders, setOrders] = useState([]);
  const [selectedOrderCustomer, setSelectedOrderCustomer] = useState('');
  const [selectedOrderTaker, setSelectedOrderTaker] = useState('');
  const [orderProducts, setOrderProducts] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderStartDateFilter, setOrderStartDateFilter] = useState('');
  const [orderEndDateFilter, setOrderEndDateFilter] = useState('');

  const [salespersons, setSalespersons] = useState([]);
  const [newSalespersonName, setNewSalespersonName] = useState('');
  const [newSalespersonCommissionType, setNewSalespersonCommissionType] = useState('percentage'); 
  const [newSalespersonPercentageRate, setNewSalespersonPercentageRate] = useState(''); 
  const [newSalespersonFixedSheetRate, setNewSalespersonFixedSheetRate] = useState(''); 
  const [newSalespersonFixedBagRate, setNewSalespersonFixedBagRate] = useState(''); 
  const [editingSalesperson, setEditingSalesperson] = useState(null); 

  // --- Pagination States ---
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentCustomerPage, setCurrentCustomerPage] = useState(1);
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [currentInvoicePage, setCurrentInvoicePage] = useState(1);
  const [currentOrderPage, setCurrentOrderPage] = useState(1);
  const [currentSalespersonPage, setCurrentSalespersonPage] = useState(1);
  const [currentUserManagementPage, setCurrentUserManagementPage] = useState(1);


  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [message, setMessage] = useState('');
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const showMessage = (msg, duration = 3000) => {
    setMessage(msg); setIsMessageVisible(true);
    setTimeout(() => { setIsMessageVisible(false); setMessage(''); }, duration);
  };

  useEffect(() => {
    if (darkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('darkMode', 'true'); }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('darkMode', 'false'); }
  }, [darkMode]);

  useEffect(() => {
    const firebaseConfig = {
      apiKey: "AIzaSyDSBkaERxrvKBhH8NiVdVJ5GOtKNIT3AyQ",
      authDomain: "bttal-project.firebaseapp.com",
      projectId: "bttal-project",
      storageBucket: "bttal-project.appspot.com", // Corrected domain
      messagingSenderId: "564894255609",
      appId: "1:564894255609:web:31c4f5429495bcbb0e9528",
      measurementId: "G-GKVXXZ059D"
    };
    const appId = firebaseConfig.appId;

    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authInstance = getAuth(app);
      setDb(firestore);
      setAuth(authInstance);

      const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
        console.log("[Auth State Change] User:", user ? user.uid : "No User");
        if (user) {
          setUserId(user.uid);
          setUserEmail(user.email || 'Anonymous User');
          const userDocRef = doc(firestore, `artifacts/${appId}/users`, user.uid);
          const userDocSnap = await getDoc(userDocRef); 

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserAccountStatus(userData.status || 'pending'); 
            if (userData.status === 'approved') {
              setUserRole(userData.role || 'viewer'); 
              console.log("[Auth State Change] User approved. Role:", userData.role || 'viewer');
            } else {
              setUserRole('pending_viewer'); 
              console.log("[Auth State Change] User status:", userData.status || 'pending');
            }
          } else {
            console.log("[Auth State Change] User document not found in Firestore for UID:", user.uid, "This might be a new sign-up before doc creation or an anomaly.");
            setUserAccountStatus('pending'); 
            setUserRole('pending_viewer');
          }
        } else {
          setUserId(null); setUserEmail(null); setUserRole('viewer'); setUserAccountStatus('loading');
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (initError) {
      console.error("Firebase Initialization Error:", initError);
      setError("Failed to initialize Firebase. Check API key and config.");
      setLoading(false);
    }
  }, []);

  const collectionsToListen = [
      { name: 'customers', setter: setCustomers, adminOnly: false, customerSpecific: true, customerIdField: 'customerId' },
      { name: 'products', setter: setProducts, adminOnly: false }, 
      { name: 'invoices', setter: setInvoices, adminOnly: false, customerSpecific: true, customerIdField: 'customerId' },
      { name: 'orders', setter: setOrders, adminOnly: false, customerSpecific: true, customerIdField: 'customerId' },
      { name: 'salespersons', setter: setSalespersons, adminOnly: true },
      { name: 'users', setter: setAllUsers, adminOnly: true } 
  ];

  useEffect(() => {
    if (!db || !userId || (userAccountStatus !== 'approved' && userRole !== 'admin' )) {
      setCustomers([]); setProducts([]); setInvoices([]); setOrders([]);
      setSalespersons([]); setAllUsers([]);
      const defaultSettings = { name: 'BTTAL', officeAddress: 'Office Address', factoryAddress: 'Factory Address', phone: 'Business Phone', email: 'Business Email', logoUrl: 'https://i.ibb.co/6R5f5tDh/49f94a12-6614-4dcb-a91e-cc1d4a232256.png', taxRate: 0, lowStockThreshold: 5 };
      setBusinessSettings(defaultSettings);
      setTempBusinessSettings(defaultSettings); 
      if (pageLoading && userAccountStatus !== 'loading') setPageLoading(false); 
      return;
    }

    console.log("[Data Fetch Effect] Initiating for UserID:", userId, "Role:", userRole, "Status:", userAccountStatus);
    setPageLoading(true);
    setError(null); 

    const dataSources = [ ...collectionsToListen.filter(c => userRole === 'admin' || !c.adminOnly).map(c => c.name), 'settings' ];
    const initialLoadStatus = Object.fromEntries(dataSources.map(name => [name, false]));
    let allInitialLoadsDone = false;

    const checkAllInitialLoads = (sourceName) => {
        if (allInitialLoadsDone) return;
        initialLoadStatus[sourceName] = true;
        if (Object.values(initialLoadStatus).every(status => status === true)) {
            setPageLoading(false);
            allInitialLoadsDone = true;
        }
    };

    const unsubscribes = collectionsToListen.map(colInfo => {
      if (colInfo.adminOnly && userRole !== 'admin') return null; 

      let q;
      const basePath = `artifacts/${db.app.options.appId}`;

      if (colInfo.name === 'users' && userRole === 'admin') {
        q = query(collection(db, `${basePath}/users`)); 
      } else if (colInfo.customerSpecific && userRole === 'customer') {
        if (colInfo.name === 'orders' || colInfo.name === 'invoices') {
            q = query(collection(db, `${basePath}/users/${userId}/${colInfo.name}`));
        } else {
            q = query(collection(db, `${basePath}/users/${userId}/${colInfo.name}`));
        }
      } else { 
        q = query(collection(db, `${basePath}/users/${userId}/${colInfo.name}`));
      }
      
      if (!q) { 
        if (!initialLoadStatus[colInfo.name]) checkAllInitialLoads(colInfo.name);
        return null;
      }

      return onSnapshot(q, (snapshot) => {
        const fetchedData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        colInfo.setter(fetchedData);
        if (!initialLoadStatus[colInfo.name]) checkAllInitialLoads(colInfo.name);
      }, (err) => {
        console.error(`[Data Error] Fetching ${colInfo.name}:`, err);
        setError(prev => `${prev || ''}Load failed for ${colInfo.name}. `);
        if (!initialLoadStatus[colInfo.name]) checkAllInitialLoads(colInfo.name); 
      });
    }).filter(unsub => unsub !== null); 

    const settingsDocRef = doc(db, `artifacts/${db.app.options.appId}/users/${userId}/settings/businessProfile`);
    const unsubscribeSettings = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const fetchedSettings = { id: docSnap.id, ...docSnap.data() };
        setBusinessSettings(fetchedSettings);
      } else {
        console.log("[Data Fetch Effect] Settings doc not found, creating with defaults.");
        const defaultSettings = { name: 'BTTAL', officeAddress: 'Office Address', factoryAddress: 'Factory Address', phone: 'Business Phone', email: 'Business Email', logoUrl: 'https://i.ibb.co/6R5f5tDh/49f94a12-6614-4dcb-a91e-cc1d4a232256.png', taxRate: 0, lowStockThreshold: 5 };
        setDoc(settingsDocRef, defaultSettings).catch(err => console.error("Error creating default settings:", err));
        setBusinessSettings(defaultSettings);
      }
      if (!initialLoadStatus['settings']) checkAllInitialLoads('settings');
    }, (err) => {
      console.error("[Data Error] Fetching settings:", err);
      setError(prev => `${prev || ''}Load failed for settings. `);
      if (!initialLoadStatus['settings']) checkAllInitialLoads('settings'); 
    });
    unsubscribes.push(unsubscribeSettings);
    
    const safetyTimeout = setTimeout(() => {
        if (!allInitialLoadsDone && pageLoading) {
            console.warn("[Data Fetch Effect] Safety timeout (8s) triggered. Forcing pageLoading to false.");
            setPageLoading(false);
            allInitialLoadsDone = true;
            if (!error) setError(prev => `${prev || ''}Data loading timed out. Some parts may be missing. Please refresh.`);
        }
    }, 8000);

    return () => {
      console.log("[Data Fetch Effect] Cleanup. Detaching listeners.");
      unsubscribes.forEach(unsub => { if (typeof unsub === 'function') unsub(); });
      clearTimeout(safetyTimeout);
    };
  }, [db, userId, userRole, userAccountStatus]); 

  useEffect(() => {
    setTempBusinessSettings(businessSettings);
  }, [businessSettings]);


  const handleAuth = async (isSignUpMode) => {
    setPageLoading(true); setError(null);
    try {
      if (isSignUpMode) {
        const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        await setDoc(doc(db, `artifacts/${auth.app.options.appId}/users`, userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          role: 'pending_approval', 
          status: 'pending',       
          createdAt: new Date().toISOString()
        });
        showMessage('Account created! Awaiting admin approval.');
      } else { 
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      }
      setLoginEmail(''); setLoginPassword('');
    } catch (e) { 
      console.error("Auth error:", e); 
      setError(`Auth failed: ${e.message}`);
      showMessage(`Auth error: ${e.message}`, 5000);
    } finally { 
      setPageLoading(false); 
    }
  };

  const handleLogout = async () => {
    if (!auth) return; setPageLoading(true);
    try { await signOut(auth);
      setCurrentPage('dashboard'); 
      setUserAccountStatus('loading'); 
      showMessage('Logged out!');
    } catch (e) { console.error("Logout error:", e); setError("Logout failed.");
    } finally { setPageLoading(false); }
  };

  const handleUpdateSettings = async () => { 
    if (!db || !userId || userRole !== 'admin') { 
        showMessage(userRole !== 'admin' ? 'Admin access required to update settings.' : 'DB not ready.'); 
        return; 
    }
    setPageLoading(true);
    try {
      const settingsDocRef = doc(db, `artifacts/${db.app.options.appId}/users/${userId}/settings`, 'businessProfile');
      await setDoc(settingsDocRef, tempBusinessSettings, { merge: true }); 
      showMessage('Settings updated successfully!');
    } catch (e) { 
      console.error("Error updating settings: ", e); 
      setError("Failed to update settings: " + e.message);
      showMessage("Error updating settings: " + e.message, 5000);
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
      console.error("Password change error: ", e);
      setError(`Password change failed: ${e.message}`);
      showMessage(`Error: ${e.message}`, 5000);
    } finally {
      setPageLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName || !newCustomerAddress || !newCustomerPhone) { showMessage('Fill required fields.'); return; }
    if (!db || !userId || userRole !== 'admin') { showMessage(userRole !== 'admin' ? 'Admin only.' : 'DB not ready.'); return; }
    setPageLoading(true);
    try {
      await addDoc(collection(db, `artifacts/${db.app.options.appId}/users/${userId}/customers`), {
        name: newCustomerName, address: newCustomerAddress, phone: newCustomerPhone, email: newCustomerEmail, createdAt: new Date().toISOString(),
      });
      setNewCustomerName(''); setNewCustomerAddress(''); setNewCustomerPhone(''); setNewCustomerEmail(''); showMessage('Customer added!');
    } catch (e) { console.error("Error adding customer: ", e); setError("Failed: " + e.message);
    } finally { setPageLoading(false); }
  };
  const handleEditCustomer = (customer) => setEditingCustomer({ ...customer });
  const handleCancelEditCustomer = () => setEditingCustomer(null);
  const handleUpdateCustomer = async () => {
    if (!editingCustomer.name || !editingCustomer.address || !editingCustomer.phone) { showMessage('Fill required fields.'); return; }
    if (!db || !userId) { showMessage('DB not ready.'); return; }
    setPageLoading(true);
    try {
      const customerRef = doc(db, `artifacts/${db.app.options.appId}/users/${userId}/customers`, editingCustomer.id);
      await updateDoc(customerRef, { name: editingCustomer.name, address: editingCustomer.address, phone: editingCustomer.phone, email: editingCustomer.email });
      setEditingCustomer(null); showMessage('Customer updated!');
    } catch (e) { console.error("Error updating customer: ", e); setError("Failed: " + e.message);
    } finally { setPageLoading(false); }
  };
  const handleDeleteCustomer = async (customerId) => {
    if (!db || !userId || userRole !== 'admin') { showMessage(userRole !== 'admin' ? 'Admin only.' : 'DB not ready.'); return; }
    setPageLoading(true);
    try { 
        await deleteDoc(doc(db, `artifacts/${db.app.options.appId}/users/${userId}/customers`, customerId)); 
        showMessage('Customer deleted!');
    } catch (e) { 
        console.error("Error deleting customer: ", e); 
        setError("Failed to delete customer: " + e.message);
        showMessage("Error: " + e.message, 5000);
    } finally { 
        setPageLoading(false); 
    }
  };
  const getCustomerOrderSummary = useCallback((customerId) => {
    const customerInvoices = invoices.filter(inv => inv.customerId === customerId);
    let totalOrders = customerInvoices.length, totalAmount = 0, totalPaidSum = 0, totalDue = 0;
    customerInvoices.forEach(inv => { totalAmount += inv.totalAmount || 0; totalPaidSum += inv.totalPaid || 0; totalDue += inv.finalDue || 0; });
    return { totalOrders, totalAmount, totalPaid: totalPaidSum, totalDue };
  }, [invoices]);

  const handleAddProduct = async () => {
    if (!newProductGSM || !newProductUnitPrice || isNaN(parseFloat(newProductUnitPrice)) || isNaN(parseInt(newProductStock))) { showMessage('Valid GSM, Price, Stock needed.'); return; }
    if (!db || !userId || userRole !== 'admin') { showMessage(userRole !== 'admin' ? 'Admin only.' : 'DB not ready.'); return; }
    setPageLoading(true);
    try {
      await addDoc(collection(db, `artifacts/${db.app.options.appId}/users/${userId}/products`), {
        gsm: newProductGSM, type: newProductType, unitPrice: parseFloat(newProductUnitPrice), stock: parseInt(newProductStock), createdAt: new Date().toISOString(),
      });
      setNewProductGSM(''); setNewProductType('sheet'); setNewProductUnitPrice(''); setNewProductStock(''); showMessage('Product added!');
    } catch (e) { console.error("Error adding product: ", e); setError("Failed: " + e.message);
    } finally { setPageLoading(false); }
  };
  const handleEditProduct = (product) => setEditingProduct({ ...product });
  const handleCancelEditProduct = () => setEditingProduct(null);
  const handleUpdateProduct = async () => {
    if (!editingProduct.gsm || !editingProduct.unitPrice || isNaN(parseFloat(editingProduct.unitPrice)) || isNaN(parseInt(editingProduct.stock))) { showMessage('Valid GSM, Price, Stock needed.'); return; }
    if (!db || !userId) { showMessage('DB not ready.'); return; }
    setPageLoading(true);
    try {
      const productRef = doc(db, `artifacts/${db.app.options.appId}/users/${userId}/products`, editingProduct.id);
      await updateDoc(productRef, { gsm: editingProduct.gsm, type: editingProduct.type, unitPrice: parseFloat(editingProduct.unitPrice), stock: parseInt(editingProduct.stock) });
      setEditingProduct(null); showMessage('Product updated!');
    } catch (e) { console.error("Error updating product: ", e); setError("Failed: " + e.message);
    } finally { setPageLoading(false); }
  };
  const handleDeleteProduct = async (productId) => {
    if (!db || !userId || userRole !== 'admin') { showMessage(userRole !== 'admin' ? 'Admin only.' : 'DB not ready.'); return; }
    setPageLoading(true);
    try { 
        await deleteDoc(doc(db, `artifacts/${db.app.options.appId}/users/${userId}/products`, productId)); 
        showMessage('Product deleted!');
    } catch (e) { 
        console.error("Error deleting product: ", e); 
        setError("Failed to delete product: " + e.message);
        showMessage("Error: " + e.message, 5000);
    } finally { 
        setPageLoading(false); 
    }
  };
  const handleProductChangeLogic = (prevProducts, id, field, value) => {
    return prevProducts.map(item => {
      if (item.id === id) {
        let updatedItem = { ...item, [field]: value };
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem = { 
              ...updatedItem, 
              gsm: product.gsm, 
              type: product.type, 
              unitPrice: product.unitPrice, 
              quantity: '', 
              length: product.type === 'sheet' ? '' : '-', 
              width: product.type === 'sheet' ? '' : '-', 
              squareMeters: 0 
            };
          }
        } else if (field === 'unitPrice') { 
            updatedItem.unitPrice = parseFloat(value) || 0;
        }

        let lineTotal = 0, squareMeters = 0;
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
  const addInvoiceProductRow = () => setInvoiceProducts([...invoiceProducts, { id: generateUniqueId(), productId: '', gsm: '', type: '', quantity: '', length: '', width: '', unitPrice: '', lineTotal: 0, squareMeters: 0 }]);
  const removeInvoiceProductRow = (id) => setInvoiceProducts(invoiceProducts.filter(item => item.id !== id));
  const handleInvoiceProductChange = (id, field, value) => setInvoiceProducts(prev => handleProductChangeLogic(prev, id, field, value));

  const calculateInvoiceTotals = () => {
    const subTotal = invoiceProducts.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
    const taxAmount = subTotal * (businessSettings.taxRate / 100);
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
    return { subTotal, taxAmount, totalWithTax, paidAmount: paidAmountNum, finalDue, totalSquareMeters };
  };

  const handleGenerateInvoice = async () => {
    if (!selectedCustomer) { showMessage('Please select a customer.'); return; }
    if (invoiceProducts.length === 0 || invoiceProducts.some(p => !p.productId || !p.quantity || (p.type === 'sheet' && (!p.length || !p.width)))) { showMessage('Please fill in all product details.'); return; }
    if (!db || !userId || userRole !== 'admin') { showMessage(userRole !== 'admin' ? 'Admin access required.' : 'Database not ready.'); return; }
    
    setPageLoading(true);
    try {
      const customer = customers.find(c => c.id === selectedCustomer);
      if (!customer) { 
        showMessage('Customer not found.'); 
        setPageLoading(false); 
        return; 
      }
      
      const { subTotal, taxAmount, totalWithTax, paidAmount, finalDue, totalSquareMeters } = calculateInvoiceTotals();
      
      const invoiceData = {
        invoiceNumber: `BTTAL-INV-${Date.now()}`,
        invoiceDate: new Date().toISOString(),
        customerId: customer.id,
        customerName: customer.name,
        customerAddress: customer.address,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        products: invoiceProducts.map(p => ({
            productId: p.productId,
            gsm: p.gsm,
            type: p.type,
            quantity: parseFloat(p.quantity) || 0,
            length: p.type === 'sheet' ? parseFloat(p.length) : null,
            width: p.type === 'sheet' ? parseFloat(p.width) : null,
            squareMeters: p.type === 'sheet' ? p.squareMeters : null,
            unitPrice: parseFloat(p.unitPrice) || 0,
            lineTotal: p.lineTotal || 0,
        })),
        subTotal,
        taxRate: businessSettings.taxRate,
        taxAmount,
        totalAmount: totalWithTax,
        totalPaid: paidAmount,
        finalDue,
        totalSquareMeters,
        createdAt: new Date().toISOString(),
        sourceOrderId: selectedOrderIdForInvoice || null,
      };

      if (!selectedOrderIdForInvoice) {
        await runTransaction(db, async (transaction) => {
          const productUpdates = [];
          for (const item of invoiceProducts) {
            const productRef = doc(db, `artifacts/${db.app.options.appId}/users/${userId}/products`, item.productId);
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) {
              throw new Error(`Product "${item.gsm || 'Selected Product'}" not found in stock!`);
            }
            const currentStock = productDoc.data().stock;
            const quantityToDeduct = parseFloat(item.quantity);
            if (isNaN(quantityToDeduct) || quantityToDeduct <= 0) {
              throw new Error(`Invalid quantity for product "${item.gsm || 'Selected Product'}".`);
            }
            const newStock = currentStock - quantityToDeduct;
            if (newStock < 0) {
              throw new Error(`Insufficient stock for "${item.gsm || 'Selected Product'}". Available: ${currentStock}, Requested: ${quantityToDeduct}`);
            }
            productUpdates.push({ ref: productRef, newStock: newStock });
          }
          productUpdates.forEach(update => {
            transaction.update(update.ref, { stock: update.newStock });
          });
          const newInvoiceRef = doc(collection(db, `artifacts/${db.app.options.appId}/users/${userId}/invoices`));
          transaction.set(newInvoiceRef, invoiceData);
        });
        showMessage('Invoice saved & stock updated! Generating PDF...');
      } else {
        await addDoc(collection(db, `artifacts/${db.app.options.appId}/users/${userId}/invoices`), invoiceData);
        showMessage('Invoice saved! Generating PDF...');
      }

      generatePrintableInvoice(invoiceData);
      setSelectedCustomer('');
      setInvoiceProducts([]);
      setTotalPaid('');
      setSelectedOrderIdForInvoice('');
      setNewPaymentAmount('');
    } catch (e) {
      console.error("Invoice generation error: ", e);
      setError("Invoice generation failed: " + e.message);
      showMessage("Error: " + e.message, 5000);
    } finally {
      setPageLoading(false);
    }
  };
  const handleEditInvoice = (invoice) => { setEditingInvoice({ ...invoice }); setNewPaymentAmount(''); };
  const handleCancelEditInvoice = () => { setEditingInvoice(null); setNewPaymentAmount(''); };
  const handleUpdateInvoice = async () => {
    if (!db || !userId || !editingInvoice) { showMessage('DB/Invoice not ready.'); return; }
    setPageLoading(true);
    try {
      const invoiceRef = doc(db, `artifacts/${db.app.options.appId}/users/${userId}/invoices`, editingInvoice.id);
      const paymentToAdd = parseFloat(newPaymentAmount) || 0;
      const updatedTotalPaid = (editingInvoice.totalPaid || 0) + paymentToAdd;
      const updatedFinalDue = editingInvoice.totalAmount - updatedTotalPaid;
      await updateDoc(invoiceRef, { totalPaid: updatedTotalPaid, finalDue: updatedFinalDue });
      setEditingInvoice(null); setNewPaymentAmount(''); showMessage('Invoice payment updated!');
    } catch (e) { console.error("Error updating invoice: ", e); setError("Failed: " + e.message);
    } finally { setPageLoading(false); }
  };
  const handleSelectOrderForInvoice = (orderId) => {
    setSelectedOrderIdForInvoice(orderId);
    if (orderId) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setInvoiceProducts(order.products.map(p => ({ ...p, id: generateUniqueId() })));
        setSelectedCustomer(order.customerId); setTotalPaid('');
      }
    } else { setInvoiceProducts([]); setSelectedCustomer(''); setTotalPaid(''); }
  };

  const generatePrintableInvoice = (invoice) => {
    const logoHtml = businessSettings.logoUrl 
      ? `<img src="${businessSettings.logoUrl}" style="max-height: 80px; max-width: 200px;" alt="Company Logo">` 
      : '';

    const productRows = invoice.products.map((p, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${p.gsm}</td>
            <td>${p.type === 'sheet' ? 'Sheet' : 'Bag'}</td>
            <td>${p.quantity} ${p.type === 'sheet' ? 'Rolls' : 'Pcs'}</td>
            <td>${p.type === 'sheet' && p.length != null ? p.length.toFixed(2) : '-'}</td>
            <td>${p.type === 'sheet' && p.width != null ? p.width.toFixed(2) : '-'}</td>
            <td>${p.type === 'sheet' && p.squareMeters != null ? p.squareMeters.toFixed(2) : '-'}</td>
            <td class="text-right">${p.unitPrice.toFixed(2)}</td>
            <td class="text-right">${p.lineTotal.toFixed(2)}</td>
        </tr>
    `).join('');

    const totalsSection = `
        <div class="totals">
            ${invoice.totalSquareMeters > 0 ? `<p>Total Sheet Area: <strong>${invoice.totalSquareMeters.toFixed(2)} sq.m</strong></p>` : ''}
            <p>Sub-total: <strong>৳ ${invoice.subTotal.toFixed(2)}</strong></p>
            <p>Tax (${(invoice.taxRate || 0).toFixed(1)}%): <strong>৳ ${invoice.taxAmount.toFixed(2)}</strong></p>
            <p>Total Amount: <strong>৳ ${invoice.totalAmount.toFixed(2)}</strong></p>
            <p>Total Paid: <strong>৳ ${invoice.totalPaid.toFixed(2)}</strong></p>
            <hr>
            <p class="final-due">Final Due: <strong>৳ ${invoice.finalDue.toFixed(2)}</strong></p>
        </div>
    `;

    const htmlContent = `
        <html>
            <head>
                <title>Invoice ${invoice.invoiceNumber}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; margin: 0; padding: 20px; color: #333; }
                    .invoice-container { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                    .header-left { text-align: left; }
                    .header-right { text-align: right; }
                    .header h1 { margin: 0 0 5px 0; font-size: 24px; }
                    .header p { margin: 0; font-size: 12px; color: #555; }
                    .invoice-details, .customer-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .invoice-details div, .customer-details div { font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                    th { background-color: #f2f2f2; }
                    .text-right { text-align: right; }
                    .totals { float: right; width: 250px; margin-top: 20px; }
                    .totals p { margin: 5px 0; display: flex; justify-content: space-between; }
                    .totals hr { border: none; border-top: 1px solid #eee; margin: 5px 0; }
                    .final-due { font-size: 16px; font-weight: bold; }
                    .footer { text-align: center; margin-top: 100px; font-size: 12px; color: #777; }
                    @media print {
                        body { padding: 0; }
                        .invoice-container { box-shadow: none; border: none; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <div class="header">
                        <div class="header-left">
                           ${logoHtml}
                        </div>
                        <div class="header-right">
                           <h1>${businessSettings.name}</h1>
                           <p>${businessSettings.officeAddress || ''}</p>
                           <p>Phone: ${businessSettings.phone} | Email: ${businessSettings.email}</p>
                        </div>
                    </div>
                    <hr>
                    <div class="invoice-details">
                        <div>
                            <strong>Invoice No:</strong> ${invoice.invoiceNumber}<br>
                            <strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}
                            ${invoice.sourceOrderId ? `<br><strong>Ref Order No:</strong> ${orders.find(o => o.id === invoice.sourceOrderId)?.orderNumber || ''}` : ''}
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
                                <th>SL</th><th>Product</th><th>Type</th><th>Qty</th><th>L(m)</th><th>W(m)</th><th>Sq.M</th><th class="text-right">Price(৳)</th><th class="text-right">Amount(৳)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productRows}
                        </tbody>
                    </table>
                    ${totalsSection}
                    <div style="clear: both;"></div>
                    <div class="footer">
                        <p>Thank you for your business!</p>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const addOrderProductRow = () => setOrderProducts([...orderProducts, { id: generateUniqueId(), productId: '', gsm: '', type: '', quantity: '', length: '', width: '', unitPrice: '', lineTotal: 0, squareMeters: 0 }]);
  const removeOrderProductRow = (id) => setOrderProducts(orderProducts.filter(item => item.id !== id));
  const handleOrderProductChange = (id, field, value) => setOrderProducts(prev => handleProductChangeLogic(prev, id, field, value));
  const handleCreateOrder = async () => {
    if (!selectedOrderCustomer || !selectedOrderTaker) { showMessage('Select customer & order taker.'); return; }
    if (orderProducts.length === 0 || orderProducts.some(p => !p.productId || !p.quantity || (p.type === 'sheet' && (!p.length || !p.width)))) { showMessage('Add product details.'); return; }
    if (!db || !userId || userRole !== 'admin') { showMessage(userRole !== 'admin' ? 'Admin only.' : 'DB not ready.'); return; }
    setPageLoading(true);
    try {
      const customer = customers.find(c => c.id === selectedOrderCustomer); const orderTaker = salespersons.find(s => s.id === selectedOrderTaker);
      if (!customer || !orderTaker) { showMessage('Customer/Salesperson not found.'); setPageLoading(false); return; }
      
      let totalOrderAmount = 0;
      let commissionAmount = 0;
      const processedOrderProducts = orderProducts.map(p => {
        const productDetails = products.find(prod => prod.id === p.productId);
        const lineCalc = handleProductChangeLogic([p], p.id, '', ''); // Recalculate to be sure
        const currentLineTotal = lineCalc[0].lineTotal;
        totalOrderAmount += currentLineTotal;
        return { 
            ...p, 
            quantity: parseFloat(p.quantity),
            length: p.type === 'sheet' ? parseFloat(p.length) : null,
            width: p.type === 'sheet' ? parseFloat(p.width) : null,
            squareMeters: p.type === 'sheet' ? (parseFloat(p.length) * parseFloat(p.width)) : null,
            unitPrice: parseFloat(p.unitPrice),
            lineTotal: currentLineTotal,
         };
      });

      if (orderTaker.commission.type === "percentage") {
        commissionAmount = totalOrderAmount * ((orderTaker.commission.percentageRate || 0) / 100);
      } else if (orderTaker.commission.type === "fixed") {
        commissionAmount = processedOrderProducts.reduce((acc, p) => {
          let itemCommission = 0;
          const productDetails = products.find(prod => prod.id === p.productId); 
          if (productDetails) { 
              if (productDetails.type === 'sheet' && orderTaker.commission.fixedSheetRate != null) { 
                  const quantity = parseFloat(p.quantity);
                  const squareMeters = p.squareMeters; 
                  if(!isNaN(quantity) && !isNaN(squareMeters)) {
                       itemCommission = quantity * squareMeters * orderTaker.commission.fixedSheetRate;
                  }
              } else if (productDetails.type === 'bag' && orderTaker.commission.fixedBagRate != null) { 
                  const quantity = parseFloat(p.quantity);
                  if(!isNaN(quantity)) {
                      itemCommission = quantity * orderTaker.commission.fixedBagRate;
                  }
              }
          }
          return acc + itemCommission;
        }, 0);
      }


      const orderData = {
        orderNumber: `BTTAL-ORD-${Date.now()}`, orderDate: new Date().toISOString(), customerId: customer.id, customerName: customer.name, 
        orderTakerId: orderTaker.id, orderTakerName: orderTaker.name, 
        commissionDetails: orderTaker.commission, 
        commissionAmount: commissionAmount,
        products: processedOrderProducts,
        totalAmount: totalOrderAmount, status: 'Pending', createdAt: new Date().toISOString(),
      };

      await runTransaction(db, async (transaction) => {
        const productUpdates = [];
        for (const item of processedOrderProducts) { 
            const productRef = doc(db, `artifacts/${db.app.options.appId}/users/${userId}/products`, item.productId);
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) {
            throw new Error(`Product "${item.gsm || 'Selected Product'}" not found in stock!`);
            }
            const currentStock = productDoc.data().stock;
            const quantityToDeduct = item.quantity; 
            if (isNaN(quantityToDeduct) || quantityToDeduct <= 0) {
                throw new Error(`Invalid quantity for product "${item.gsm || 'Selected Product'}".`);
            }
            const newStock = currentStock - quantityToDeduct;
            if (newStock < 0) {
            throw new Error(`Insufficient stock for "${item.gsm || 'Selected Product'}". Available: ${currentStock}, Requested: ${quantityToDeduct}`);
            }
            productUpdates.push({ ref: productRef, newStock: newStock });
        }
        productUpdates.forEach(update => {
            transaction.update(update.ref, { stock: update.newStock });
        });
        const newOrderRef = doc(collection(db, `artifacts/${db.app.options.appId}/users/${userId}/orders`));
        transaction.set(newOrderRef, orderData);
      });
      showMessage('Order created & stock updated!');
      setSelectedOrderCustomer(''); setSelectedOrderTaker(''); setOrderProducts([]);
    } catch (e) { console.error("Order creation error: ", e.message); setError("Order creation failed: " + e.message); showMessage("Error: " + e.message, 5000);
    } finally { setPageLoading(false); }
  };
  const handleEditOrder = (order) => setEditingOrder({ ...order });
  const handleCancelEditOrder = () => setEditingOrder(null);
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (!db || !userId) { showMessage('DB not ready.'); return; }
    setPageLoading(true);
    try { await updateDoc(doc(db, `artifacts/${db.app.options.appId}/users/${userId}/orders`, orderId), { status: newStatus }); showMessage('Order status updated!');
    } catch (e) { console.error("Error updating order status: ", e); setError("Failed: " + e.message);
    } finally { setPageLoading(false); }
  };
  const handleDeleteOrder = async (orderId) => {
    if (!db || !userId || userRole !== 'admin') { showMessage(userRole !== 'admin' ? 'Admin only.' : 'DB not ready.'); return; }
    setPageLoading(true);
    try { 
        await deleteDoc(doc(db, `artifacts/${db.app.options.appId}/users/${userId}/orders`, orderId)); 
        showMessage('Order deleted!');
    } catch (e) { 
        console.error("Error deleting order: ", e); 
        setError("Failed to delete order: " + e.message);
        showMessage("Error: " + e.message, 5000);
    } finally { 
        setPageLoading(false); 
    }
  };
  
  const handleAddSalesperson = async () => {
    if (!newSalespersonName) { showMessage('Salesperson name is required.'); return; }
    let commissionPayload = {};
    if (newSalespersonCommissionType === 'percentage') {
        const rate = parseFloat(newSalespersonPercentageRate);
        if (isNaN(rate) || rate < 0) { showMessage('Valid percentage rate is required.'); return; }
        commissionPayload = { type: 'percentage', percentageRate: rate };
    } else if (newSalespersonCommissionType === 'fixed') {
        const sheetRate = parseFloat(newSalespersonFixedSheetRate);
        const bagRate = parseFloat(newSalespersonFixedBagRate);
        
        let validFixedRateProvided = false;
        if (newSalespersonFixedSheetRate !== '' && (!isNaN(sheetRate) && sheetRate >= 0)) validFixedRateProvided = true;
        if (newSalespersonFixedBagRate !== '' && (!isNaN(bagRate) && bagRate >= 0)) validFixedRateProvided = true;
        
        if (!validFixedRateProvided && (newSalespersonFixedSheetRate !== '' || newSalespersonFixedBagRate !== '')) {
            showMessage('At least one valid non-negative fixed rate (sheet or bag) is required if providing fixed rates.'); return;
        }
        commissionPayload = { 
            type: 'fixed', 
            fixedSheetRate: (newSalespersonFixedSheetRate !== '' && !isNaN(sheetRate) && sheetRate >=0) ? sheetRate : null, 
            fixedBagRate: (newSalespersonFixedBagRate !== '' && !isNaN(bagRate) && bagRate >=0) ? bagRate : null 
        };
         if (commissionPayload.fixedSheetRate === null && commissionPayload.fixedBagRate === null) { // Both can't be null if type is fixed
            showMessage('For fixed commission, at least one rate (sheet or bag) must be provided and be a valid number.'); return;
        }
    } else {
        showMessage('Invalid commission type.'); return;
    }

    if (!db || !userId || userRole !== 'admin') { showMessage(userRole !== 'admin' ? 'Admin only.' : 'DB not ready.'); return; }
    setPageLoading(true);
    try {
      await addDoc(collection(db, `artifacts/${db.app.options.appId}/users/${userId}/salespersons`), {
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
    } catch (e) { console.error("Error adding salesperson: ", e); setError("Failed to add salesperson: " + e.message);
    } finally { setPageLoading(false); }
  };
  const handleDeleteSalesperson = async (salespersonId) => {
    if (!db || !userId || userRole !== 'admin') { showMessage(userRole !== 'admin' ? 'Admin only.' : 'DB not ready.'); return; }
    setPageLoading(true);
    try {
        await deleteDoc(doc(db, `artifacts/${db.app.options.appId}/users/${userId}/salespersons`, salespersonId));
        showMessage('Salesperson deleted!');
    } catch (e) {
        console.error("Error deleting salesperson: ", e);
        setError("Failed to delete salesperson: " + e.message);
        showMessage("Error: " + e.message, 5000);
    } finally {
        setPageLoading(false);
    }
  };


  const handleDeleteInvoice = async (invoiceId) => {
    if (!db || !userId || userRole !== 'admin') { showMessage(userRole !== 'admin' ? 'Admin only.' : 'DB not ready.'); return; }
    setPageLoading(true);
    try {
        await deleteDoc(doc(db, `artifacts/${db.app.options.appId}/users/${userId}/invoices`, invoiceId));
        showMessage('Invoice deleted!');
    } catch (e) {
        console.error("Error deleting invoice: ", e);
        setError("Failed to delete invoice: " + e.message);
        showMessage("Error: " + e.message, 5000);
    } finally {
        setPageLoading(false);
    }
  };
  const handleUpdateUserStatusAndRole = async (targetUserIdToUpdate, newStatus, newRole) => {
    if (!db || !userId || userRole !== 'admin') {
      showMessage('Admin access required.');
      return;
    }
    if (!targetUserIdToUpdate || !newStatus || !newRole) {
      showMessage('Missing user ID, status, or role for update.');
      return;
    }
    setPageLoading(true);
    try {
      const userDocRef = doc(db, `artifacts/${auth.app.options.appId}/users`, targetUserIdToUpdate);
      await updateDoc(userDocRef, {
        status: newStatus,
        role: newRole,
      });
      showMessage(`User status updated to ${newStatus} and role to ${newRole}.`);
    } catch (e) {
      console.error("Error updating user status/role: ", e);
      setError("Failed to update user: " + e.message);
      showMessage("Error: " + e.message, 5000);
    } finally {
      setPageLoading(false);
    }
  };


  const renderCommissionReport = () => {
    console.log("[Render] renderCommissionReport called");
    const commissionsBySalesperson = orders.reduce((acc, order) => {
      if (order.orderTakerId) {
        const existing = acc[order.orderTakerId] || { name: order.orderTakerName, totalCommission: 0, ordersCount: 0 };
        existing.totalCommission += (order.commissionAmount || 0); existing.ordersCount++; acc[order.orderTakerId] = existing;
      } return acc;
    }, {});
    const commissionData = Object.values(commissionsBySalesperson);
    const exportCommissionsToCSV = () => { 
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Salesperson Name,Total Commission (৳),Orders Count\n";
        commissionData.forEach(item => {
            csvContent += `${item.name},${item.totalCommission.toFixed(2)},${item.ordersCount}\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "commission_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <div className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Salesperson Commission Report</h2>
                <button
                onClick={exportCommissionsToCSV}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow"
                >
                Export to CSV
                </button>
            </div>
            {commissionData.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No commission data available.</p>
            ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Salesperson Name</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Commission (৳)</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Orders Taken</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {commissionData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{item.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">৳ {item.totalCommission.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{item.ordersCount}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}
        </div>
    );
  };
  const renderCustomerSpendingReport = () => {
    console.log("[Render] renderCustomerSpendingReport called");
    const customerSpending = invoices.reduce((acc, invoice) => {
      const existing = acc[invoice.customerId] || { name: invoice.customerName, totalBilled: 0, totalPaid: 0, invoiceCount: 0 };
      existing.totalBilled += (invoice.totalAmount || 0); existing.totalPaid += (invoice.totalPaid || 0); existing.invoiceCount++; acc[invoice.customerId] = existing;
      return acc;
    }, {});
    const spendingData = Object.values(customerSpending);
    const exportSpendingToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Customer Name,Total Billed (৳),Total Paid (৳),Invoice Count\n";
        spendingData.forEach(item => {
            csvContent += `${item.name},${item.totalBilled.toFixed(2)},${item.totalPaid.toFixed(2)},${item.invoiceCount}\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "customer_spending_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <div className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Customer Spending Report</h2>
                <button
                    onClick={exportSpendingToCSV}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow"
                >
                Export to CSV
                </button>
            </div>
            {spendingData.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No customer spending data available.</p>
            ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Customer Name</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Billed (৳)</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Paid (৳)</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Invoice Count</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {spendingData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{item.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">৳ {item.totalBilled.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">৳ {item.totalPaid.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{item.invoiceCount}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}
        </div>
    );
  };

  // --- Page Rendering Functions ---
  const renderDashboard = () => {
    console.log("[Render] renderDashboard called");
    const totalBilledAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPaidAmount = invoices.reduce((sum, inv) => sum + (inv.totalPaid || 0), 0);
    const totalCommissionPaid = orders.reduce((sum, order) => sum + (order.commissionAmount || 0), 0);
    const lowStockProducts = products.filter(p => p.stock <= businessSettings.lowStockThreshold && p.stock > 0);
    const outOfStockProducts = products.filter(p => p.stock === 0);
    return (
      <div className="p-4 md:p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Dashboard</h2>
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
            <p className="font-bold">Inventory Alerts!</p>
            {lowStockProducts.length > 0 && <p>Low stock (Threshold: {businessSettings.lowStockThreshold}): {lowStockProducts.map(p => `${p.gsm} (${p.stock})`).join(', ')}</p>}
            {outOfStockProducts.length > 0 && <p>Out of Stock: {outOfStockProducts.map(p => p.gsm).join(', ')}</p>}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow"><h3 className="text-sm text-gray-600 dark:text-gray-300">Total Customers</h3><p className="text-3xl font-bold text-indigo-600">{customers.length}</p></div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow"><h3 className="text-sm text-gray-600 dark:text-gray-300">Total Products</h3><p className="text-3xl font-bold text-green-600">{products.length}</p></div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow"><h3 className="text-sm text-gray-600 dark:text-gray-300">Total Invoices</h3><p className="text-3xl font-bold text-purple-600">{invoices.length}</p></div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow"><h3 className="text-sm text-gray-600 dark:text-gray-300">Total Orders</h3><p className="text-3xl font-bold text-orange-600">{orders.length}</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow"><h3 className="text-sm text-gray-600 dark:text-gray-300">Total Billed</h3><p className="text-3xl font-bold text-blue-600">৳ {totalBilledAmount.toFixed(2)}</p></div>
           <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow"><h3 className="text-sm text-gray-600 dark:text-gray-300">Total Paid</h3><p className="text-3xl font-bold text-teal-600">৳ {totalPaidAmount.toFixed(2)}</p></div>
           <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow"><h3 className="text-sm text-gray-600 dark:text-gray-300">Total Commissions</h3><p className="text-3xl font-bold text-pink-600">৳ {totalCommissionPaid.toFixed(2)}</p></div>
        </div>
      </div>
    );
  };

  const renderCustomers = () => {
    console.log("[Render] renderCustomers called");
    const filteredCustomers = customers.filter(customer =>
      customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.phone.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()))
    );

    const indexOfLastItem = currentCustomerPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    const exportCustomersToCSV = () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Name,Address,Phone,Email,Total Orders,Total Amount Billed (৳),Total Paid (৳),Total Due (৳)\n";
      filteredCustomers.forEach(customer => {
        const summary = getCustomerOrderSummary(customer.id);
        csvContent += `${customer.name},"${customer.address}",${customer.phone},${customer.email || '-'},${summary.totalOrders},${summary.totalAmount.toFixed(2)},${summary.totalPaid.toFixed(2)},${summary.totalDue.toFixed(2)}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "customers_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Customer Management</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Add New Customer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Customer Name" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="text" placeholder="Address" value={newCustomerAddress} onChange={(e) => setNewCustomerAddress(e.target.value)} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="text" placeholder="Phone" value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="email" placeholder="Email (Optional)" value={newCustomerEmail} onChange={(e) => setNewCustomerEmail(e.target.value)} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <button onClick={handleAddCustomer} className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out shadow-lg" disabled={pageLoading || userRole !== 'admin'}>{pageLoading ? 'Adding...' : 'Add Customer'}</button>
        </div>
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <input type="text" placeholder="Search customers by name, phone, or email..." value={customerSearchQuery} onChange={(e) => {setCustomerSearchQuery(e.target.value); setCurrentCustomerPage(1);}} className="w-full sm:w-2/3 p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          <button onClick={exportCustomersToCSV} className="w-full sm:w-auto bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-lg">Export CSV</button>
        </div>
        <div className="bg-white dark:bg-gray-800 p-2 md:p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Existing Customers</h3>
          {currentItems.length === 0 ? <p className="text-gray-600 dark:text-gray-300">No customers found matching your search.</p> : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Address</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Orders</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total (৳)</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Paid (৳)</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Due (৳)</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((customer) => {
                    const summary = getCustomerOrderSummary(customer.id);
                    return (
                      <React.Fragment key={customer.id}>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">{customer.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{customer.address}</td>
                          <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">{customer.phone}</td>
                          <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{customer.email || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{summary.totalOrders}</td>
                          <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">৳{summary.totalAmount.toFixed(2)}</td>
                          <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">৳{summary.totalPaid.toFixed(2)}</td>
                          <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">৳{summary.totalDue.toFixed(2)}</td>
                          <td className="py-3 px-4 text-sm whitespace-nowrap">
                            <button onClick={() => handleEditCustomer(customer)} className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs hover:bg-yellow-600 mr-1 transition-colors" disabled={userRole !== 'admin'}>Edit</button>
                            <button onClick={() => handleDeleteCustomer(customer.id)} className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors" disabled={userRole !== 'admin'}>Delete</button>
                          </td>
                        </tr>
                        {editingCustomer && editingCustomer.id === customer.id && (
                          <tr className="bg-indigo-50 dark:bg-indigo-900/30"><td colSpan="9" className="p-4">
                            <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-100">Edit Customer: {editingCustomer.name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <input type="text" placeholder="Name" value={editingCustomer.name} onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })} className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"/>
                              <input type="text" placeholder="Address" value={editingCustomer.address} onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })} className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"/>
                              <input type="text" placeholder="Phone" value={editingCustomer.phone} onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })} className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"/>
                              <input type="email" placeholder="Email" value={editingCustomer.email} onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })} className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"/>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={handleUpdateCustomer} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors" disabled={pageLoading}>{pageLoading ? 'Saving...' : 'Save Changes'}</button>
                              <button onClick={handleCancelEditCustomer} className="bg-gray-400 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-500 transition-colors">Cancel</button>
                            </div>
                          </td></tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (<div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-x-1">
              <button onClick={() => setCurrentCustomerPage(prev => Math.max(1, prev - 1))} disabled={currentCustomerPage === 1} className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentCustomerPage(page)} className={`px-3 py-1 rounded-md text-sm ${currentCustomerPage === page ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'} transition-colors`}>{page}</button>
              ))}
              <button onClick={() => setCurrentCustomerPage(prev => Math.min(totalPages, prev + 1))} disabled={currentCustomerPage === totalPages} className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">Next</button>
          </div>)}
        </div>
      </div>
    );
  };

  const renderProducts = () => {
    console.log("[Render] renderProducts called");
    const indexOfLastItem = currentProductPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

     const exportProductsToCSV = () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "GSM,Type,Unit Price (৳),Stock\n";
      products.forEach(product => {
        csvContent += `${product.gsm},${product.type === 'sheet' ? 'Sheet' : 'Bag'},${product.unitPrice.toFixed(2)},${product.stock}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "products_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Product Management</h2>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Add New Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <input type="text" placeholder="GSM (e.g., 150 GSM PP)" value={newProductGSM} onChange={(e) => setNewProductGSM(e.target.value)} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
            <select value={newProductType} onChange={(e) => setNewProductType(e.target.value)} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700">
              <option value="sheet">Sheet</option>
              <option value="bag">Bag</option>
            </select>
            <input type="number" placeholder={`Unit Price (৳ per ${newProductType === 'sheet' ? 'sq. meter' : 'piece'})`} value={newProductUnitPrice} onChange={(e) => setNewProductUnitPrice(e.target.value)} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
            <input type="number" placeholder="Stock Quantity" value={newProductStock} onChange={(e) => setNewProductStock(e.target.value)} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
          </div>
          <button onClick={handleAddProduct} className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 transition duration-300 ease-in-out shadow-lg" disabled={pageLoading || userRole !== 'admin'}>{pageLoading ? 'Adding...' : 'Add Product'}</button>
        </div>

        <div className="mb-4 flex justify-end">
            <button onClick={exportProductsToCSV} className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-lg">Export CSV</button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-2 md:p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Existing Products</h3>
           {currentItems.length === 0 ? <p className="text-gray-600 dark:text-gray-300">No products added yet.</p> : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">GSM</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Unit Price (৳)</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((product) => (
                  <React.Fragment key={product.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">{product.gsm}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{product.type === 'sheet' ? 'Sheet' : 'Bag'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">৳ {product.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{product.stock}</td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">
                      <button onClick={() => handleEditProduct(product)} className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs hover:bg-yellow-600 mr-1 transition-colors" disabled={userRole !== 'admin'}>Edit</button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors" disabled={userRole !== 'admin'}>Delete</button>
                    </td>
                  </tr>
                  {editingProduct && editingProduct.id === product.id && (
                    <tr className="bg-indigo-50 dark:bg-indigo-900/30"><td colSpan="5" className="p-4">
                      <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-100">Edit Product: {editingProduct.gsm}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        <input type="text" placeholder="GSM" value={editingProduct.gsm} onChange={(e) => setEditingProduct({ ...editingProduct, gsm: e.target.value })} className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"/>
                        <select value={editingProduct.type} onChange={(e) => setEditingProduct({ ...editingProduct, type: e.target.value })} className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700">
                          <option value="sheet">Sheet</option>
                          <option value="bag">Bag</option>
                        </select>
                        <input type="number" placeholder="Unit Price" value={editingProduct.unitPrice} onChange={(e) => setEditingProduct({ ...editingProduct, unitPrice: e.target.value })} className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"/>
                        <input type="number" placeholder="Stock" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"/>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleUpdateProduct} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors" disabled={pageLoading}>{pageLoading ? 'Saving...' : 'Save Changes'}</button>
                        <button onClick={handleCancelEditProduct} className="bg-gray-400 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-500 transition-colors">Cancel</button>
                      </div>
                    </td></tr>
                  )}
                  </React.Fragment>
                ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (<div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-x-1">
              <button onClick={() => setCurrentProductPage(prev => Math.max(1, prev - 1))} disabled={currentProductPage === 1} className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentProductPage(page)} className={`px-3 py-1 rounded-md text-sm ${currentProductPage === page ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'} transition-colors`}>{page}</button>
              ))}
              <button onClick={() => setCurrentProductPage(prev => Math.min(totalPages, prev + 1))} disabled={currentProductPage === totalPages} className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">Next</button>
          </div>)}
        </div>
      </div>
    );
  };

  const renderCreateInvoice = () => {
    console.log("[Render] renderCreateInvoice called");
    const { subTotal, taxAmount, totalWithTax, paidAmount, finalDue, totalSquareMeters } = calculateInvoiceTotals();
    const invoicePreviewData = {
      invoiceNumber: 'PREVIEW',
      invoiceDate: new Date().toISOString(),
      customerName: selectedCustomer ? customers.find(c => c.id === selectedCustomer)?.name : 'N/A',
      customerAddress: selectedCustomer ? customers.find(c => c.id === selectedCustomer)?.address : 'N/A',
      customerPhone: selectedCustomer ? customers.find(c => c.id === selectedCustomer)?.phone : 'N/A',
      customerEmail: selectedCustomer ? customers.find(c => c.id === selectedCustomer)?.email : '',
      products: invoiceProducts,
      subTotal: subTotal,
      taxRate: businessSettings.taxRate,
      taxAmount: taxAmount,
      totalAmount: totalWithTax,
      totalPaid: paidAmount,
      finalDue: finalDue,
      totalSquareMeters: totalSquareMeters,
    };

    const handlePrintPreview = () => {
      generatePrintableInvoice(invoicePreviewData);
    };

    return (
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Create New Invoice</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Invoice Details</h3>
          <div className="mb-4">
            <label htmlFor="customer-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Customer:</label>
            <select id="customer-select" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700">
              <option value="">-- Select a Customer --</option>
              {customers.map(customer => (<option key={customer.id} value={customer.id}>{customer.name}</option>))}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="order-load-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Load Products from Existing Order (Optional):</label>
            <select id="order-load-select" value={selectedOrderIdForInvoice} onChange={(e) => handleSelectOrderForInvoice(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700">
              <option value="">-- Select an Order --</option>
              {orders.map(order => (<option key={order.id} value={order.id}>{order.orderNumber} ({order.customerName})</option>))}
            </select>
          </div>
          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Products</h4>
          {invoiceProducts.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-x-4 gap-y-2 mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50 items-end">
              <div className="md:col-span-2 lg:col-span-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Product (GSM)</label>
                <select value={item.productId} onChange={(e) => handleInvoiceProductChange(item.id, 'productId', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-gray-600">
                  <option value="">Select Product</option>
                  {products.map(product => (<option key={product.id} value={product.id}>{product.gsm} ({product.type}) (Stock: {product.stock})</option>))}
                </select>
              </div>
              <div className="lg:col-span-1"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Qty ({item.type === 'sheet' ? 'Rolls' : 'Pcs'})</label><input type="number" value={item.quantity} onChange={(e) => handleInvoiceProductChange(item.id, 'quantity', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-600" placeholder="Qty"/></div>
              {item.type === 'sheet' && (<>
                <div className="lg:col-span-1"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Length (m)</label><input type="number" value={item.length} onChange={(e) => handleInvoiceProductChange(item.id, 'length', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-600" placeholder="L"/></div>
                <div className="lg:col-span-1"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Width (m)</label><input type="number" value={item.width} onChange={(e) => handleInvoiceProductChange(item.id, 'width', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-600" placeholder="W"/></div>
                <div className="lg:col-span-1"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Sq. Meters</label><input type="text" value={item.squareMeters ? item.squareMeters.toFixed(2) : '0.00'} readOnly className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-500"/></div>
              </>)}
              {item.type === 'bag' && <div className="md:col-span-2 lg:col-span-3"></div> /* Placeholder for alignment */}
              <div className="lg:col-span-1"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Unit Price (৳)</label>
                <input type="number" value={item.unitPrice} onChange={(e) => handleInvoiceProductChange(item.id, 'unitPrice', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-600"/>
              </div>
              <div className="lg:col-span-1"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Line Total (৳)</label><input type="text" value={`৳ ${item.lineTotal ? item.lineTotal.toFixed(2) : '0.00'}`} readOnly className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-500 font-semibold"/></div>
              <button onClick={() => removeInvoiceProductRow(item.id)} className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-300 ease-in-out text-sm self-end h-10">Remove</button>
            </div>
          ))}
          <button onClick={addInvoiceProductRow} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out text-sm mb-4">Add Product Row</button>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            {totalSquareMeters > 0 && (
                <div className="flex justify-end items-center gap-4 mb-1"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Sheet Area:</span><span className="text-md font-semibold text-gray-800 dark:text-gray-100">{totalSquareMeters.toFixed(2)} sq.m</span></div>
            )}
            <div className="flex justify-end items-center gap-4 mb-1"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub-total:</span><span className="text-md font-semibold text-gray-800 dark:text-gray-100">৳ {subTotal.toFixed(2)}</span></div>
            <div className="flex justify-end items-center gap-4 mb-1"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tax ({businessSettings.taxRate.toFixed(1)}%):</span><span className="text-md font-semibold text-gray-800 dark:text-gray-100">৳ {taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-end items-center gap-4 mb-1"><label htmlFor="total-paid" className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Paid:</label><input id="total-paid" type="number" value={totalPaid} onChange={(e) => setTotalPaid(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-md font-semibold text-green-600 w-36 text-right bg-gray-50 dark:bg-gray-700" placeholder="0.00"/></div>
            <div className="flex justify-end items-center gap-4 mb-1"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount:</span><span className="text-lg font-bold text-blue-600 dark:text-blue-400">৳ {totalWithTax.toFixed(2)}</span></div>
            <div className="flex justify-end items-center gap-4 mt-2"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Final Due:</span><span className="text-lg font-bold text-red-600 dark:text-red-400">৳ {finalDue.toFixed(2)}</span></div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <button onClick={handleGenerateInvoice} className="flex-1 bg-purple-600 text-white p-3 rounded-md text-md font-semibold hover:bg-purple-700 transition duration-300 ease-in-out shadow-lg" disabled={pageLoading || userRole !== 'admin'}>{pageLoading ? 'Generating...' : 'Generate Invoice & Save'}</button>
            <button onClick={handlePrintPreview} className="flex-1 bg-gray-600 text-white p-3 rounded-md text-md font-semibold hover:bg-gray-700 transition duration-300 ease-in-out shadow-lg">Print Preview</button>
          </div>
        </div>
      </div>
    );
  };
  const renderInvoices = () => {
    console.log("[Render] renderInvoices called");
    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) || invoice.customerName.toLowerCase().includes(invoiceSearchQuery.toLowerCase());
        const invoiceDate = new Date(invoice.invoiceDate);
        const startDate = invoiceStartDateFilter ? new Date(invoiceStartDateFilter) : null;
        const endDate = invoiceEndDateFilter ? new Date(invoiceEndDateFilter) : null;
        if (startDate) startDate.setHours(0,0,0,0);
        if (endDate) endDate.setHours(23,59,59,999);
        const matchesDateRange = (!startDate || invoiceDate >= startDate) && (!endDate || invoiceDate <= endDate);
        return matchesSearch && matchesDateRange;
    });

    const indexOfLastItem = currentInvoicePage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

    const exportInvoicesToCSV = () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Invoice No.,Date,Customer,Total Amount (৳),Paid (৳),Due (৳),Tax Rate (%),Tax Amount (৳),Ref Order No.\n";
      filteredInvoices.forEach(invoice => {
        const sourceOrder = invoice.sourceOrderId ? orders.find(o => o.id === invoice.sourceOrderId) : null;
        csvContent += `${invoice.invoiceNumber},${new Date(invoice.invoiceDate).toLocaleDateString()},"${invoice.customerName}",${invoice.totalAmount.toFixed(2)},${invoice.totalPaid.toFixed(2)},${invoice.finalDue.toFixed(2)},${(invoice.taxRate || 0).toFixed(1)},${invoice.taxAmount.toFixed(2)},${sourceOrder ? sourceOrder.orderNumber : '-'}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "invoices_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">All Invoices</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <input type="text" placeholder="Search by Inv No. or Customer" value={invoiceSearchQuery} onChange={(e) => {setInvoiceSearchQuery(e.target.value); setCurrentInvoicePage(1);}} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"/>
            <input type="date" value={invoiceStartDateFilter} onChange={(e) => {setInvoiceStartDateFilter(e.target.value); setCurrentInvoicePage(1);}} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700" title="Start Date"/>
            <input type="date" value={invoiceEndDateFilter} onChange={(e) => {setInvoiceEndDateFilter(e.target.value); setCurrentInvoicePage(1);}} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700" title="End Date"/>
        </div>
        <div className="mb-4 flex justify-end">
            <button onClick={exportInvoicesToCSV} className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-lg">Export CSV</button>
        </div>
        <div className="bg-white dark:bg-gray-800 p-2 md:p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Existing Invoices</h3>
          {currentItems.length === 0 ? <p className="text-gray-600 dark:text-gray-300">No invoices found.</p> : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Inv. No.</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total (৳)</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Paid (৳)</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Due (৳)</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((invoice) => (
                  <React.Fragment key={invoice.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{invoice.customerName}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">৳{invoice.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">৳{invoice.totalPaid.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">৳{invoice.finalDue.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">
                      <button 
                        onClick={() => generatePrintableInvoice(invoice)} 
                        className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs hover:bg-blue-600 mr-1 transition-colors"
                      >
                        PDF
                      </button>
                      <button onClick={() => handleEditInvoice(invoice)} className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs hover:bg-yellow-600 mr-1 transition-colors" disabled={userRole !== 'admin'}>Edit/Pay</button>
                      <button onClick={() => handleDeleteInvoice(invoice.id)} className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors" disabled={userRole !== 'admin'}>Delete</button>
                    </td>
                  </tr>
                  {editingInvoice && editingInvoice.id === invoice.id && (
                    <tr className="bg-indigo-50 dark:bg-indigo-900/30"><td colSpan="7" className="p-4">
                      <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-100">Add Payment to Invoice: {editingInvoice.invoiceNumber}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 items-end">
                        <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Current Total Paid (৳)</label><input type="number" value={editingInvoice.totalPaid.toFixed(2)} readOnly className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full bg-gray-100 dark:bg-gray-700"/></div>
                        <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Add New Payment (৳)</label><input type="number" value={newPaymentAmount} onChange={(e) => setNewPaymentAmount(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full bg-white dark:bg-gray-600" placeholder="0.00"/></div>
                        <div className="flex gap-2">
                            <button onClick={handleUpdateInvoice} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors" disabled={pageLoading}>{pageLoading ? 'Saving...' : 'Save Payment'}</button>
                            <button onClick={handleCancelEditInvoice} className="bg-gray-400 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-500 transition-colors">Cancel</button>
                        </div>
                      </div>
                    </td></tr>
                  )}
                  </React.Fragment>
                ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (<div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-x-1">
              <button onClick={() => setCurrentInvoicePage(prev => Math.max(1, prev - 1))} disabled={currentInvoicePage === 1} className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentInvoicePage(page)} className={`px-3 py-1 rounded-md text-sm ${currentInvoicePage === page ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'} transition-colors`}>{page}</button>
              ))}
              <button onClick={() => setCurrentInvoicePage(prev => Math.min(totalPages, prev + 1))} disabled={currentInvoicePage === totalPages} className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">Next</button>
          </div>)}
        </div>
      </div>
    );
  };
  const renderCreateOrder = () => {
    console.log("[Render] renderCreateOrder called");
    const totalOrderAmount = orderProducts.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
    const selectedSalespersonDetails = salespersons.find(s => s.id === selectedOrderTaker);
    
    let commissionDisplayInfo = '';
    let commissionAmount = 0;

    if (selectedSalespersonDetails && selectedSalespersonDetails.commission) {
        if (selectedSalespersonDetails.commission.type === "percentage") {
            commissionAmount = totalOrderAmount * ((selectedSalespersonDetails.commission.percentageRate || 0) / 100);
            commissionDisplayInfo = `(${selectedSalespersonDetails.commission.percentageRate}%)`;
        } else if (selectedSalespersonDetails.commission.type === "fixed") {
            commissionAmount = orderProducts.reduce((acc, p) => {
                let itemCommission = 0;
                const productDetails = products.find(prod => prod.id === p.productId); 
                if (productDetails) { 
                    if (productDetails.type === 'sheet' && selectedSalespersonDetails.commission.fixedSheetRate != null) { 
                        const quantity = parseFloat(p.quantity);
                        const squareMeters = p.squareMeters; 
                        if(!isNaN(quantity) && !isNaN(squareMeters)) {
                             itemCommission = quantity * squareMeters * selectedSalespersonDetails.commission.fixedSheetRate;
                        }
                    } else if (productDetails.type === 'bag' && selectedSalespersonDetails.commission.fixedBagRate != null) { 
                        const quantity = parseFloat(p.quantity);
                        if(!isNaN(quantity)) {
                            itemCommission = quantity * selectedSalespersonDetails.commission.fixedBagRate;
                        }
                    }
                }
                return acc + itemCommission;
            }, 0);
            commissionDisplayInfo = '(Fixed Rates Applied)';
        }
    }


    return (
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Create New Order</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Order Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="order-customer-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Customer:</label>
              <select id="order-customer-select" value={selectedOrderCustomer} onChange={(e) => setSelectedOrderCustomer(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700">
                <option value="">-- Select a Customer --</option>
                {customers.map(customer => (<option key={customer.id} value={customer.id}>{customer.name}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="order-taker-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Taker (Salesperson):</label>
              <select id="order-taker-select" value={selectedOrderTaker} onChange={(e) => setSelectedOrderTaker(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700">
                <option value="">-- Select Salesperson --</option>
                {salespersons.map(sp => {
                    let commissionDisplay = '';
                    if (sp.commission?.type === 'percentage') {
                        commissionDisplay = `${sp.commission.percentageRate}%`;
                    } else if (sp.commission?.type === 'fixed') {
                        let rates = [];
                        if (sp.commission.fixedSheetRate != null) rates.push(`Sheet: ৳${sp.commission.fixedSheetRate}/sqm`);
                        if (sp.commission.fixedBagRate != null) rates.push(`Bag: ৳${sp.commission.fixedBagRate}/pc`);
                        commissionDisplay = rates.join(', ') || 'Fixed (No rates set)';
                    } else {
                        commissionDisplay = 'N/A';
                    }
                    return (<option key={sp.id} value={sp.id}>{sp.name} ({commissionDisplay})</option>)
                })}
              </select>
            </div>
          </div>

          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 mt-6">Products for Order</h4>
          {orderProducts.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-x-4 gap-y-2 mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50 items-end">
              <div className="md:col-span-2 lg:col-span-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Product (GSM)</label>
                <select value={item.productId} onChange={(e) => handleOrderProductChange(item.id, 'productId', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-gray-600">
                  <option value="">Select Product</option>
                  {products.map(product => (<option key={product.id} value={product.id}>{product.gsm} ({product.type}) (Stock: {product.stock})</option>))}
                </select>
              </div>
              <div className="lg:col-span-1"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Qty ({item.type === 'sheet' ? 'Rolls' : 'Pcs'})</label><input type="number" value={item.quantity} onChange={(e) => handleOrderProductChange(item.id, 'quantity', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-600" placeholder="Qty"/></div>
              {item.type === 'sheet' && (<>
                <div className="lg:col-span-1"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Length (m)</label><input type="number" value={item.length} onChange={(e) => handleOrderProductChange(item.id, 'length', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-600" placeholder="L"/></div>
                <div className="lg:col-span-1"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Width (m)</label><input type="number" value={item.width} onChange={(e) => handleOrderProductChange(item.id, 'width', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-600" placeholder="W"/></div>
                <div className="lg:col-span-1"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Sq. Meters</label><input type="text" value={item.squareMeters ? item.squareMeters.toFixed(2) : '0.00'} readOnly className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-500"/></div>
              </>)}
              {item.type === 'bag' && <div className="md:col-span-2 lg:col-span-3"></div>}
              <div className="lg:col-span-1"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Unit Price (৳)</label>
                <input type="number" value={item.unitPrice} onChange={(e) => handleOrderProductChange(item.id, 'unitPrice', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-600"/>
              </div>
              <div className="lg:col-span-1"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Line Total (৳)</label><input type="text" value={`৳ ${item.lineTotal ? item.lineTotal.toFixed(2) : '0.00'}`} readOnly className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-500 font-semibold"/></div>
              <button onClick={() => removeOrderProductRow(item.id)} className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-300 ease-in-out text-sm self-end h-10">Remove</button>
            </div>
          ))}
          <button onClick={addOrderProductRow} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out text-sm mb-4">Add Product Row</button>
          
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 text-right">
            <p className="text-md font-medium text-gray-700 dark:text-gray-300">Total Order Amount: <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">৳ {totalOrderAmount.toFixed(2)}</span></p>
            {selectedOrderTaker && <p className="text-sm text-gray-600 dark:text-gray-400">Salesperson Commission {commissionDisplayInfo}: <span className="font-semibold">৳ {commissionAmount.toFixed(2)}</span></p>}
          </div>

          <button onClick={handleCreateOrder} className="w-full mt-8 bg-orange-600 text-white p-3 rounded-md text-lg font-semibold hover:bg-orange-700 transition duration-300 ease-in-out shadow-lg" disabled={pageLoading || userRole !== 'admin'}>{pageLoading ? 'Creating Order...' : 'Create Order & Update Stock'}</button>
        </div>
      </div>
    );
  };
  const renderOrders = () => {
    console.log("[Render] renderOrders called");
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) || order.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase());
        const orderDate = new Date(order.orderDate);
        const startDate = orderStartDateFilter ? new Date(orderStartDateFilter) : null;
        const endDate = orderEndDateFilter ? new Date(orderEndDateFilter) : null;
        if (startDate) startDate.setHours(0,0,0,0);
        if (endDate) endDate.setHours(23,59,59,999);
        const matchesDateRange = (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);
        return (orderStatusFilter === 'All' || order.status === orderStatusFilter) && matchesSearch && matchesDateRange;
    });

    const indexOfLastItem = currentOrderPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const exportOrdersToCSV = () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Order No.,Date,Customer,Order Taker,Total Amount (৳),Commission (৳),Status\n";
      filteredOrders.forEach(order => {
        csvContent += `${order.orderNumber},${new Date(order.orderDate).toLocaleDateString()},"${order.customerName}",${order.orderTakerName || '-'},${order.totalAmount.toFixed(2)},${order.commissionAmount ? order.commissionAmount.toFixed(2) : '0.00'},${order.status}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "orders_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">All Orders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <input type="text" placeholder="Search by Order No. or Customer" value={orderSearchQuery} onChange={(e) => {setOrderSearchQuery(e.target.value); setCurrentOrderPage(1);}} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"/>
            <select value={orderStatusFilter} onChange={(e) => {setOrderStatusFilter(e.target.value); setCurrentOrderPage(1);}} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700">
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
            </select>
            <input type="date" value={orderStartDateFilter} onChange={(e) => {setOrderStartDateFilter(e.target.value); setCurrentOrderPage(1);}} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700" title="Start Date"/>
            <input type="date" value={orderEndDateFilter} onChange={(e) => {setOrderEndDateFilter(e.target.value); setCurrentOrderPage(1);}} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700" title="End Date"/>
        </div>
        <div className="mb-4 flex justify-end">
            <button onClick={exportOrdersToCSV} className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-lg">Export CSV</button>
        </div>
        <div className="bg-white dark:bg-gray-800 p-2 md:p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Existing Orders</h3>
          {currentItems.length === 0 ? <p className="text-gray-600 dark:text-gray-300">No orders found.</p> : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Order No.</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Order Taker</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total (৳)</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Commission (৳)</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Products</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((order) => (
                  <React.Fragment key={order.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">{order.orderNumber}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{order.customerName}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{order.orderTakerName || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">৳{order.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">৳{(order.commissionAmount || 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm">
                        <select value={order.status} onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)} className="p-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-indigo-500" disabled={userRole !== 'admin'}>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                        <ul className="list-disc list-inside text-xs">
                            {order.products.map((p, idx) => ( <li key={idx}>{p.gsm} ({p.quantity} {p.type === 'sheet' ? 'Rolls' : 'Pcs'})</li> ))}
                        </ul>
                    </td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">
                      {/* <button onClick={() => handleEditOrder(order)} className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs hover:bg-yellow-600 mr-1 transition-colors" disabled={userRole !== 'admin'}>Edit</button> */}
                      <button onClick={() => handleDeleteOrder(order.id)} className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors" disabled={userRole !== 'admin'}>Delete</button>
                    </td>
                  </tr>
                  </React.Fragment>
                ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (<div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-x-1">
              <button onClick={() => setCurrentOrderPage(prev => Math.max(1, prev - 1))} disabled={currentOrderPage === 1} className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentOrderPage(page)} className={`px-3 py-1 rounded-md text-sm ${currentOrderPage === page ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'} transition-colors`}>{page}</button>
              ))}
              <button onClick={() => setCurrentOrderPage(prev => Math.min(totalPages, prev + 1))} disabled={currentOrderPage === totalPages} className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">Next</button>
          </div>)}
        </div>
      </div>
    );
  };
  const renderSalespersons = () => {
    console.log("[Render] renderSalespersons called");
    const indexOfLastItem = currentSalespersonPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = salespersons.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(salespersons.length / itemsPerPage);

    const exportSalespersonsToCSV = () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Name,Commission Type,Percentage Rate (%),Fixed Sheet Rate (BDT/sq.m),Fixed Bag Rate (BDT/pc)\n";
      salespersons.forEach(sp => {
        let commissionType = sp.commission?.type || 'N/A';
        let percentageRate = sp.commission?.type === 'percentage' ? sp.commission.percentageRate : '-';
        let sheetRate = sp.commission?.type === 'fixed' && sp.commission.fixedSheetRate != null ? sp.commission.fixedSheetRate : '-';
        let bagRate = sp.commission?.type === 'fixed' && sp.commission.fixedBagRate != null ? sp.commission.fixedBagRate : '-';
        csvContent += `${sp.name},${commissionType},${percentageRate},${sheetRate},${bagRate}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "salespersons_commission_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    return (
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Salesperson Management</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Add New Salesperson</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Salesperson Name" value={newSalespersonName} onChange={(e) => setNewSalespersonName(e.target.value)} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
            <div>
              <label htmlFor="commissionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commission Type</label>
              <select id="commissionType" value={newSalespersonCommissionType} onChange={(e) => setNewSalespersonCommissionType(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Rate</option>
              </select>
            </div>
          </div>
          {newSalespersonCommissionType === 'percentage' && (
            <div className="mb-4">
              <label htmlFor="percentageRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Percentage Rate (%)</label>
              <input type="number" id="percentageRate" placeholder="e.g., 5 for 5%" value={newSalespersonPercentageRate} onChange={(e) => setNewSalespersonPercentageRate(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
            </div>
          )}
          {newSalespersonCommissionType === 'fixed' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="fixedSheetRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sheet Rate (BDT/sq.m)</label>
                <input type="number" id="fixedSheetRate" placeholder="e.g., 2.5" value={newSalespersonFixedSheetRate} onChange={(e) => setNewSalespersonFixedSheetRate(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
              </div>
              <div>
                <label htmlFor="fixedBagRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bag Rate (BDT/piece)</label>
                <input type="number" id="fixedBagRate" placeholder="e.g., 1.0" value={newSalespersonFixedBagRate} onChange={(e) => setNewSalespersonFixedBagRate(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
              </div>
            </div>
          )}
          <button onClick={handleAddSalesperson} className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-lg" disabled={pageLoading || userRole !== 'admin'}>{pageLoading ? 'Adding...' : 'Add Salesperson'}</button>
        </div>

        <div className="mb-4 flex justify-end">
            <button onClick={exportSalespersonsToCSV} className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-lg">Export CSV</button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-2 md:p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Existing Salespersons</h3>
            {currentItems.length === 0 ? <p className="text-gray-600 dark:text-gray-300">No salespersons added yet.</p> : (
            <div className="overflow-x-auto"><table className="min-w-full">
                <thead className="bg-gray-100 dark:bg-gray-700"><tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Commission Details</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{currentItems.map(sp => (
                    <tr key={sp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">{sp.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                            {sp.commission?.type === 'percentage' ? `${sp.commission.percentageRate}% of Total Order` : 
                             sp.commission?.type === 'fixed' ? 
                                `Sheet: ৳${sp.commission.fixedSheetRate ?? 'N/A'}/sq.m, Bag: ৳${sp.commission.fixedBagRate ?? 'N/A'}/pc` 
                                : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm whitespace-nowrap">
                            <button onClick={() => handleDeleteSalesperson(sp.id)} className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors" disabled={userRole !== 'admin'}>Delete</button>
                        </td>
                    </tr>))}
                </tbody>
            </table></div>
            )}
            {totalPages > 1 && (<div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-x-1">
              <button onClick={() => setCurrentSalespersonPage(prev => Math.max(1, prev - 1))} disabled={currentSalespersonPage === 1} className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentSalespersonPage(page)} className={`px-3 py-1 rounded-md text-sm ${currentSalespersonPage === page ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'} transition-colors`}>{page}</button>
              ))}
              <button onClick={() => setCurrentSalespersonPage(prev => Math.min(totalPages, prev + 1))} disabled={currentSalespersonPage === totalPages} className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">Next</button>
          </div>)}
        </div>
      </div>
    );
  };
  const renderReports = () => {
    console.log("[Render] renderReports called");
    return (
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Reports</h2>
        <div className="space-y-8">
          {renderCommissionReport()}
          {renderCustomerSpendingReport()}
        </div>
      </div>
    );
  };
  const renderSettings = () => {
    console.log("[Render] renderSettings called");
    const handleSettingChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;
        if (name === "taxRate") processedValue = parseFloat(value) || 0;
        if (name === "lowStockThreshold") processedValue = parseInt(value) || 0;
        setTempBusinessSettings(prev => ({ ...prev, [name]: processedValue }));
    };
    
    return (
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Application Settings</h2>
        
        {userRole === 'admin' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Business Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Name</label>
              <input type="text" id="businessName" name="name" value={tempBusinessSettings.name || ''} onChange={handleSettingChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
            </div>
             <div>
              <label htmlFor="officeAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Office Address</label>
              <input type="text" id="officeAddress" name="officeAddress" value={tempBusinessSettings.officeAddress || ''} onChange={handleSettingChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
            </div>
            <div>
              <label htmlFor="factoryAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Factory Address</label>
              <input type="text" id="factoryAddress" name="factoryAddress" value={tempBusinessSettings.factoryAddress || ''} onChange={handleSettingChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
            </div>
            <div>
              <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input type="text" id="businessPhone" name="phone" value={tempBusinessSettings.phone || ''} onChange={handleSettingChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
            </div>
            <div>
              <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" id="businessEmail" name="email" value={tempBusinessSettings.email || ''} onChange={handleSettingChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
            </div>
            <div>
              <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Tax Rate (%)</label>
              <input type="number" id="taxRate" name="taxRate" value={tempBusinessSettings.taxRate || 0} onChange={handleSettingChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
            </div>
            <div>
              <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Low Stock Threshold</label>
              <input type="number" id="lowStockThreshold" name="lowStockThreshold" value={tempBusinessSettings.lowStockThreshold || 0} onChange={handleSettingChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
            </div>
             <div className="md:col-span-2">
              <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo URL</label>
              <input type="text" id="logoUrl" name="logoUrl" value={tempBusinessSettings.logoUrl || ''} onChange={handleSettingChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
            </div>
          </div>
          <div className="mt-6">
            <button onClick={handleUpdateSettings} className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 transition duration-300 ease-in-out shadow-lg" disabled={pageLoading || userRole !== 'admin'}>
              {pageLoading ? 'Saving...' : 'Save Business Settings'}
            </button>
          </div>
        </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-8">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Change Password</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                    <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
                </div>
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
                </div>
                <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                    <input type="password" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"/>
                </div>
                <button onClick={handleChangePassword} className="w-full bg-orange-600 text-white p-3 rounded-md hover:bg-orange-700 transition duration-300 ease-in-out shadow-lg" disabled={pageLoading}>
                    {pageLoading ? 'Updating...' : 'Change Password'}
                </button>
            </div>
        </div>
      </div>
    );
  };
  const renderUserManagement = () => {
    console.log("[Render] renderUserManagement called");
    const indexOfLastItem = currentUserManagementPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = allUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(allUsers.length / itemsPerPage);

    return (
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">User Management</h2>
        <div className="bg-white dark:bg-gray-800 p-2 md:p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Registered Users</h3>
          {currentItems.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No users found or data is loading.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Registered On</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Current Role</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">{user.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                        <select 
                          defaultValue={user.role} 
                          onChange={(e) => handleUpdateUserStatusAndRole(user.uid, user.status, e.target.value)}
                          className="p-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-indigo-500"
                          disabled={userRole !== 'admin'}
                        >
                          <option value="admin">Admin</option>
                          <option value="customer">Customer</option>
                          <option value="viewer">Viewer</option>
                          <option value="pending_approval" disabled>Pending Approval</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                            user.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
                            user.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm whitespace-nowrap">
                        {user.status !== 'approved' && (
                          <button onClick={() => handleUpdateUserStatusAndRole(user.uid, 'approved', user.role === 'pending_approval' ? 'customer' : user.role)} className="bg-green-500 text-white px-2 py-1 rounded-md text-xs hover:bg-green-600 mr-1 transition-colors" disabled={userRole !== 'admin'}>Approve</button>
                        )}
                        {user.status !== 'rejected' && (
                          <button onClick={() => handleUpdateUserStatusAndRole(user.uid, 'rejected', 'viewer')} className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 mr-1 transition-colors" disabled={userRole !== 'admin'}>Reject</button>
                        )}
                         {user.status === 'rejected' && (
                          <button onClick={() => handleUpdateUserStatusAndRole(user.uid, 'pending', 'pending_approval')} className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs hover:bg-yellow-600 transition-colors" disabled={userRole !== 'admin'}>Re-Pend</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (<div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-x-1">
              <button onClick={() => setCurrentUserManagementPage(prev => Math.max(1, prev - 1))} disabled={currentUserManagementPage === 1} className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentUserManagementPage(page)} className={`px-3 py-1 rounded-md text-sm ${currentUserManagementPage === page ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'} transition-colors`}>{page}</button>
              ))}
              <button onClick={() => setCurrentUserManagementPage(prev => Math.min(totalPages, prev + 1))} disabled={currentUserManagementPage === totalPages} className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">Next</button>
          </div>)}
        </div>
      </div>
    );
  };


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

  if (!userId) { // Login Screen
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
            {isLoginView ? 'Login to ' : 'Sign Up for '} <span className="text-indigo-600">{businessSettings.name || "BTTAL"}</span>
          </h2>
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-4 text-center">{error}</p>}
          <input type="email" placeholder="Email Address" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"/>
          <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md mb-6 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"/>
          <button onClick={() => handleAuth(!isLoginView)} className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 font-semibold transition-colors duration-300" disabled={pageLoading}>
            {pageLoading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
          </button>
          <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => {setIsLoginView(!isLoginView); setError(null);}} className="text-indigo-600 hover:text-indigo-500 dark:hover:text-indigo-400 font-semibold">
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Account Pending Approval</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Your account has been created and is awaiting approval from an administrator. Please check back later.</p>
          <button onClick={handleLogout} className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">Logout</button>
        </div>
      </div>
    );
  }
  if (userAccountStatus === 'rejected' && userRole === 'pending_viewer') {
     return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Account Rejected</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Your account registration has been rejected. Please contact support for more information.</p>
          <button onClick={handleLogout} className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">Logout</button>
        </div>
      </div>
    );
  }


  const navItems = [
    { name: 'Dashboard', page: 'dashboard', icon: <HomeIcon />, roles: ['admin', 'customer'] },
    { name: 'Customers', page: 'customers', icon: <UsersIcon />, roles: ['admin'] },
    { name: 'Products', page: 'products', icon: <PackageIcon />, roles: ['admin'] },
    { name: 'Create Invoice', page: 'createInvoice', icon: <DocumentPlusIcon />, roles: ['admin'] },
    { name: 'All Invoices', page: 'invoices', icon: <DocumentTextIcon />, roles: ['admin', 'customer'] }, 
    { name: 'Create Order', page: 'createOrder', icon: <PlusCircleIcon />, roles: ['admin'] },
    { name: 'All Orders', page: 'orders', icon: <ClipboardDocumentListIcon />, roles: ['admin', 'customer'] }, 
    { name: 'Salespersons', page: 'salespersons', icon: <UserGroupIcon />, roles: ['admin'] }, 
    { name: 'Reports', page: 'reports', icon: <ChartBarIcon />, roles: ['admin'] },
    { name: 'User Management', page: 'userManagement', icon: <UserGroupIcon/>, roles: ['admin'] }, 
    { name: 'Settings', page: 'settings', icon: <CogIcon />, roles: ['admin', 'customer'] }, 
  ];

  const доступныеNavItems = navItems.filter(item => item.roles.includes(userRole));


  return (
    <div className={`flex h-screen font-sans antialiased ${darkMode ? 'dark' : ''}`}>
      <style>{` @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'); body { font-family: 'Inter', sans-serif; } .sidebar-transition { transition: width 0.2s ease-in-out; } ::-webkit-scrollbar { width: 8px; height: 8px; } ::-webkit-scrollbar-thumb { background: ${darkMode ? '#4B5563' : '#A0AEC0'}; border-radius: 4px; } ::-webkit-scrollbar-track { background: ${darkMode ? '#1F2937' : '#E2E8F0'}; } `}</style>

      {isMessageVisible && (<div className="fixed top-5 right-5 bg-indigo-600 text-white p-4 rounded-lg shadow-xl z-[100] animate-fade-in-down text-sm font-medium">{message}</div>)}

      <aside className={`bg-gray-800 text-gray-200 flex flex-col sidebar-transition shadow-lg ${isSidebarOpen ? 'w-60' : 'w-20'}`}>
        <div className="flex items-center justify-between p-3 border-b border-gray-700 h-16 flex-shrink-0">
          {isSidebarOpen && <span className="text-lg font-bold whitespace-nowrap text-indigo-400">BTTAL</span>}
          <button onClick={toggleSidebar} className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {isSidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </button>
        </div>
        <nav className="flex-1 py-2 px-2 space-y-1.5 overflow-y-auto">
          {доступныеNavItems.map((item) => (
            <button key={item.name} onClick={() => { setCurrentPage(item.page); if (window.innerWidth < 768 && isSidebarOpen) setIsSidebarOpen(false);}} title={isSidebarOpen ? '' : item.name}
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150 ease-in-out group ${currentPage === item.page ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
              <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center ${currentPage === item.page ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{item.icon}</span>
              {isSidebarOpen && <span className="ml-3 whitespace-nowrap">{item.name}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700 mt-auto flex-shrink-0">
            {isSidebarOpen && (<div className="text-xs text-gray-400 mb-2 truncate">
                <p>User: {userEmail}</p><p>Role: <span className="font-semibold">{userRole}</span></p></div>)}
          <button onClick={() => setDarkMode(!darkMode)} title={isSidebarOpen ? '' : (darkMode ? 'Light Mode' : 'Dark Mode')}
            className={`w-full flex items-center px-3 py-2 text-sm rounded-md text-gray-300 hover:bg-gray-700 hover:text-white mb-1 ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{darkMode ? <SunIcon /> : <MoonIcon />}</span>
            {isSidebarOpen && <span className="ml-3 whitespace-nowrap">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={handleLogout} title={isSidebarOpen ? '' : 'Logout'}
            className={`w-full flex items-center px-3 py-2 text-sm rounded-md text-red-400 hover:bg-red-600 hover:text-white ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center"><ArrowLeftOnRectangleIcon /></span>
            {isSidebarOpen && <span className="ml-3 whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 h-16 flex items-center border-b dark:border-gray-700 flex-shrink-0">
          <button onClick={toggleSidebar} className="md:hidden p-2 mr-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <MenuIcon />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 capitalize">
            {currentPage.replace(/([A-Z])/g, ' $1').trim()}
          </h1>
        </header>

        {pageLoading && userId && (
            <div className="flex items-center justify-center flex-1">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
                <p className="ml-4 text-lg text-gray-600 dark:text-gray-300">Loading page data...</p>
            </div>
        )}

        {error && userId && !pageLoading && (
        <div className="p-4 m-4 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md relative shadow-md" role="alert">
            <div className="flex">
                <div className="py-1"><svg className="fill-current h-6 w-6 text-red-500 dark:text-red-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/></svg></div>
                <div>
                    <p className="font-bold">Application Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
            <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500">
                <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </button>
        </div>
        )}

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          {console.log("[Render Main] Page:", currentPage, "PageLoading:", pageLoading, "UserID:", userId, "Error:", error)}
          {userId && !pageLoading && !error && userAccountStatus === 'approved' && (
            <>
              {currentPage === 'dashboard' && renderDashboard()}
              {currentPage === 'customers' && userRole === 'admin' && renderCustomers()}
              {currentPage === 'products' && userRole === 'admin' && renderProducts()}
              {currentPage === 'createInvoice' && userRole === 'admin' && renderCreateInvoice()}
              {currentPage === 'invoices' && (userRole === 'admin' || userRole === 'customer') && renderInvoices()}
              {currentPage === 'createOrder' && userRole === 'admin' && renderCreateOrder()}
              {currentPage === 'orders' && (userRole === 'admin' || userRole === 'customer') && renderOrders()}
              {currentPage === 'salespersons' && userRole === 'admin' && renderSalespersons()}
              {currentPage === 'reports' && userRole === 'admin' && renderReports()}
              {currentPage === 'settings' && (userRole === 'admin' || userRole === 'customer') && renderSettings()}
              {currentPage === 'userManagement' && userRole === 'admin' && renderUserManagement()}
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
