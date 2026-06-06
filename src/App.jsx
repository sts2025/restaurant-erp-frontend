import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Settings, WifiOff, Wifi } from 'lucide-react';

import POSView from './components/POSView';
import AdminView from './components/AdminView';
import TableSelection from './components/TableSelection';
import Receipt from './components/Receipt';
import KitchenTicket from './components/KitchenTicket';
import ShiftReportPrint from './components/ShiftReportPrint';
import BarTicket from "./components/BarTicket";


axios.defaults.baseURL = 'https://restoapi.agileaccounts.me/api';
axios.defaults.headers.common['Accept'] = 'application/json';

export default function App() {
  // =========================
  // AUTH STATE
  // =========================
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // =========================
  // OFFLINE QUEUE STATE
  // =========================
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // =========================
  // APP STATE
  // =========================
  const [view, setView] = useState('pos');

  // =========================
  // AUTO REDIRECT NON-ADMINS
  // =========================
  useEffect(() => {
    if (!user) return;

    if (user.role === 'cashier') setView('pos');
    if (user.role === 'waiter') setView('waiter');
    if (user.role === 'kitchen') setView('kitchen');
    if (user.role === 'bar') setView('bar');
  }, [user]);

  const [data, setData] = useState({ products: [] });
  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [activeShift, setActiveShift] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);
  const [showSplitBill, setShowSplitBill] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTableId, setTransferTableId] = useState('');
  const [heldOrders, setHeldOrders] = useState([]);
  const [shiftReport, setShiftReport] = useState(null);
  const [closedShift, setClosedShift] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [tables, setTables] = useState([]);
  const [cashAmount, setCashAmount] = useState(0);
  const [orderNotes, setOrderNotes] =useState('');
  const [billData, setBillData] = useState(null);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeTableId, setMergeTableId] = useState('');

  // =========================
  // TOTALS
  // =========================

useEffect(() => {

  if (!billData) return;

  const timer = setTimeout(() => {

    window.print();

  }, 500);

  return () => clearTimeout(timer);

}, [billData]);



  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const total = Math.max(0, subtotal - Number(discount || 0));
  const change = Math.max(0, Number(amountPaid || 0) - total);
  const splitAmount = total / splitCount;

  // =========================
  // OFFLINE QUEUE FUNCTIONS
  // =========================
  const saveOfflineSale = (sale) => {
    const queue = JSON.parse(localStorage.getItem('offline_sales') || '[]');
    queue.push(sale);
    localStorage.setItem('offline_sales', JSON.stringify(queue));
    setPendingSyncCount(queue.length);

    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = `💾 Sale saved offline (${queue.length} pending)`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };

  const syncOfflineSales = async () => {
    const queue = JSON.parse(localStorage.getItem('offline_sales') || '[]');
    if (!queue.length) return;

    try {
      let syncedCount = 0;
      for (const sale of queue) {
        await axios.post('/sales', sale);
        syncedCount++;
        setPendingSyncCount(queue.length - syncedCount);
      }
      localStorage.removeItem('offline_sales');
      setPendingSyncCount(0);

      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `✅ Synced ${syncedCount} offline sale(s) successfully!`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (err) {
      console.log('Sync pending - will retry when connection is stable');
      setPendingSyncCount(queue.length);
    }
  };

  const mergeTables = async (targetTableId) => {

  if (!selectedTable) {
    alert('No table selected');
    return;
  }

  try {

    await axios.post(
      '/tables/merge',
      {
        source_table_id: selectedTable.id,
        target_table_id: targetTableId
      }
    );

    await loadTables();

    setShowMergeModal(false);

    alert('Tables merged successfully');

  } catch (error) {

    alert(
      error.response?.data?.message ||
      'Merge failed'
    );

  }
};

  // =========================
  // TABLE TRANSFER FUNCTIONS
  // =========================
  const openTransferTable = () => {
    if (!selectedTable) {
      alert('No table selected');
      return;
    }
    setShowTransferModal(true);
  };

  const transferTable = async (toTableId) => {
    if (!toTableId) {
      alert('Please select a destination table');
      return;
    }

    try {
      await axios.post('/tables/transfer', {
        from_table_id: selectedTable.id,
        to_table_id: toTableId
      });

      const targetTable = tables.find(t => t.id === toTableId);
      setSelectedTable(targetTable);
      await loadTables();
      setShowTransferModal(false);
      alert('Table transferred successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Transfer failed');
    }
  };

  // =========================
  // BILL & RECEIPT FUNCTIONS
  // =========================
const printBill = () => {

  console.log("CART", cart);

  setBillData({
    table: selectedTable?.name || 'Takeaway',
    items: cart,
    total,
    notes: orderNotes,
    printedAt: new Date()
  });

};

  useEffect(() => {
    if (receipt) {
      const timer = setTimeout(() => {
        setReceipt(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [receipt]);

  const openSplitBill = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    setShowSplitBill(true);
  };

  // =========================
  // HOLD ORDER FUNCTIONS
  // =========================
  const holdOrder = () => {
    if (cart.length === 0) {
      alert('Cart is empty. Nothing to hold.');
      return;
    }

    if (!selectedTable) {
      alert('Please select a table first.');
      return;
    }

    const heldOrder = {
      id: Date.now(),
      tableId: selectedTable.id,
      tableName: selectedTable.name,
      cart: [...cart],
      timestamp: new Date().toISOString()
    };

    setHeldOrders([...heldOrders, heldOrder]);
    setCart([]);
    setSelectedTable(null);
    setTables(prev =>
      prev.map(t =>
        t.id === selectedTable.id
          ? { ...t, status: 'available' }
          : t
      )
    );
    alert('Order held successfully!');
  };

  const resumeOrder = (heldOrder) => {
    const table = tables.find(t => t.id === heldOrder.tableId);
    if (!table) {
      alert('Table no longer exists');
      return;
    }

    if (table.status === 'occupied') {
      alert('This table is already occupied. Please choose another order.');
      return;
    }

    setCart(heldOrder.cart);
    setSelectedTable(table);
    setTables(prev =>
      prev.map(t =>
        t.id === table.id
          ? { ...t, status: 'occupied' }
          : t
      )
    );
    setHeldOrders(heldOrders.filter(o => o.id !== heldOrder.id));
  };

  // =========================
  // FETCH FUNCTIONS
  // =========================
  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      setData({ products: res.data.data || res.data });
    } catch (err) {
      console.error('Failed to load products:', err);
      alert('Failed to load products');
    }
  };

  const loadTables = async () => {
    try {
      const res = await axios.get('/tables');
      console.log('TABLE RESPONSE:', res.data);
      setTables(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error('Failed to load tables:', err);
      setTables([]);
    }
  };

  const fetchShift = async () => {
    try {
      const res = await axios.get('/shifts/active');
      if (res.data && res.data.id) {
        setActiveShift(res.data);
      } else {
        setActiveShift(null);
      }
    } catch (error) {
      setActiveShift(null);
    }
  };

  const fetchSalesHistory = async () => {
    try {
      const res = await axios.get('/sales');
      setSalesHistory(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to load sales', err);
    }
  };

  const reprintReceipt = async (saleId) => {
    try {
      const res = await axios.get(`/sales/${saleId}/reprint`);
      setReceipt(res.data);
    } catch (err) {
      alert('Failed to reprint receipt');
    }
  };

  const voidSale = async (saleId) => {
    const confirmed = window.confirm('Are you sure you want to void this sale?');
    if (!confirmed) return;

    try {
      await axios.post(`/sales/${saleId}/void`);
      alert('Sale voided successfully');
      fetchSalesHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to void sale');
    }
  };

  // =========================
  // CART FUNCTIONS
  // =========================
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [{ ...product, quantity: 1 }, ...prev];
    });
  };

  // =========================
  // CHECKOUT FUNCTION
  // =========================
  const handleCheckout = async () => {
    if (isProcessing) return;

    if (!activeShift) {
      alert('Please clock in first');
      return;
    }

    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    const paid = Number(amountPaid || 0);
    if (!paid || paid < total) {
      alert(`Customer payment (${paid.toLocaleString()} UGX) is less than total bill.\n\nTotal: ${total.toLocaleString()} UGX`);
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        items: cart.map(i => ({
          product_id: i.id,
          quantity: i.quantity,
          price: i.price
        })),
        paid_amount: paid,
        notes: orderNotes,
        payment_method: paymentMethod,
        discount: discount,
        table_id: selectedTable?.id || null,
        shift_id: activeShift.id
      };

      if (!navigator.onLine) {
        saveOfflineSale(payload);
        alert('📱 Sale saved offline. Will sync automatically when connection is restored.');

        const tempReceipt = {
          id: 'offline-' + Date.now(),
          created_at: new Date().toISOString(),
          items: cart.map(item => ({
            product: { name: item.name, price: item.price },
            quantity: item.quantity,
            price: item.price
          })),
          subtotal,
          discount,
          total,
          paid_amount: paid,
          payment_method: paymentMethod,
          change,
          table: selectedTable ? { name: selectedTable.name } : null,
          cashier: user ? { name: user.name } : null,
          is_offline: true
        };

        setReceipt(tempReceipt);
        setCart([]);
        setAmountPaid('');
        setDiscount(0);
        setOrderNotes('');

        if (selectedTable) {
          setTables(prev =>
            prev.map(t =>
              t.id === selectedTable.id
                ? { ...t, status: 'available' }
                : t
            )
          );
          setSelectedTable(null);
        }

        setIsProcessing(false);
        return;
      }

      const res = await axios.post('/sales', payload);
      console.log('SALE RESPONSE:', res.data);

      if (res.data.receipt) {
        setReceipt(res.data.receipt);
      }

      setCart([]);
      setAmountPaid('');
      setDiscount(0);
      setOrderNotes('');

      if (selectedTable) {
        setTables(prev =>
          prev.map(t =>
            t.id === selectedTable.id
              ? { ...t, status: 'available' }
              : t
          )
        );
        setSelectedTable(null);
      }
    } catch (err) {
      console.error('CHECKOUT ERROR:', err);

      if (err.response) {
        console.log(err.response.data);
        alert(err.response.data.message || JSON.stringify(err.response.data.errors || err.response.data));
      } else if (err.request) {
      const payload = {
  items: cart.map(i => ({
    product_id: i.id,
    quantity: i.quantity,
    price: i.price
  })),
  paid_amount: paid,
  payment_method: paymentMethod,
  discount: discount,
  notes: orderNotes,
  table_id: selectedTable?.id || null,
  shift_id: activeShift.id
};
        saveOfflineSale(payload);
        alert('⚠️ Network error. Sale has been saved offline and will sync when connection is restored.');

        const tempReceipt = {
          id: 'offline-' + Date.now(),
          created_at: new Date().toISOString(),
          items: cart.map(item => ({
            product: { name: item.name, price: item.price },
            quantity: item.quantity,
            price: item.price
          })),
          subtotal,
          discount,
          total,
          paid_amount: Number(amountPaid),
          payment_method: paymentMethod,
          change,
          table: selectedTable ? { name: selectedTable.name } : null,
          cashier: user ? { name: user.name } : null,
          is_offline: true
        };
        setReceipt(tempReceipt);

        setCart([]);
        setAmountPaid('');
        setDiscount(0);
        setOrderNotes('');

        if (selectedTable) {
          setTables(prev =>
            prev.map(t =>
              t.id === selectedTable.id
                ? { ...t, status: 'available' }
                : t
            )
          );
          setSelectedTable(null);
        }
      } else {
        alert('Error: ' + err.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================
  // SHIFT FUNCTIONS
  // =========================
  const handleClockOut = async () => {
    if (!activeShift) {
      alert('No active shift to close');
      return;
    }

    const amount = prompt('Enter Closing Cash Amount', '0');
    if (amount === null) return;

    try {
      const closeRes = await axios.post('/shifts/close', {
        closing_cash: Number(amount)
      });

      const reportRes = await axios.get('/reports/daily');
      setClosedShift(closeRes.data.shift);
      setShiftReport(reportRes.data.data);
      setActiveShift(null);
      setCashAmount(0);
      alert('Shift closed successfully!');
    } catch (err) {
      console.error('Failed to close shift:', err);
      alert('Failed to close shift: ' + (err.response?.data?.message || err.message));
    }
  };

  const openShift = async () => {
    const amount = prompt('Enter Starting Cash Amount', '0');
    if (amount === null) return;

    try {
      console.log('Opening shift...');
      const res = await axios.post('/shifts/open', {
        starting_cash: Number(amount)
      });
      console.log('SHIFT OPEN RESPONSE:', res.data);
      setActiveShift(res.data);
      fetchShift();
      alert('Shift opened successfully');
    } catch (err) {
      console.error('SHIFT OPEN ERROR:', err.response?.data);
      alert(JSON.stringify(err.response?.data || err.message));
    }
  };

  // =========================
  // LOGIN/LOGOUT FUNCTIONS
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    try {
      const res = await axios.post('/login', {
        email,
        password,
        device_name: 'POS-Terminal-1'
      });

      const token = res.data.data.token;
      localStorage.setItem('pos_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(res.data.data.user);
      console.log('Logged in user:', res.data.data.user);
      setEmail('');
      setPassword('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      alert(errorMessage);
      console.error('Login error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pos_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setCart([]);
    setDiscount(0);
    setOrderNotes('');
    setShowDiscountModal(false);
    setSelectedTable(null);
    setActiveShift(null);
    setReceipt(null);
    setHeldOrders([]);
    setShiftReport(null);
    setClosedShift(null);
  };

  const hasAdminAccess = () => {
    return user?.role === 'admin' || user?.role === 'manager';
  };

  // =========================
  // EFFECTS
  // =========================

  useEffect(() => {

  if (!billData) return;

  const timer = setTimeout(() => {
    window.print();
  }, 500);

  return () => clearTimeout(timer);

}, [billData]);

  useEffect(() => {
    const token = localStorage.getItem('pos_token');
    if (!token) {
      setLoadingAuth(false);
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.get('/me')
      .then((res) => {
        console.log('User data from /me:', res.data);
        setUser(res.data.data);
      })
      .catch(() => {
        localStorage.removeItem('pos_token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      })
      .finally(() => {
        setLoadingAuth(false);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchProducts();
    loadTables();
    fetchShift();
  }, [user]);

  useEffect(() => {
    if (view === 'admin') {
      fetchSalesHistory();
    }
  }, [view]);

  useEffect(() => {
    const queue = JSON.parse(localStorage.getItem('offline_sales') || '[]');
    setPendingSyncCount(queue.length);
    if (queue.length > 0 && navigator.onLine) {
      syncOfflineSales();
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `🟢 Back Online - Syncing offline sales...`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
      syncOfflineSales();
    };

    const handleOffline = () => {
      setIsOnline(false);
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `🔴 You are offline - Sales will be saved locally`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // =========================
  // CATEGORIES
  // =========================
  const categories = [
    'all',
    ...new Set(
      data.products
        ?.map(p => p.category?.name || p.category)
        .filter(Boolean)
    )
  ];

  // =========================
  // LOADING & LOGIN SCREENS
  // =========================
  if (loadingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="bg-white p-8 rounded-2xl w-[400px] shadow-2xl">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Restaurant POS Login
          </h1>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 border p-3 rounded-lg"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-6 border p-3 rounded-lg"
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN APP RENDER
  // =========================
  return (
    <div className="flex h-screen bg-[#F3F4F6]">
      {/* SIDEBAR */}
      <nav className="w-16 bg-[#0B132B] text-white flex flex-col items-center py-6 gap-6">
        <button
          onClick={() => setView('pos')}
          className="hover:bg-blue-600 p-2 rounded transition"
          title="POS View"
        >
          <ShoppingBag />
        </button>

        {hasAdminAccess() && (
          <button
            onClick={() => setView('admin')}
            className="hover:bg-blue-600 p-2 rounded transition"
            title="Admin View"
          >
            <Settings />
          </button>
        )}

        <button
          onClick={handleLogout}
          className="mt-auto hover:bg-red-600 p-2 rounded transition"
          title="Logout"
        >
          🚪
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">
        {(!isOnline || pendingSyncCount > 0) && (
          <div className={`sticky top-0 z-40 px-4 py-2 text-center text-white font-medium ${!isOnline ? 'bg-red-600' : 'bg-yellow-600'
            }`}>
            {!isOnline ? (
              <div className="flex items-center justify-center gap-2">
                <WifiOff className="w-4 h-4" />
                <span>🔴 OFFLINE MODE - Sales will be saved locally ({pendingSyncCount} pending)</span>
              </div>
            ) : pendingSyncCount > 0 ? (
              <div className="flex items-center justify-center gap-2">
                <Wifi className="w-4 h-4" />
                <span>🔄 Syncing {pendingSyncCount} offline sale(s)...</span>
              </div>
            ) : null}
          </div>
        )}

        {view === 'admin' && hasAdminAccess() ? (
          <AdminView
            salesHistory={salesHistory}
            onReprintReceipt={reprintReceipt}
            onVoidSale={voidSale}
          />
        ) : view === 'pos' || view === 'waiter' ? (
          activeShift ? (
            selectedTable ? (
              <POSView
                data={data}
                cart={cart}
                addToCart={addToCart}
                setCart={setCart}
                removeFromCart={removeFromCart}
                handleCheckout={handleCheckout}
                amountPaid={amountPaid}
                setAmountPaid={setAmountPaid}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                discount={discount}
                setDiscount={setDiscount}
                total={total}
                change={change}
                orderNotes={orderNotes}

                setOrderNotes={setOrderNotes}
                activeShift={activeShift}
                openShift={openShift}
                onCloseShift={handleClockOut}
                selectedTable={selectedTable}
                onCloseTable={() => {
                  if (cart.length > 0) {
                    if (window.confirm('You have items in the cart. Are you sure you want to close this table?')) {
                      setSelectedTable(null);
                    }
                  } else {
                    setSelectedTable(null);
                  }
                }}
                isProcessing={isProcessing}
                holdOrder={holdOrder}
                heldOrders={heldOrders}
                resumeOrder={resumeOrder}
                userRole={user?.role}
                categories={categories}
                isOnline={isOnline}
                pendingSyncCount={pendingSyncCount}
                printBill={printBill}
                openSplitBill={openSplitBill}
                openTransferTable={openTransferTable}
                showDiscountModal={showDiscountModal}
                setShowDiscountModal={setShowDiscountModal}
                tables={tables}
                showTransferModal={showTransferModal}
                setShowTransferModal={setShowTransferModal}
                transferTable={transferTable}
                showMergeModal={showMergeModal}
                setShowMergeModal={setShowMergeModal}
                mergeTables={mergeTables}




              />
            ) : (
              <TableSelection
                tables={tables}
                onSelectTable={setSelectedTable}
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="mb-4 text-gray-600">No active shift found</p>
                <button
                  onClick={openShift}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
                >
                  Clock In & Start Shift
                </button>
              </div>
            </div>
          )
        ) : view === 'kitchen' ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Kitchen View</h2>
              <p className="text-gray-600">Kitchen orders will appear here</p>
            </div>
          </div>
        ) : view === 'bar' ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Bar View</h2>
              <p className="text-gray-600">Bar orders will appear here</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to view this page.</p>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {showSplitBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-4">Split Bill</h2>
            <label>Number of People</label>
            <input
              type="number"
              min="2"
              value={splitCount}
              onChange={(e) => setSplitCount(Number(e.target.value))}
              className="border p-2 w-full mb-4"
            />
            <div className="mb-4">Total: {total.toLocaleString()} UGX</div>
            <div className="text-2xl font-bold text-emerald-600">
              Each Pays: {splitAmount.toLocaleString()} UGX
            </div>
            <button
              onClick={() => setShowSplitBill(false)}
              className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Transfer Table</h2>
            <select
              value={transferTableId}
              onChange={(e) => setTransferTableId(e.target.value)}
              className="w-full border p-3 rounded-lg"
            >
              <option value="">Select Destination Table</option>
              {tables
                .filter(t => t.status === 'available')
                .map(table => (
                  <option key={table.id} value={table.id}>
                    {table.name}
                  </option>
                ))}
            </select>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => transferTable(transferTableId)}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPTS & TICKETS */}
      {receipt && (
        <>
          <Receipt receipt={receipt} />
          {receipt.items?.some(item => item.product?.preparation_area === 'kitchen') && (
            <KitchenTicket receipt={receipt} />
          )}
          {receipt.items?.some(item => item.product?.preparation_area === 'bar') && (
            <BarTicket receipt={receipt} />
          )}
        </>
      )}

      

      {shiftReport && closedShift && (
        <ShiftReportPrint
          report={shiftReport}
          shift={closedShift}
          onClose={() => {
            setShiftReport(null);
            setClosedShift(null);
          }}
        />
      )}
    </div>
  );
}