import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Package, LayoutDashboard, Boxes, Coffee, BarChart2, 
  Box, Receipt, Users, Printer, TrendingUp, Calendar, 
  Search, X, Download, RefreshCw, AlertCircle, DollarSign,
  PieChart, Settings, Trash2, Edit2, Eye, Clock, Award,
  UserCircle, CreditCard, AlertTriangle, ClipboardList, FileText
} from 'lucide-react';
import SaleDetailsModal from './SaleDetailsModal';
import SalesHistory from './SalesHistory';
import DailyReportPrint from './DailyReportPrint';
import ReceiptPrint from './ReceiptPrint';
import ThermalAnalyticsReport from './ThermalAnalyticsReport';
import AnalyticsDashboard from './AnalyticsDashboard';

export default function AdminView() {
  // =========================
  // STATE
  // =========================
  const [adminTab, setAdminTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [report, setReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [showPrintReport, setShowPrintReport] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showThermalAnalytics, setShowThermalAnalytics] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'operational',
    date: new Date().toISOString().split('T')[0]
  });
  
  // FILTER STATES
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cashierId, setCashierId] = useState('');

  // SALES STATES
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [salesSearch, setSalesSearch] = useState('');

  // USERS STATES
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier'
  });

  // CASHIER REPORT STATE
  const [cashierReport, setCashierReport] = useState([]);
  const [showVoidConfirm, setShowVoidConfirm] = useState(null);

  // STEP 3: Z-REPORT STATE
  const [zReport, setZReport] = useState(null);

  const [stockUpdate, setStockUpdate] = useState({
    product_id: '',
    quantity: ''
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock_quantity: '',
    category_id: 1,
    preparation_area: 'direct'
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#10B981'
  });

  const [newTable, setNewTable] = useState({
    name: '',
    capacity: 4,
    is_vip: false
  });

  // Calculate Inventory Value
  const inventoryValue = products.reduce(
    (sum, product) =>
      sum +
      (
        Number(product.price || 0) *
        Number(product.stock_quantity || 0)
      ),
    0
  );

  // LOW STOCK COUNT - Derived from products
  const lowStockCount = products.filter(p => (p.stock_quantity || 0) <= 10).length;

  // =========================
  // FETCH FUNCTIONS
  // =========================
  
  const fetchDailyReport = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/reports/daily', {
        params: {
          from_date: fromDate,
          to_date: toDate,
          payment_method: paymentMethod,
          cashier_id: cashierId
        }
      });
      setReport(res.data.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load report');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      setProducts(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load products');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/categories');
      setCategories(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load categories');
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/dashboard/stats');
      setDashboard(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await axios.get('/tables');
      setTables(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await axios.get('/sales');
      setSales(
        Array.isArray(res?.data?.data?.data)
          ? res.data.data.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : []
      );
    } catch (err) {
      console.error(err);
      setSales([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/expenses', {
        params: { from_date: fromDate, to_date: toDate }
      });
      setExpenses(res.data || []);
    } catch (err) {
      console.error(err);
      setExpenses([]);
    }
  };

  // Load Cashier Report
  const loadCashierReport = async () => {
    try {
      const res = await axios.get('/reports/cashiers');
      setCashierReport(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load cashier performance report');
    }
  };

  // STEP 4: Load Z-Report
  const loadZReport = async () => {
    try {
      const res = await axios.get('/reports/z-report');
      setZReport(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load Z-Report');
    }
  };

  // Void Sale Function
  const voidSale = async (saleId) => {
    if (!window.confirm('Are you sure you want to void this sale? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.post(`/sales/${saleId}/void`);
      alert('Sale voided successfully');
      fetchSales();
      fetchDailyReport();
      loadCashierReport();
      loadZReport();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to void sale');
    }
  };

  // =========================
  // RECEIPT FUNCTIONS
  // =========================
  const viewReceipt = async (saleId) => {
    try {
      const res = await axios.get(`/sales/${saleId}`);
      setSelectedSale(res.data);
      setShowReceipt(true);
    } catch (err) {
      console.error(err);
      alert('Failed to load receipt');
    }
  };

  const reprintReceipt = async (saleId) => {
    await viewReceipt(saleId);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    fetchProducts();
    fetchDashboard();
    fetchCategories();
    fetchTables();
    fetchSales();
    fetchUsers();
    fetchDailyReport();
    fetchExpenses();
    loadCashierReport();
    loadZReport();
  }, []);

  useEffect(() => {
    if (adminTab === 'dashboard') {
      fetchDailyReport();
      fetchExpenses();
    }
    if (adminTab === 'cashiers') {
      loadCashierReport();
    }
    if (adminTab === 'z-report') {
      loadZReport();
    }
  }, [fromDate, toDate, paymentMethod, cashierId, adminTab]);

  // =========================
  // HANDLERS
  // =========================
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post('/products', {
        tenant_id: 1,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock_quantity: parseInt(newProduct.stock_quantity),
        category_id: parseInt(newProduct.category_id),
        preparation_area: newProduct.preparation_area
      });

      alert('Product added successfully');
      setNewProduct({
        name: '',
        price: '',
        stock_quantity: '',
        category_id: categories[0]?.id || 1,
        preparation_area: 'direct'
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/tables', {
        name: newTable.name,
        capacity: newTable.capacity,
        is_vip: newTable.is_vip
      });
      alert('Table added');
      setNewTable({ name: '', capacity: 4, is_vip: false });
      fetchTables();
    } catch (err) {
      console.error(err);
      alert('Failed to add table');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/categories', {
        tenant_id: 1,
        name: newCategory.name,
        color: newCategory.color
      });
      alert('Category added');
      setNewCategory({ name: '', color: '#10B981' });
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Failed to add category');
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!stockUpdate.product_id) {
      alert('Please select a product');
      return;
    }
    if (!stockUpdate.quantity || stockUpdate.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    try {
      await axios.post('/products/update-stock', {
        product_id: parseInt(stockUpdate.product_id),
        quantity: parseInt(stockUpdate.quantity)
      });
      alert('Stock updated');
      setStockUpdate({ product_id: '', quantity: '' });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to update stock');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/users', {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role
      });
      alert('User created successfully');
      setNewUser({ name: '', email: '', password: '', role: 'cashier' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/expenses', newExpense);
      alert('Expense added successfully');
      setShowExpenseModal(false);
      setNewExpense({
        description: '',
        amount: '',
        category: 'operational',
        date: new Date().toISOString().split('T')[0]
      });
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert('Failed to add expense');
    }
  };

  const handleEditCategory = async (category) => {
    const name = prompt('Category Name', category.name);
    if (!name) return;
    const color = prompt('Color HEX', category.color);
    if (!color) return;
    try {
      await axios.put(`/categories/${category.id}`, { name, color });
      fetchCategories();
      alert('Category updated');
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  const handleDeleteCategory = async (category) => {
    const confirmed = confirm(`Delete ${category.name}?`);
    if (!confirmed) return;
    try {
      await axios.delete(`/categories/${category.id}`);
      fetchCategories();
      alert('Category deleted');
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const filteredSales = (sales || []).filter((sale) => {
    return (
      sale.receipt_number?.toLowerCase().includes(salesSearch.toLowerCase()) ||
      sale.payment_method?.toLowerCase().includes(salesSearch.toLowerCase())
    );
  });

  const handleResetFilters = () => {
    setFromDate(new Date().toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('');
    setCashierId('');
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const netProfit = (report?.total_sales || 0) - totalExpenses;

  // =========================
  // RENDER
  // =========================
  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Restaurant Administration
          </h1>
          <p className="text-slate-500 mt-1">Complete management system for your restaurant</p>
        </div>
        <div className="text-right bg-white px-6 py-3 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-slate-400 font-mono">Admin Access</p>
        </div>
      </div>

      {/* TABS - Added Z Report tab */}
      <div className="flex gap-3 mb-6 flex-wrap sticky top-0 bg-slate-100/95 backdrop-blur-sm py-2 z-10">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, color: 'emerald' },
          { id: 'analytics', name: 'Analytics', icon: TrendingUp, color: 'purple' },
          { id: 'sales', name: 'Sales', icon: Receipt, color: 'blue' },
          { id: 'inventory-report', name: 'Inventory', icon: ClipboardList, color: 'orange' },
          { id: 'inventory', name: 'Stock Control', icon: Box, color: 'amber' },
          { id: 'products', name: 'Products', icon: Package, color: 'green' },
          { id: 'categories', name: 'Categories', icon: Settings, color: 'indigo' },
          { id: 'tables', name: 'Tables', icon: Coffee, color: 'yellow' },
          { id: 'cashiers', name: 'Cashiers', icon: Users, color: 'teal' },
          { id: 'z-report', name: 'Z Report', icon: FileText, color: 'cyan' },
          { id: 'users', name: 'Users', icon: UserCircle, color: 'red' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setAdminTab(tab.id);
              if (tab.id === 'cashiers') {
                loadCashierReport();
              }
              if (tab.id === 'z-report') {
                loadZReport();
              }
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all transform hover:scale-105
              ${adminTab === tab.id
                ? `bg-${tab.color}-600 text-white shadow-lg`
                : 'bg-white text-slate-600 hover:shadow-md'
              }`}
          >
            <tab.icon size={18} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {adminTab === 'dashboard' && (
        <div>
          {/* FILTER BAR */}
          <div className="bg-white rounded-3xl p-6 shadow-lg mb-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Calendar size={20} className="text-emerald-600" />
                Report Filters
              </h2>
              <button
                onClick={handleResetFilters}
                className="text-slate-500 hover:text-emerald-600 text-sm flex items-center gap-1 transition"
              >
                <RefreshCw size={14} />
                Reset Filters
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="border rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">All Payments</option>
                <option value="cash">💵 Cash</option>
                <option value="mobile_money">📱 Mobile Money</option>
              </select>
              <select
                value={cashierId}
                onChange={(e) => setCashierId(e.target.value)}
                className="border rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">All Cashiers</option>
                {users.filter(u => u.role === 'cashier').map(cashier => (
                  <option key={cashier.id} value={cashier.id}>
                    👤 {cashier.name}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchDailyReport}
                disabled={isLoading}
                className="bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 py-3"
              >
                {isLoading ? 'Loading...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 mb-6 justify-end">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-red-500 text-white px-5 py-3 rounded-2xl font-bold hover:bg-red-600 transition-all flex items-center gap-2"
            >
              <DollarSign size={18} />
              Add Expense
            </button>
            <button
              onClick={() => setShowPrintReport(true)}
              className="bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <Printer size={18} />
              Thermal Print
            </button>
            <button
              onClick={() => setShowThermalAnalytics(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-2xl font-bold transition-all flex items-center gap-2"
            >
              <TrendingUp size={18} />
              Thermal Analytics
            </button>
          </div>

          {/* STATS CARDS */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl shadow-lg border border-emerald-100 transform hover:scale-105 transition">
                  <p className="text-slate-500 text-sm">Total Sales</p>
                  <h2 className="text-3xl font-bold text-emerald-600 mt-2">
                    {Number(report?.total_sales || 0).toLocaleString()} UGX
                  </h2>
                  <p className="text-xs text-emerald-500 mt-2">+12% from last period</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl shadow-lg border border-blue-100 transform hover:scale-105 transition">
                  <p className="text-slate-500 text-sm">Total Orders</p>
                  <h2 className="text-3xl font-bold text-blue-600 mt-2">{report?.total_orders || 0}</h2>
                  <p className="text-xs text-blue-500 mt-2">Completed orders</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-2xl shadow-lg border border-purple-100 transform hover:scale-105 transition">
                  <p className="text-slate-500 text-sm">Total Expenses</p>
                  <h2 className="text-3xl font-bold text-purple-600 mt-2">
                    {totalExpenses.toLocaleString()} UGX
                  </h2>
                  <p className="text-xs text-purple-500 mt-2">{expenses.length} transactions</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-2xl shadow-lg border border-green-100 transform hover:scale-105 transition">
                  <p className="text-slate-500 text-sm">Net Profit</p>
                  <h2 className={`text-3xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {netProfit.toLocaleString()} UGX
                  </h2>
                  <p className="text-xs text-green-500 mt-2">Revenue - Expenses</p>
                </div>
              </div>

              {/* ANALYTICS DASHBOARD */}
              <AnalyticsDashboard
                report={report}
                expenses={expenses}
              />

              {/* REPORTS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Receipt size={20} className="text-blue-600" />
                    Recent Sales
                    <span className="text-xs text-slate-400 ml-auto">{report?.recent_sales?.length || 0} transactions</span>
                  </h2>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {(report?.recent_sales || []).map((sale) => (
                      <div key={sale.id} className="flex justify-between border-b pb-2 hover:bg-slate-50 p-2 rounded-lg transition">
                        <div>
                          <p className="font-bold font-mono">{sale.receipt_number}</p>
                          <p className="text-xs text-slate-500 capitalize">{sale.payment_method}</p>
                          <p className="text-xs text-slate-400">{new Date(sale.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600">
                            {Number(sale.total).toLocaleString()} UGX
                          </div>
                          <div className="text-xs text-slate-400">{sale.cashier_name || sale.cashier?.name}</div>
                        </div>
                      </div>
                    ))}
                    {(!report?.recent_sales || report.recent_sales.length === 0) && (
                      <p className="text-slate-500 text-center py-8">No recent sales</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Package size={20} className="text-orange-600" />
                    Top Products
                    <span className="text-xs text-slate-400 ml-auto">Best sellers</span>
                  </h2>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.entries(report?.top_products || {}).map(([productName, quantity], index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-2 p-2 rounded-lg hover:bg-slate-50 transition">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-bold">{productName}</div>
                            <div className="text-xs text-slate-500">{quantity} units sold</div>
                          </div>
                        </div>
                        <div className="text-emerald-600 font-bold">
                          {((quantity / (report?.total_orders || 1)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                    {(!report?.top_products || Object.keys(report.top_products).length === 0) && (
                      <p className="text-slate-500 text-center py-8">No products sold yet</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {adminTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <PieChart size={24} className="text-purple-600" />
              Advanced Analytics
            </h2>
            <AnalyticsDashboard
              report={report}
              expenses={expenses}
            />
          </div>
        </div>
      )}

      {/* SALES TAB */}
      {adminTab === 'sales' && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-white">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by receipt number, payment method, or cashier..."
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
                className="w-full p-3 pl-10 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              {salesSearch && (
                <button
                  onClick={() => setSalesSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X size={18} className="text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-4 text-left">Receipt #</th>
                  <th className="p-4 text-left">Date & Time</th>
                  <th className="p-4 text-left">Total (UGX)</th>
                  <th className="p-4 text-left">Payment</th>
                  <th className="p-4 text-left">Cashier</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-t hover:bg-slate-50 transition">
                      <td className="p-4 font-mono font-bold">{sale.receipt_number}</td>
                      <td className="p-4">
                        {new Date(sale.created_at).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-slate-400">{new Date(sale.created_at).toLocaleTimeString()}</span>
                      </td>
                      <td className="p-4 font-bold text-emerald-600">
                        {Number(sale.total).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`capitalize px-2 py-1 rounded-full text-xs font-bold ${
                          sale.payment_method === 'cash' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {sale.payment_method === 'cash' ? '💵 Cash' : '📱 Mobile Money'}
                        </span>
                      </td>
                      <td className="p-4">{sale.cashier_name || sale.cashier?.name || '-'}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewReceipt(sale.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1"
                          >
                            <Eye size={14} />
                            View
                          </button>
                          <button
                            onClick={() => reprintReceipt(sale.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1"
                          >
                            <Printer size={14} />
                            Reprint
                          </button>
                          <button
                            onClick={() => voidSale(sale.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1"
                          >
                            <AlertTriangle size={14} />
                            Void
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      <AlertCircle size={40} className="mx-auto mb-2 text-slate-300" />
                      No sales found matching your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVENTORY REPORT TAB */}
      {adminTab === 'inventory-report' && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList size={24} className="text-orange-600" />
              Inventory Report
            </h2>
            <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl font-bold">
              Total Products: {products.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                <tr>
                  <th className="p-4 text-left font-bold text-slate-700">Product</th>
                  <th className="p-4 text-center font-bold text-slate-700">Category</th>
                  <th className="p-4 text-center font-bold text-slate-700">Unit Price (UGX)</th>
                  <th className="p-4 text-center font-bold text-slate-700">Stock Quantity</th>
                  <th className="p-4 text-right font-bold text-slate-700">Total Value (UGX)</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => {
                    const totalValue = (Number(product.price || 0) * Number(product.stock_quantity || 0));
                    return (
                      <tr key={product.id} className="border-b hover:bg-slate-50 transition group">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-slate-400" />
                            <span className="font-bold">{product.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-1 bg-slate-100 rounded-full text-xs">
                            {product.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono">
                          {Number(product.price || 0).toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`font-mono font-bold ${(product.stock_quantity || 0) <= 10 ? 'text-red-600' : 'text-slate-700'}`}>
                            {product.stock_quantity || 0}
                          </span>
                          {(product.stock_quantity || 0) <= 10 && (
                            <span className="ml-2 text-red-500 font-bold animate-pulse inline-block">
                              ⚠️ Low
                            </span>
                          )}
                          {(product.stock_quantity || 0) === 0 && (
                            <span className="ml-2 text-red-600 font-bold">
                              ❌ Out
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right font-bold text-emerald-600">
                          {totalValue.toLocaleString()} UGX
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      <Package size={48} className="mx-auto mb-2 text-slate-300" />
                      No products in inventory
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-100">
                <tr>
                  <td colSpan="4" className="p-4 text-right font-bold text-lg">
                    Total Stock Value:
                  </td>
                  <td className="p-4 text-right font-black text-xl text-emerald-700">
                    {inventoryValue.toLocaleString()} UGX
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t">
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <p className="text-sm text-green-600">Total Products</p>
              <p className="text-2xl font-bold text-green-700">{products.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <p className="text-sm text-blue-600">Inventory Value</p>
              <p className="text-2xl font-bold text-blue-700">{inventoryValue.toLocaleString()} UGX</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl text-center">
              <p className="text-sm text-red-600">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-red-700">{lowStockCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* STOCK CONTROL TAB (Original Inventory) */}
      {adminTab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Update Stock</h2>
            <form onSubmit={handleUpdateStock} className="flex flex-col sm:flex-row gap-4 items-end">
              <select
                value={stockUpdate.product_id}
                onChange={(e) => setStockUpdate({ ...stockUpdate, product_id: e.target.value })}
                className="p-3 border rounded-xl flex-1 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current Stock: {p.stock_quantity || 0})
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity to add"
                value={stockUpdate.quantity}
                onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: e.target.value })}
                className="p-3 border rounded-xl w-32 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button type="submit" className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-emerald-700">
                Update Stock
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              Current Inventory
              {lowStockCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm animate-pulse">
                  ⚠️ {lowStockCount} Alert{lowStockCount !== 1 ? 's' : ''}
                </span>
              )}
            </h2>
            <div className="grid gap-3">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="flex justify-between items-center border-b pb-3 hover:bg-slate-50 p-3 rounded-lg transition">
                    <div>
                      <p className="font-bold">{product.name}</p>
                      <p className="text-xs text-slate-500">
                        Stock: {product.stock_quantity || 0} units
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-600 font-bold">
                        {Number(product.price).toLocaleString()} UGX
                      </div>
                      <div className={`text-xs font-bold ${(product.stock_quantity || 0) < 10 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                        {(product.stock_quantity || 0) < 10 && '⚠️ Low stock alert'}
                        {(product.stock_quantity || 0) === 0 && '❌ Out of stock'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-8">No products found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {adminTab === 'products' && (
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price (UGX)"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
            <input
              type="number"
              placeholder="Opening Stock"
              value={newProduct.stock_quantity}
              onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
            <select
              value={newProduct.category_id}
              onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select
              value={newProduct.preparation_area}
              onChange={(e) => setNewProduct({ ...newProduct, preparation_area: e.target.value })}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="direct">🏪 Direct / No Kitchen</option>
              <option value="kitchen">🍳 Kitchen Item</option>
            </select>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Adding Product...' : '➕ Add Product'}
            </button>
          </form>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {adminTab === 'categories' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Add Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <div>
                <label className="block mb-2 font-bold">Category Color</label>
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="w-full h-14 rounded-xl border"
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700">
                Add Category
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Existing Categories</h2>
            <div className="space-y-3">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category.id} className="flex justify-between items-center border-b pb-3 hover:bg-slate-50 p-3 rounded-lg transition">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-bold">{category.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-8">No categories found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TABLES TAB */}
      {adminTab === 'tables' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Add Table</h2>
            <form onSubmit={handleAddTable} className="space-y-4">
              <input
                type="text"
                placeholder="Table Name (e.g., Table 1, VIP Lounge)"
                value={newTable.name}
                onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <input
                type="number"
                placeholder="Capacity (number of seats)"
                value={newTable.capacity}
                onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={newTable.is_vip}
                  onChange={(e) => setNewTable({ ...newTable, is_vip: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="font-bold">VIP Table (Premium seating)</span>
              </label>
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700">
                Add Table
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Restaurant Tables</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.isArray(tables) &&
               tables.map((table) => (
                <div
                  key={table.id}
                  className={`p-5 rounded-2xl border shadow-sm transition hover:shadow-md transform hover:scale-105 cursor-pointer
                    ${table.is_vip
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300'
                      : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{table.name}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Users size={12} />
                        Capacity: {table.capacity}
                      </p>
                    </div>
                    {table.is_vip && (
                      <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded-full font-bold">
                        👑 VIP
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-emerald-600">
                    🟢 Available
                  </div>
                </div>
              ))}
             {Array.isArray(tables) && tables.length === 0 && (
              <p className="text-slate-500 text-center col-span-3 py-8">
                No tables added yet
              </p>
            )}
            </div>
          </div>
        </div>
      )}

      {/* CASHIERS TAB */}
      {adminTab === 'cashiers' && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Award size={28} className="text-teal-600" />
              Cashier Performance
            </h2>
            <button
              onClick={loadCashierReport}
              className="bg-teal-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-teal-700 transition flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {cashierReport.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
              <Users size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No cashier data available</p>
              <p className="text-sm text-slate-400 mt-1">Sales will appear here once cashiers make transactions</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl">
                  <tr>
                    <th className="p-4 text-left font-bold text-slate-700">Cashier Name</th>
                    <th className="p-4 text-left font-bold text-slate-700">Orders Processed</th>
                    <th className="p-4 text-left font-bold text-slate-700">Total Sales (UGX)</th>
                    <th className="p-4 text-left font-bold text-slate-700">Avg. Order Value</th>
                    <th className="p-4 text-left font-bold text-slate-700">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {cashierReport.map((cashier, index) => {
                    const avgOrderValue = cashier.orders_count > 0 
                      ? cashier.total_sales / cashier.orders_count 
                      : 0;
                    const maxSales = Math.max(...cashierReport.map(c => c.total_sales), 0);
                    const widthPercent = maxSales > 0 ? (cashier.total_sales / maxSales) * 100 : 0;
                    
                    return (
                      <tr key={cashier.name || index} className="border-b hover:bg-slate-50 transition group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                              {cashier.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="font-bold">{cashier.name}</div>
                              <div className="text-xs text-slate-400">Cashier</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Receipt size={16} className="text-slate-400" />
                            <span className="font-mono font-bold text-lg">{cashier.orders_count || 0}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-emerald-600">
                            {Number(cashier.total_sales || 0).toLocaleString()} UGX
                          </div>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${widthPercent}%` }}
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-600">
                            {avgOrderValue.toLocaleString()} UGX
                          </div>
                          <div className="text-xs text-slate-400">per order</div>
                        </td>
                        <td className="p-4">
                          {cashier.orders_count > 10 ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                              <TrendingUp size={12} />
                              Top Performer
                            </span>
                          ) : cashier.orders_count > 0 ? (
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                              <Clock size={12} />
                              Active
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold w-fit">
                              No Activity
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td className="p-4 font-bold">Total</td>
                    <td className="p-4 font-bold">
                      {cashierReport.reduce((sum, c) => sum + (c.orders_count || 0), 0)}
                    </td>
                    <td className="p-4 font-bold text-emerald-700">
                      {cashierReport.reduce((sum, c) => sum + (c.total_sales || 0), 0).toLocaleString()} UGX
                    </td>
                    <td colSpan="2" className="p-4">
                      <div className="text-sm text-slate-500">
                        Based on {cashierReport.length} cashier{cashierReport.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Z-REPORT TAB - STEPS 6 & 7 */}
      {adminTab === 'z-report' && zReport && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <FileText size={28} className="text-cyan-600" />
              End Of Day Report
            </h2>
            <button
              onClick={loadZReport}
              className="bg-cyan-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-cyan-700 transition flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl border border-blue-100">
              <p className="text-slate-500 text-sm">Total Transactions</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-2">{zReport.transactions || 0}</h3>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-100">
              <p className="text-slate-500 text-sm">Total Sales</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-2">
                {Number(zReport.total_sales || 0).toLocaleString()} UGX
              </h3>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-2xl border border-purple-100">
              <p className="text-slate-500 text-sm">Average Order Value</p>
              <h3 className="text-3xl font-bold text-purple-600 mt-2">
                {zReport.transactions > 0 
                  ? Number((zReport.total_sales / zReport.transactions) || 0).toLocaleString() 
                  : 0} UGX
              </h3>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Payment Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-700">💵 Cash</span>
                  <span className="text-2xl font-bold text-green-700">
                    {Number(zReport.cash_sales || 0).toLocaleString()} UGX
                  </span>
                </div>
                <div className="mt-2 text-sm text-green-600">
                  {zReport.total_sales > 0 
                    ? `${((zReport.cash_sales / zReport.total_sales) * 100).toFixed(1)}% of total`
                    : '0% of total'}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-purple-700">📱 Mobile Money</span>
                  <span className="text-2xl font-bold text-purple-700">
                    {Number(zReport.mobile_sales || 0).toLocaleString()} UGX
                  </span>
                </div>
                <div className="mt-2 text-sm text-purple-600">
                  {zReport.total_sales > 0 
                    ? `${((zReport.mobile_sales / zReport.total_sales) * 100).toFixed(1)}% of total`
                    : '0% of total'}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-700">💳 Card</span>
                  <span className="text-2xl font-bold text-blue-700">
                    {Number(zReport.card_sales || 0).toLocaleString()} UGX
                  </span>
                </div>
                <div className="mt-2 text-sm text-blue-600">
                  {zReport.total_sales > 0 
                    ? `${((zReport.card_sales / zReport.total_sales) * 100).toFixed(1)}% of total`
                    : '0% of total'}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 7: Print Button */}
          <div className="mt-6 pt-4 border-t flex gap-3">
            <button
              onClick={() => window.print()}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center gap-2"
            >
              <Printer size={18} />
              Print Z Report
            </button>
            <button
              onClick={() => {
                const startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date();
                endDate.setHours(23, 59, 59, 999);
                loadZReport();
              }}
              className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-cyan-700 transition flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh Today's Report
            </button>
          </div>

          {/* Report Footer */}
          <div className="mt-6 text-center text-xs text-slate-400 border-t pt-4">
            Generated on {new Date().toLocaleString()} | Z-Report for End of Day Settlement
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {adminTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-black mb-6">Add Staff User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="admin">👑 Admin</option>
                <option value="manager">📊 Manager</option>
                <option value="cashier">💰 Cashier</option>
                <option value="waiter">🍽️ Waiter</option>
                <option value="kitchen">👨‍🍳 Kitchen</option>
              </select>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-black w-full transition"
              >
                Create User
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-slate-50 transition">
                    <td className="p-4 font-bold">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'cashier' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.is_active ? (
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                          🟢 Active
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                          🔴 Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={async () => {
                          const confirmed = confirm(`Delete ${user.name}?`);
                          if (!confirmed) return;
                          try {
                            await axios.delete(`/users/${user.id}`);
                            fetchUsers();
                            alert('User deleted successfully');
                          } catch (err) {
                            console.error(err);
                            alert('Failed to delete user');
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedSale && showReceipt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto shadow-2xl">
            <ReceiptPrint sale={selectedSale} />
            <div className="flex gap-3 mt-4 sticky bottom-0 bg-white pt-4">
              <button
                onClick={() => window.print()}
                className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold flex-1 hover:bg-emerald-700 flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Print
              </button>
              <button
                onClick={() => {
                  setShowReceipt(false);
                  setSelectedSale(null);
                }}
                className="bg-slate-200 px-5 py-3 rounded-xl font-bold flex-1 hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrintReport && (
        <DailyReportPrint
          report={report}
          onClose={() => setShowPrintReport(false)}
        />
      )}

      {selectedReceipt && !showReceipt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto shadow-2xl">
            <ReceiptPrint sale={selectedReceipt} />
            <div className="flex gap-3 mt-4 sticky bottom-0 bg-white pt-4">
              <button
                onClick={() => window.print()}
                className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold flex-1 hover:bg-emerald-700 flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Print
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="bg-slate-200 px-5 py-3 rounded-xl font-bold flex-1 hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showThermalAnalytics && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto shadow-2xl">
            <ThermalAnalyticsReport
              report={report}
              fromDate={fromDate}
              toDate={toDate}
            />
            <div className="flex gap-3 mt-4 sticky bottom-0 bg-white pt-4">
              <button
                onClick={() => window.print()}
                className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold flex-1 hover:bg-emerald-700 flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Print Report
              </button>
              <button
                onClick={() => setShowThermalAnalytics(false)}
                className="bg-slate-200 px-5 py-3 rounded-xl font-bold flex-1 hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Add Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <input
                type="text"
                placeholder="Description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount (UGX)"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="operational">Operational</option>
                <option value="salary">Salary</option>
                <option value="utilities">Utilities</option>
                <option value="supplies">Supplies</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold flex-1 hover:bg-emerald-700"
                >
                  Add Expense
                </button>
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="bg-slate-200 px-5 py-3 rounded-xl font-bold flex-1 hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}