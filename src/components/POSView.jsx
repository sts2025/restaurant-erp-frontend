// File: src/components/POSView.jsx
import { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Coffee, 
  UtensilsCrossed,
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
  setAmountPaid, 
  paymentMethod, 
  setPaymentMethod, 
  discount, 
  setDiscount, 
  showDiscountModal, 
  setShowDiscountModal, 
  total, 
  change, 
  onCloseShift,
  selectedTable, 
  onCloseTable, 
  isProcessing,
  holdOrder,
  heldOrders,
  resumeOrder,
  userRole,
  categories: propCategories // Receive categories from parent
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [showSplitPayment, setShowSplitPayment] = useState(false); // FIX: Added missing state

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

  return (
    <div className="h-full flex flex-col">
      {/* Header with Close Shift Button at Top Left */}
      <div className="flex justify-between items-center p-3 bg-emerald-600 text-white shadow-lg">
        <button
          onClick={onCloseShift}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl font-bold transition-all duration-200 transform hover:scale-105"
        >
          End Shift
        </button>

        <div className="font-bold text-lg">
          Serving: {selectedTable?.name || 'Takeaway'}
        </div>

        <button
          onClick={onCloseTable}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200"
        >
          Change Table
        </button>
      </div>

      {/* Held Orders Button - Only show if there are held orders */}
      {heldOrders.length > 0 && (
        <button
          onClick={() => setShowHeldOrders(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white p-3 font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Clock className="w-5 h-5" />
          Held Orders ({heldOrders.length})
        </button>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Product Catalog */}
        <div className="w-2/3 border-r flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto border-b gap-1 p-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'All Items' : cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white border rounded-xl p-3 hover:shadow-lg transition-all text-left group hover:border-emerald-500"
                >
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  )}
                  <div className="font-semibold text-gray-800">{product.name}</div>
                  <div className="text-emerald-600 font-bold mt-1">
                    {Number(product.price).toLocaleString()} UGX
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Cart & Checkout */}
        <div className="w-1/3 flex flex-col bg-gray-50">
          {/* Cart Header */}
          <div className="p-4 border-b bg-white">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <h2 className="text-lg font-bold">Current Order</h2>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {groupedCart.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Cart is empty</p>
              </div>
            ) : (
              groupedCart.map(item => (
                <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-gray-500">
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
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item, 1)}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200"
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
          <div className="border-t bg-white p-4 space-y-3">
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

            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>{total.toLocaleString()} UGX</span>
            </div>

            {/* Discount Button */}
            <button
              onClick={() => setShowDiscountModal(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-2 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <Percent className="w-4 h-4" />
              {discount > 0 ? `Discount: ${discount.toLocaleString()} UGX` : 'Add Discount'}
            </button>

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
              <label className="text-sm font-medium text-gray-700">Amount Paid (UGX)</label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="Enter amount"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Change */}
            {amountPaid && Number(amountPaid) >= total && (
              <div className="bg-emerald-50 p-3 rounded-lg">
                <div className="text-sm text-emerald-600">Change</div>
                <div className="text-2xl font-bold text-emerald-700">{change.toLocaleString()} UGX</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Hold Order Button - Available for all roles */}
              <button
                onClick={holdOrder}
                disabled={cart.length === 0}
                className="flex-1 bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Clock className="w-5 h-5" />
                Hold Order
              </button>

              {/* Pay Button - Only shown for cashier/admin, NOT for waiters */}
              {userRole !== 'waiter' && (
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || cart.length === 0 || !amountPaid || Number(amountPaid) < total}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Receipt className="w-5 h-5" />
                  {isProcessing ? 'Processing...' : 'Pay & Print'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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
                      <div className="text-sm text-gray-500">
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