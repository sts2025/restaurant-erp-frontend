// File: src/components/POSView.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  ShoppingCart,
  X,
  Plus,
  Minus,
  Receipt,
  Percent,
  Clock,
  BookOpen
} from 'lucide-react';

export default function POSView({ 
  data, 
  cart, 
  addToCart, 
  setCart, 
  removeFromCart, 
  handleCheckout, 
  amountPaid,
  openSplitBill, 
  setAmountPaid, 
  paymentMethod, 
  setPaymentMethod, 
  discount, 
  setDiscount, 
  showDiscountModal, 
  setShowDiscountModal,
  showTransferModal,
  setShowTransferModal,
  openTransferTable,
  transferTable,
  showMergeModal,
  setShowMergeModal,
  mergeTables,
  tables, 
  total, 
  change,
  orderNotes,
  setOrderNotes,
  activeShift,
  openShift, 
  onCloseShift,
  selectedTable, 
  onCloseTable, 
  isProcessing,
  holdOrder,
  heldOrders,
  resumeOrder,
  printBill,
  userRole,
  categories: propCategories,
  isOnline,
  pendingSyncCount,
  selectedBranch,
  user,
  report,
  activeShiftData,
  logout
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [showReceipts, setShowReceipts] = useState(false);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [salesToday, setSalesToday] = useState(0);
  const [tillAmount, setTillAmount] = useState(0);


  // Calculate counters based on preparation area (menu items count)
  const kitchenCount = data.products?.filter(
    p => p.preparation_area === 'kitchen'
  ).length || 0;

  const barCount = data.products?.filter(
    p => p.preparation_area === 'bar'
  ).length || 0;

  const bakeryCount = data.products?.filter(
    p => p.preparation_area === 'bakery'
  ).length || 0;

  // Set sales today from report - FIXED: using useEffect instead of useState
  useEffect(() => {
    if (report?.total_sales) {
      setSalesToday(report.total_sales);
    }
  }, [report]);

  // Set till amount from active shift - FIXED: using useEffect instead of useState
  useEffect(() => {
    if (activeShiftData?.opening_cash) {
      setTillAmount(activeShiftData.opening_cash);
    }
  }, [activeShiftData]);

  // Load receipts function
  const loadReceipts = async () => {
    try {
      const res = await axios.get('/sales');
      setRecentReceipts(res.data.data?.slice(0, 20) || []);
    } catch (err) {
      console.error('Error loading receipts:', err);
    }
  };

  // Use categories from props if provided, otherwise derive from products
  const categories = propCategories || [
    'all',
    ...new Set(
      data.products
        ?.map(p => p.category?.name || p.category)
        .filter(Boolean)
    )
  ];

  // Filter products by category and search
  const filteredProducts = data.products?.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category?.name === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  // Group cart items for display
  const groupedCart = cart.reduce((acc, item) => {
    const existing = acc.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      acc.push({ ...item, quantity: item.quantity });
    }
    return acc;
  }, []);

  const updateQuantity = (item, delta) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      removeFromCart(item.id);
    } else {
      setCart(prev => prev.map(i => 
        i.id === item.id ? { ...i, quantity: newQuantity } : i
      ));
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'Cash': return <Wallet className="w-4 h-4" />;
      case 'Card': return <CreditCard className="w-4 h-4" />;
      case 'Mobile Money': return <Smartphone className="w-4 h-4" />;
      default: return <Wallet className="w-4 h-4" />;
    }
  };

  const handleReprint = (receiptId) => {
    // Implement reprint functionality
    console.log('Reprint receipt:', receiptId);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden pb-10">
      {/* TOP STATUS BAR */}
      <div className="bg-slate-900 text-white px-4 py-2 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
         <span className="font-bold">RestoPlus POSUG</span>
        
        </div>
        <div className="flex items-center gap-4">
          <span>🏢 {selectedBranch?.name || 'Main Branch'}</span>
          <span>{new Date().toLocaleTimeString()}</span>
          <span>{user?.name}</span>
        </div>
      </div>

      {/* Professional Status Strip */}
      <div className="bg-white border-b px-4 py-2 flex justify-between text-sm shadow-sm flex-shrink-0">
        <span className="font-medium text-gray-700">
          Cashier: {userRole?.toUpperCase() || 'CASHIER'}
        </span>
        <span className="text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Header with Close Shift Button */}
      <div className="flex justify-between items-center px-4 py-2 bg-emerald-600 text-white shadow flex-shrink-0">
        {activeShift ? (
          <button
            onClick={onCloseShift}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl font-bold"
          >
            End Shift
          </button>
        ) : (
          <button
            onClick={openShift}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl font-bold"
          >
            Start Shift
          </button>
        )}

        <div className="text-center">
          <div className="text-2xl font-black tracking-tight">
            {selectedTable?.name || 'TAKEAWAY'}
          </div>
          <div className="text-sm opacity-90 mt-1">
            {isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
          </div>
          <div className="text-xs">Sales Today: UGX {salesToday.toLocaleString()}</div>
          <div className="text-xs opacity-75">
            Pending Sync: {pendingSyncCount || 0}
          </div>
          <div className="text-xs opacity-75">
            Shift #{activeShift?.id}
          </div>
        </div>

        <button
          onClick={onCloseTable}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
        >
          Change Table
        </button>
      </div>

      {/* Held Orders Button - Only show if there are held orders */}
      {heldOrders.length > 0 && (
        <button
          onClick={() => setShowHeldOrders(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white p-3 font-bold flex items-center justify-center gap-2 transition-all flex-shrink-0"
        >
          <Clock className="w-5 h-5" />
          Held Orders ({heldOrders.length})
        </button>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Transfer Table</h3>
            <div className="space-y-2">
              {tables
                .filter(
                  t =>
                    t.id !== selectedTable?.id &&
                    t.status === 'available'
                )
                .map(table => (
                  <button
                    key={table.id}
                    onClick={() => transferTable(table.id)}
                    className="w-full text-left p-3 border rounded-lg hover:bg-slate-50"
                  >
                    {table.name}
                  </button>
                ))}
            </div>
            <button
              onClick={() => setShowTransferModal(false)}
              className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden bg-slate-100">
        {/* LEFT: Product Catalog */}
        <div className="w-[55%] border-r flex flex-col bg-white">
          {/* Search Bar */}
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto border-b gap-1 p-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'All Items' : cat}
              </button>
            ))}
          </div>

          {/* Products Grid - Larger Cards for Touch Screen */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="
                    bg-white
                    border-2
                    rounded-2xl
                    p-4
                    h-[140px]
                    hover:shadow-xl
                    hover:scale-105
                    hover:border-emerald-500
                    transition-all
                    text-left
                    group
                    flex
                    flex-col
                    justify-between
                  "
                >
                  <div className="font-semibold text-gray-800 text-base truncate">
                    {product.name}
                  </div>
                  <div>
                    <div className="text-emerald-600 font-bold text-lg">
                      {Number(product.price).toLocaleString()} UGX
                    </div>
                    {product.preparation_area === 'kitchen' && (
                      <div className="text-xs text-orange-600 font-bold mt-1">
                        🍳 Kitchen
                      </div>
                    )}
                    {product.preparation_area === 'bar' && (
                      <div className="text-xs text-blue-600 font-bold mt-1">
                        🍹 Bar
                      </div>
                    )}
                    {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
                      <div className="text-xs text-red-600 font-bold mt-1">
                        ⚠ Low Stock ({product.stock_quantity} left)
                      </div>
                    )}
                    {product.stock_quantity === 0 && (
                      <div className="text-xs text-red-600 font-bold mt-1">
                        ❌ Out of Stock
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: New Order Panel & Action Panel */}
        <div className="w-[45%] flex">
          {/* Order Panel */}
          <div className="w-[50%] flex flex-col bg-white border-r">
            {/* Cart Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h2 className="text-lg font-bold">Current Order</h2>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
              {groupedCart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-center text-gray-500">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-gray-600">
                      Ready to take order
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Tap products on the left to begin.
                    </p>
                  </div>
                </div>
              ) : (
                groupedCart.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-3 border hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-bold text-sm"> {item.name} </div>
                        <div className="text-xs text-gray-500">
                          {Number(item.price).toLocaleString()} UGX each
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item, -1)}
                          className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item, 1)}
                          className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-bold text-emerald-600">
                        {(item.price * item.quantity).toLocaleString()} UGX
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Order Summary */}
            <div className="border-t bg-white p-4 space-y-3 sticky bottom-0">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{cart.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()} UGX</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount:</span>
                  <span>-{discount.toLocaleString()} UGX</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold">
                <span>Items</span>
                <span>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>

              <div className="bg-emerald-600 text-white rounded-xl p-4 text-center shadow-lg">
                <div className="text-sm font-medium opacity-90">TOTAL</div>
                <div className="text-4xl font-black">
                  {total.toLocaleString()}
                </div>
                <div className="text-xs opacity-75">UGX</div>
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="w-[50%] bg-slate-50 p-3 flex flex-col gap-2">
            {/* Discount Button */}
            <button
              onClick={() => setShowDiscountModal(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-2 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <Percent className="w-4 h-4" />
              {discount > 0 ? `Discount: ${discount.toLocaleString()} UGX` : 'Add Discount'}
            </button>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Order Notes
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="No onions, extra sauce, no ice..."
                rows={3}
                className="w-full mt-2 border rounded-lg p-2"
              />
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {['Cash', 'Card', 'Mobile Money'].map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === method
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {getPaymentMethodIcon(method)}
                    <span className="text-sm">{method}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Paid */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Amount Paid (UGX)
              </label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[5000, 10000, 20000, 50000, 100000].map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setAmountPaid(String(amount))}
                    className="bg-slate-100 hover:bg-slate-200 rounded-lg py-2 text-sm font-bold"
                  >
                    {amount.toLocaleString()}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmountPaid(String(total))}
                  className="bg-emerald-600 text-white rounded-lg py-2 text-sm font-bold"
                >
                  Exact
                </button>
              </div>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="Enter amount"
                className="w-full mt-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Change */}
            {amountPaid && Number(amountPaid) >= total && (
              <div className="bg-emerald-50 p-3 rounded-lg">
                <div className="text-sm text-emerald-600">Change</div>
                <div className="text-2xl font-bold text-emerald-700">{change.toLocaleString()} UGX</div>
              </div>
            )}

            {/* Order Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={holdOrder}
                disabled={cart.length === 0}
                className="bg-amber-600 text-white py-2 rounded-lg font-bold hover:bg-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm"
              >
                <Clock className="w-4 h-4" />
                Hold Order
              </button>
              <button
                onClick={() => setShowHeldOrders(true)}
                disabled={heldOrders.length === 0}
                className="bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                Resume Order
              </button>
              <button
                onClick={() => setShowDiscountModal(true)}
                className="bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-1 text-sm"
              >
                <Percent className="w-4 h-4" />
                Discount
              </button>
              <button
                onClick={() => setShowTransferModal(true)}
                disabled={!selectedTable}
                className="bg-cyan-600 text-white py-2 rounded-lg font-bold hover:bg-cyan-700 disabled:opacity-50"
              >
                Transfer 
              </button>
              <button
                onClick={printBill}
                className="bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700"
              >
                Print Bill
              </button>
              <button
                onClick={openSplitBill}
                className="bg-cyan-600 text-white py-2 rounded-lg font-bold hover:bg-cyan-700"
              >
                Split Bill
              </button>
              <button
                onClick={() => setShowMergeModal(true)}
                className="bg-cyan-700 text-white py-2 rounded-lg font-bold"
              >
                Merge Table
              </button>
            </div>

            {/* Pay & Print Button - Only shown for cashier/admin, NOT for waiters */}
            {userRole !== 'waiter' && (
              <button
                onClick={handleCheckout}
                disabled={isProcessing || cart.length === 0 || !amountPaid || Number(amountPaid) < total}
                className="bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Receipt className="w-5 h-5" />
                {isProcessing ? 'Processing...' : 'Pay & Print'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM POS BAR - Updated with corrected labels */}
      <div className="fixed bottom-0 left-12 right-0 bg-slate-900 text-white h-10 flex items-center justify-between px-4 z-50">
        <button>🍳 Kitchen Menu ({kitchenCount})</button>
        <button>🍺 Bar Menu ({barCount})</button>
        <button>🧁 Bakery Menu ({bakeryCount})</button>
        <button 
          onClick={() => {
            loadReceipts();
            setShowReceipts(true);
          }}
        >
          🧾 Receipts
        </button>
        <div className="text-center">
          <div>💰 Till</div>
          <div className="text-xs text-yellow-300">
            UGX {Number(tillAmount).toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div>📈 Sales</div>
          <div className="text-xs text-green-400">
            UGX {Number(salesToday).toLocaleString()}
          </div>
        </div>
       <button
  onClick={() => {
    localStorage.removeItem('token');
    window.location.reload();
  }}
>
  🔒 Lock
</button>
        <button
  onClick={() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  }}
>
  🔄 Switch User
</button>
<button
  onClick={() => {
    localStorage.clear();
    window.location.reload();
  }}
>
  🚪 Logout
</button>
      </div>

      {/* Receipts Modal */}
      {showReceipts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[600px] max-h-[80vh] overflow-auto">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold">Recent Receipts</h2>
              <button
                onClick={() => setShowReceipts(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {recentReceipts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No receipts found
              </div>
            ) : (
              recentReceipts.map(receipt => (
                <div
                  key={receipt.id}
                  className="flex justify-between border-b py-2 items-center"
                >
                  <span className="font-medium">{receipt.receipt_number}</span>
                  <span>UGX {Number(receipt.total).toLocaleString()}</span>
                  <button
                    onClick={() => handleReprint(receipt.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Reprint
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Add Discount</h3>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="Discount amount"
              className="w-full px-3 py-2 border rounded-lg mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {showMergeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="text-xl font-bold mb-4">Merge Table</h3>
            <select
              className="w-full border p-2 rounded mb-4"
              onChange={(e) => mergeTables(Number(e.target.value))}
            >
              <option value="">Select Target Table</option>
              {tables
                .filter(t => t.id !== selectedTable?.id)
                .map(table => (
                  <option key={table.id} value={table.id}>
                    {table.name}
                  </option>
                ))}
            </select>
            <button
              onClick={() => setShowMergeModal(false)}
              className="w-full bg-gray-500 text-white py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Held Orders Modal */}
      {showHeldOrders && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Held Orders
              </h3>
              <button
                onClick={() => setShowHeldOrders(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              {heldOrders.map(order => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-lg">Table {order.tableName}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        resumeOrder(order);
                        setShowHeldOrders(false);
                      }}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                    >
                      Resume Order
                    </button>
                  </div>
                  <div className="text-sm">
                    {order.cart.length} items • 
                    Total: {order.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()} UGX
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}