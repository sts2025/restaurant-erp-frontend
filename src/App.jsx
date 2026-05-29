import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Settings } from 'lucide-react';

import POSView from './components/POSView';
import AdminView from './components/AdminView';
import TableSelection from './components/TableSelection';
import Receipt from './components/Receipt';
import KitchenTicket from './components/KitchenTicket';
import ShiftReportPrint from './components/ShiftReportPrint';

axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
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
  // APP STATE
  // =========================
  const [view, setView] = useState('pos');

  // =========================
  // AUTO REDIRECT NON-ADMINS
  // =========================
  useEffect(() => {
    if (!user) return;

    // Cashier role
    if (user.role === 'cashier') {
      setView('pos');
    }

    // Waiter role
    if (user.role === 'waiter') {
      setView('waiter');
    }

    // Kitchen role
    if (user.role === 'kitchen') {
      setView('kitchen');
    }
  }, [user]);

  const [data, setData] = useState({
    products: []
  });

  const [cart, setCart] = useState([]);

  const [selectedTable, setSelectedTable] = useState(null);

  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const [activeShift, setActiveShift] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const [receipt, setReceipt] = useState(null);

  const [heldOrders, setHeldOrders] = useState([]);

  const [shiftReport, setShiftReport] = useState(null);
  const [closedShift, setClosedShift] = useState(null);

  // =========================
  // TABLES
  // =========================
  const [tables, setTables] = useState([]);
  
  // =========================
  // TOTALS
  // =========================
  const subtotal = cart.reduce(
    (sum, item) =>
      sum + (Number(item.price) * item.quantity),
    0
  );

  const total = Math.max(
    0,
    subtotal - Number(discount || 0)
  );

  const change = Math.max(
    0,
    Number(amountPaid || 0) - total
  );

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
    
    // Mark table as available again
    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTable.id
          ? { ...t, status: 'held' }
          : t
      )
    );
    
    alert('Order held successfully!');
  };

  // FIX 1: Resume Order Function - Removed duplicate code
  const resumeOrder = (heldOrder) => {
    // Find the table
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
    
    // Mark table as occupied
    setTables((prev) =>
      prev.map((t) =>
        t.id === table.id
          ? { ...t, status: 'occupied' }
          : t
      )
    );

    // Remove from held orders
    setHeldOrders(
      heldOrders.filter(
        o => o.id !== heldOrder.id
      )
    );
  };

  // =========================
  // AUTH BOOTSTRAP
  // =========================
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

  // =========================
  // LOAD DATA AFTER LOGIN
  // =========================
  useEffect(() => {
    if (!user) return;

    fetchProducts();
    fetchTables();
    fetchShift();
  }, [user]);

  // =========================
  // FETCH PRODUCTS
  // =========================
  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      setData({
        products: res.data.data || res.data
      });
    } catch (err) {
      console.error('Failed to load products:', err);
      alert('Failed to load products');
    }
  };

  const fetchTables = async () => {
    try {
      const res = await axios.get('/tables');
      console.log('TABLE RESPONSE:', res.data);
      setTables(
        Array.isArray(res.data)
          ? res.data
          : res.data.data || []
      );
    } catch (err) {
      console.error('Failed to load tables:', err);
      setTables([]);
    }
  };

  // =========================
  // FETCH ACTIVE SHIFT
  // =========================
  const fetchShift = async () => {
    try {
      const res = await axios.get('/shifts/active');
      setActiveShift(res.data);
    } catch (error) {
      setActiveShift(null);
    }
  };

  // =========================
  // CART FUNCTIONS
  // =========================
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);

      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [
        ...prev,
        {
          ...product,
          quantity: 1
        }
      ];
    });
  };

  // =========================
  // CHECKOUT WITH PROFESSIONAL PRINT LOGIC
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
        items: cart.map((i) => ({
          product_id: i.id,
          quantity: i.quantity,
          price: i.price
        })),
        paid_amount: paid,
        payment_method: paymentMethod,
        discount: discount,
        table_id: selectedTable?.id || null,
        shift_id: activeShift.id
      };

      const res = await axios.post('/sales', payload);
      console.log('SALE RESPONSE:', res.data);

      if (res.data.receipt) {
        setReceipt(res.data.receipt);
        
        // PROFESSIONAL PRINT LOGIC
        // Check if there are kitchen items
        const hasKitchenItems = res.data.receipt.items?.some(
          (item) => item.product?.preparation_area === 'kitchen'
        );

        // Print customer receipt after delay
        setTimeout(() => {
          document.body.className = 'print-receipt';
          window.print();

          // Print kitchen ticket if needed
          if (hasKitchenItems) {
            setTimeout(() => {
              document.body.className = 'print-kitchen';
              window.print();

              if (hasKitchenItems) {

  setTimeout(() => {

    document.body.className = 'print-kitchen';

    window.print();

    setTimeout(() => {
      document.body.className = '';
    }, 500);

  }, 1500);

}

              // Cleanup after kitchen ticket prints
              setTimeout(() => {
                document.body.className = '';
              }, 500);
            }, 1000);
          } else {
            // Cleanup after receipt prints
            setTimeout(() => {
              document.body.className = '';
            }, 500);
          }
        }, 500);
      }

      setCart([]);
      setAmountPaid('');
      setDiscount(0);
      
      if (selectedTable) {
        setTables((prev) =>
          prev.map((t) =>
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
        alert(
          err.response.data.message ||
          JSON.stringify(err.response.data.errors || err.response.data)
        );
      } else if (err.request) {
        alert('Cannot connect to Laravel server. Please check if the server is running.');
      } else {
        alert('Error: ' + err.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // FIX 2 & 5: Improved Clock Out & Open Shift Functions
  const handleClockOut = async () => {
    try {
      // If no active shift, nothing to close
      if (!activeShift) {
        alert('No active shift to close');
        return;
      }

      const closingCash = cashAmount;

      /**
       * CLOSE SHIFT
       */
      const closeRes = await axios.post('/shifts/close', {
        closing_cash: Number(closingCash)
      });

      /**
       * GET REPORT
       */
      const reportRes = await axios.get('/reports/daily');

      /**
       * STORE DATA
       */
      setClosedShift(closeRes.data.shift);
      setShiftReport(reportRes.data.data);

      /**
       * PRINT
       */
      setTimeout(() => {
        document.body.className = 'print-shift';
        window.print();

        setTimeout(() => {
          document.body.className = '';
        }, 500);
      }, 500);

      /**
       * RESET SHIFT
       */
      setActiveShift(null);

      alert('Shift closed successfully!');
    } catch (err) {
      console.error('Failed to close shift:', err);
      alert('Failed to close shift: ' + (err.response?.data?.message || err.message));
    }
  };

  // FIX 5: Open Shift - Checks for existing active shift first
  const openShift = async () => {
    if (activeShift) {
      alert('You already have an open shift');
      return;
    }

    try {
      const res = await axios.post('/shifts/open', {
        starting_cash: 0
      });
      setActiveShift(res.data);
      alert('Shift started successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to open shift';
      alert(errorMessage);
      console.error('Open shift error:', err);
    }
  };

  // =========================
  // LOGIN
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
      
      // Clear form
      setEmail('');
      setPassword('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      alert(errorMessage);
      console.error('Login error:', err);
    }
  };

  // =========================
  // LOGOUT FUNCTION
  // =========================
  const handleLogout = () => {
    localStorage.removeItem('pos_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setCart([]);
    setDiscount(0);
    setShowDiscountModal(false);
    setSelectedTable(null);
    setActiveShift(null);
    setReceipt(null);
    setHeldOrders([]);
    setShiftReport(null);
    setClosedShift(null);
  };

  // =========================
  // CHECK IF USER HAS ADMIN ACCESS
  // =========================
  const hasAdminAccess = () => {
    return user?.role === 'admin' || user?.role === 'manager';
  };

  // =========================
  // LOADING SCREEN
  // =========================
  if (loadingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // =========================
  // LOGIN SCREEN
  // =========================
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

  // FIXED: Categories array with proper category name support
  const categories = [
    'all',
    ...new Set(
      data.products
        ?.map(p => p.category?.name || p.category)
        .filter(Boolean)
    )
  ];

  // =========================
  // MAIN APP
  // =========================
  return (
    <div className="flex h-screen bg-[#F3F4F6]">
      {/* SIDEBAR */}
      <nav className="w-16 bg-[#0B132B] text-white flex flex-col items-center py-6 gap-6">
        {/* POS Button - Always visible */}
        <button 
          onClick={() => setView('pos')}
          className="hover:bg-blue-600 p-2 rounded transition"
          title="POS View"
        >
          <ShoppingBag />
        </button>

        {/* STEP 3 - Admin Button - Only visible to admin/manager */}
        {hasAdminAccess() && (
          <button 
            onClick={() => setView('admin')}
            className="hover:bg-blue-600 p-2 rounded transition"
            title="Admin View"
          >
            <Settings />
          </button>
        )}

        {/* Logout button */}
        <button 
          onClick={handleLogout}
          className="mt-auto hover:bg-red-600 p-2 rounded transition"
          title="Logout"
        >
          🚪
        </button>
      </nav>

      {/* MAIN */}
      <main className="flex-1 overflow-auto">
        {/* STEP 2 - Protect Admin View - Only admin/manager can access */}
        {view === 'admin' && hasAdminAccess() ? (
          <AdminView />
        ) : view === 'pos' || view === 'waiter' ? (
          activeShift ? (
            selectedTable ? (
              // FIX 3 & 4: POSView receives onCloseShift prop
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
                showDiscountModal={showDiscountModal}
                setShowDiscountModal={setShowDiscountModal}
                total={total}
                change={change}
                onCloseShift={handleClockOut} // FIX 4: Pass the close shift function
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
                categories={categories} // Pass categories to POSView
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
        ) : (
          /* Fallback for unauthorized access */
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to view this page.</p>
            </div>
          </div>
        )}
      </main>

      {/* Render both Receipt and Kitchen Ticket components */}
      {receipt && (
        <>
          <Receipt
            receipt={receipt}
            onClose={() => {
              setReceipt(null);
            }}
          />
          
          <KitchenTicket
            receipt={receipt}
          />
        </>
      )}

      {/* Render Shift Report Print component */}
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