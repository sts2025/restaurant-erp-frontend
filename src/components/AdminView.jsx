import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  Package, LayoutDashboard, Boxes, Coffee,
  Box, Receipt, Users, Printer, TrendingUp, Calendar,
  Search, X, RefreshCw, DollarSign,
  PieChart, Settings, Trash2, Edit2, Eye, Clock, Award,
  UserCircle, AlertTriangle, ClipboardList, FileText,
  Building, CheckCircle, ToggleLeft, ToggleRight
} from 'lucide-react';

import DailyReportPrint from './DailyReportPrint';
import ReceiptPrint from './ReceiptPrint';
import ThermalAnalyticsReport from './ThermalAnalyticsReport';
import AnalyticsDashboard from './AnalyticsDashboard';

// ─────────────────────────────────────────────
// CONFIRM MODAL
// ─────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={24} className="text-red-500" />
          <h3 className="text-lg font-bold text-slate-800">Confirm Action</h3>
        </div>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">Confirm</button>
          <button onClick={onCancel} className="flex-1 bg-slate-200 py-3 rounded-xl font-bold hover:bg-slate-300 transition">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CATEGORY EDIT MODAL
// ─────────────────────────────────────────────
function CategoryEditModal({ category, onSave, onCancel }) {
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
        <h3 className="text-xl font-bold mb-4">Edit Category</h3>
        <div className="space-y-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Category Name" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Color</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              className="w-full h-12 rounded-xl border p-1 cursor-pointer" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => onSave({ name, color })}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition">Save</button>
            <button onClick={onCancel}
              className="flex-1 bg-slate-200 py-3 rounded-xl font-bold hover:bg-slate-300 transition">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// VOID SALE MODAL
// ─────────────────────────────────────────────
function VoidSaleModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={24} className="text-red-500" />
          <h3 className="text-lg font-bold">Void Sale</h3>
        </div>
        <p className="text-slate-500 text-sm mb-4">This cannot be undone. Please provide a reason.</p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for voiding..."
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-400 outline-none resize-none mb-4" rows={3} />
        <div className="flex gap-3">
          <button onClick={() => reason.trim() && onConfirm(reason)} disabled={!reason.trim()}
            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50">
            Void Sale
          </button>
          <button onClick={onCancel} className="flex-1 bg-slate-200 py-3 rounded-xl font-bold hover:bg-slate-300 transition">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAYMENT METHOD HELPERS
// ─────────────────────────────────────────────
const PAYMENT_BADGE = {
  'Cash':         'bg-green-100 text-green-700',
  'Mobile Money': 'bg-purple-100 text-purple-700',
  'Card':         'bg-blue-100 text-blue-700',
};
const paymentBadge = (method) =>
  PAYMENT_BADGE[method] ?? 'bg-slate-100 text-slate-700';

// ─────────────────────────────────────────────
// UTILITY: Print any report as thermal receipt
// ─────────────────────────────────────────────
function printThermalReport(title, tableHtml, additionalInfo = '') {
  const win = window.open('', '_blank', 'width=420,height=800');
  if (!win) {
    alert('Popup blocked. Allow popups for this site.');
    return;
  }
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @page { size: 80mm auto; margin: 2mm; }
        body {
          width: 72mm;
          margin: 0 auto;
          padding: 4mm;
          font-family: monospace;
          font-size: 12px;
          color: #000;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
        }
        .header h1 { font-size: 18px; margin: 0; }
        .header p { font-size: 10px; margin: 2px 0; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        th, td {
          text-align: left;
          padding: 4px 2px;
          border-bottom: 1px dotted #ccc;
        }
        th {
          font-weight: bold;
          border-bottom: 1px solid #000;
        }
        .footer {
          text-align: center;
          margin-top: 15px;
          font-size: 10px;
          border-top: 1px dashed #000;
          padding-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>${new Date().toLocaleString()}</p>
        ${additionalInfo ? `<p>${additionalInfo}</p>` : ''}
      </div>
      ${tableHtml}
      <div class="footer">
        <p>RestoPlus POS | Printed ${new Date().toLocaleString()}</p>
      </div>
      <script>
        setTimeout(() => { window.print(); window.close(); }, 200);
      </script>
    </body>
    </html>
  `);
  win.document.close();
}

// ─────────────────────────────────────────────
// MAIN ADMIN VIEW
// ─────────────────────────────────────────────
export default function AdminView() {

  // ── UI STATE ──────────────────────────────────
  const [adminTab, setAdminTab]       = useState('dashboard');
  const [isLoading, setIsLoading]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts]           = useState([]);

  // ── DATA ─────────────────────────────────────
  const [products, setProducts]             = useState([]);
  const [categories, setCategories]         = useState([]);
  const [tables, setTables]                 = useState([]);
  const [sales, setSales]                   = useState([]);
  const [users, setUsers]                   = useState([]);
  const [expenses, setExpenses]             = useState([]);
  const [branches, setBranches]             = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [report, setReport]                 = useState(null);
  const [cashierReport, setCashierReport]   = useState([]);
  const [zReport, setZReport]               = useState(null);

  // ── SETTINGS ─────────────────────────────────
  const [settings, setSettings] = useState({
    restaurantName: 'My Business',
    taxRate:        18,
    currency:       'UGX',
    receiptFooter:  'Thank you for your business!',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [activeBranch, setActiveBranch] = useState(null);
  const [branchForm, setBranchForm]     = useState({ name: '', address: '', phone: '', location: '' });
  const [isSavingBranch, setIsSavingBranch] = useState(false);

  // ── MODAL STATES ──────────────────────────────
  const [showPrintReport, setShowPrintReport]         = useState(false);
  const [showThermalAnalytics, setShowThermalAnalytics] = useState(false);
  const [selectedSale, setSelectedSale]               = useState(null);
  const [showReceipt, setShowReceipt]                 = useState(false);
  const [showExpenseModal, setShowExpenseModal]       = useState(false);
  const [confirmModal, setConfirmModal]               = useState(null);
  const [voidSaleId, setVoidSaleId]                   = useState(null);
  const [editingCategoryModal, setEditingCategoryModal] = useState(null);

  // ── FILTERS ───────────────────────────────────
  const [fromDate, setFromDate]         = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate]             = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cashierId, setCashierId]       = useState('');
  const [salesSearch, setSalesSearch]   = useState('');
  const [productSearch, setProductSearch] = useState('');

  // ── PAGINATION ────────────────────────────────
  const [salesPage, setSalesPage] = useState(1);
  const itemsPerPage = 20;

  // ── FORM STATES ───────────────────────────────
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingUser, setEditingUser]       = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [newBranch, setNewBranch]   = useState({ name: '', location: '', phone: '' });
  const [newUser, setNewUser]       = useState({ name: '', email: '', password: '', role: 'cashier' });
  const [stockUpdate, setStockUpdate] = useState({ product_id: '', quantity: '', type: 'in', reason: '' });
  const [newProduct, setNewProduct] = useState({ name: '', price: '', cost: '', stock_quantity: '', category_id: 1, preparation_area: 'direct', is_unlimited: false });
  const [newCategory, setNewCategory] = useState({ name: '', color: '#10B981' });
  const [newTable, setNewTable]     = useState({ name: '', capacity: 4, is_vip: false });

  const EMPTY_EXPENSE = { title: '', amount: '', category: 'operational', notes: '' };
  const [expenseForm, setExpenseForm]         = useState(EMPTY_EXPENSE);
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  // ─────────────────────────────────────────────
  // TOAST
  // ─────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // ─────────────────────────────────────────────
  // FETCH FUNCTIONS
  // ─────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get('/products');
      setProducts(res.data.data || res.data);
    } catch { showToast('Failed to load products', 'error'); }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get('/categories');
      setCategories(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch { showToast('Failed to load categories', 'error'); }
  }, []);

  const fetchTables = useCallback(async () => {
    try {
      const res = await axios.get('/tables');
      setTables(res.data.data || []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch { showToast('Failed to load users', 'error'); }
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await axios.get('/expenses');
      setExpenses(Array.isArray(res.data) ? res.data : []);
    } catch { setExpenses([]); }
  }, []);

  const fetchDailyReport = useCallback(async (from, to, payment, cashier) => {
    setIsLoading(true);
    try {
      const res = await axios.get('/reports/daily', {
        params: { from_date: from, to_date: to, payment_method: payment, cashier_id: cashier }
      });
      setReport(res.data.data);
    } catch { showToast('Failed to load daily report', 'error'); }
    finally { setIsLoading(false); }
  }, []);

  const fetchSales = useCallback(async () => {
    try {
      const res = await axios.get('/sales');
      setSales(
        Array.isArray(res?.data?.data?.data) ? res.data.data.data
          : Array.isArray(res?.data?.data)   ? res.data.data
          : Array.isArray(res?.data)         ? res.data : []
      );
    } catch { setSales([]); }
  }, []);

  const loadCashierReport = useCallback(async () => {
    try {
      const res = await axios.get('/reports/cashiers');
      setCashierReport(Array.isArray(res.data) ? res.data : []);
    } catch { showToast('Failed to load cashier report', 'error'); }
  }, []);

  const loadZReport = useCallback(async () => {
    try {
      const res = await axios.get('/reports/z-report');
      setZReport(res.data);
    } catch { showToast('Failed to load Z-Report', 'error'); }
  }, []);

  const loadBranches = useCallback(async () => {
    try {
      const res = await axios.get('/branches');
      setBranches(res.data.data || []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchStockMovements = useCallback(async () => {
    try {
      const res = await axios.get('/stock-movements');
      setStockMovements(res.data.data || []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await axios.get('/settings');
      if (res.data) setSettings(prev => ({ ...prev, ...res.data }));
    } catch (err) { console.error('Could not load settings', err); }
  }, []);

  const fetchActiveBranch = useCallback(async () => {
    try {
      const res = await axios.get('/branches/active');
      if (res.data.data) {
        setActiveBranch(res.data.data);
        setBranchForm({
          name:     res.data.data.name     || '',
          address:  res.data.data.address  || '',
          phone:    res.data.data.phone    || '',
          location: res.data.data.location || '',
        });
      }
    } catch (err) { console.error('Could not load active branch', err); }
  }, []);

  // ─────────────────────────────────────────────
  // SINGLE MOUNT EFFECT
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchTables();
    fetchSales();
    fetchUsers();
    fetchDailyReport(fromDate, toDate, paymentMethod, cashierId);
    fetchExpenses();
    loadCashierReport();
    loadZReport();
    loadBranches();
    fetchStockMovements();
    fetchSettings();
    fetchActiveBranch();
    axios.get('/me')
      .then(res => setSelectedBranch(res.data.data.branch_id))
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (adminTab === 'dashboard') {
      fetchDailyReport(fromDate, toDate, paymentMethod, cashierId);
      fetchExpenses();
    }
    if (adminTab === 'cashiers')     loadCashierReport();
    if (adminTab === 'z-report')     loadZReport();
    if (adminTab === 'branches')     loadBranches();
    if (adminTab === 'stock-history') fetchStockMovements();
  }, [fromDate, toDate, paymentMethod, cashierId, adminTab]);

  useEffect(() => { setSalesPage(1); }, [salesSearch]);

  // ─────────────────────────────────────────────
  // PRINT HANDLERS FOR DIFFERENT REPORTS
  // ─────────────────────────────────────────────
  const printInventoryReport = () => {
    const tableRows = products.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${p.category?.name || '-'}</td>
        <td>${Number(p.price).toLocaleString()}</td>
        <td>${p.is_unlimited ? '♾️' : (p.stock_quantity || 0)}</td>
        <td>${((p.cost || 0) * (p.stock_quantity || 0)).toLocaleString()}</td>
      </tr>
    `).join('');
    const tableHtml = `
      <table>
        <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Value</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <p><strong>Total Inventory Value:</strong> ${inventoryValue.toLocaleString()} ${settings.currency}</p>
    `;
    printThermalReport('Inventory Report', tableHtml, `Low Stock Items: ${lowStockCount}`);
  };

  const printCashierReport = () => {
    const tableRows = cashierReport.map(c => `
      <tr>
        <td>${c.name}</td>
        <td>${c.orders_count || 0}</td>
        <td>${Number(c.total_sales || 0).toLocaleString()}</td>
        <td>${c.orders_count ? (c.total_sales / c.orders_count).toLocaleString() : 0}</td>
      </tr>
    `).join('');
    const tableHtml = `
      <table>
        <thead><tr><th>Cashier</th><th>Orders</th><th>Total Sales</th><th>Avg Order</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
    printThermalReport('Cashier Performance Report', tableHtml);
  };

  const printZReport = () => {
    if (!zReport) return;
    const tableHtml = `
      <table>
        <tr><td>Transactions</td><td>${zReport.transactions || 0}</td></tr>
        <tr><td>Total Sales</td><td>${Number(zReport.total_sales || 0).toLocaleString()} ${settings.currency}</td></tr>
        <tr><td>Cash Sales</td><td>${Number(zReport.cash_sales || 0).toLocaleString()}</td></tr>
        <tr><td>Mobile Money</td><td>${Number(zReport.mobile_sales || 0).toLocaleString()}</td></tr>
        <tr><td>Card Sales</td><td>${Number(zReport.card_sales || 0).toLocaleString()}</td></tr>
        <tr><td>Avg Order Value</td><td>${zReport.transactions ? (zReport.total_sales / zReport.transactions).toLocaleString() : 0}</td></tr>
      </table>
    `;
    printThermalReport('End-of-Day Z-Report', tableHtml);
  };

  const printStockHistory = () => {
    const tableRows = stockMovements.map(m => `
      <tr>
        <td>${new Date(m.created_at).toLocaleString()}</td>
        <td>${m.product?.name || '-'}</td>
        <td>${m.type}</td>
        <td>${Math.abs(m.quantity)}</td>
        <td>${m.user?.name || '-'}</td>
      </tr>
    `).join('');
    const tableHtml = `
      <table>
        <thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Qty</th><th>By</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
    printThermalReport('Stock Movement History', tableHtml);
  };

  const printProductsList = () => {
    const tableRows = products.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${p.category?.name || '-'}</td>
        <td>${Number(p.price).toLocaleString()}</td>
        <td>${p.is_unlimited ? '♾️' : (p.stock_quantity || 0)}</td>
      </tr>
    `).join('');
    const tableHtml = `
      <table>
        <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
    printThermalReport('Complete Product List', tableHtml);
  };

  // ─────────────────────────────────────────────
  // PRODUCTS, CATEGORIES, TABLES, USERS, ETC.
  // (all existing functions unchanged)
  // ─────────────────────────────────────────────
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const src       = editingProduct || newProduct;
      const unlimited = Boolean(src.is_unlimited);
      const payload   = {
        tenant_id:        1,
        name:             src.name,
        price:            parseFloat(src.price),
        cost:       parseFloat(src.cost) || 0,
        stock_quantity:   unlimited ? 0 : (parseInt(src.stock_quantity) || 0),
        is_unlimited:     unlimited,
        category_id:      parseInt(src.category_id),
        preparation_area: src.preparation_area,
      };
      if (editingProduct) {
        await axios.put(`/products/${editingProduct.id}`, payload);
        showToast('Product updated successfully');
        setEditingProduct(null);
      } else {
        await axios.post('/products', payload);
        showToast('Product added successfully');
        setNewProduct({ name: '', price: '', cost: '', stock_quantity: '', category_id: categories[0]?.id || 1, preparation_area: 'direct', is_unlimited: false });
      }
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    } finally { setIsSubmitting(false); }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!stockUpdate.product_id) return showToast('Please select a product', 'error');
    if (!stockUpdate.quantity)   return showToast('Please enter quantity', 'error');
    try {
      await axios.post('/products/update-stock', {
        product_id: Number(stockUpdate.product_id),
        quantity:   Number(stockUpdate.quantity),
        type:       stockUpdate.type,
        reason:     stockUpdate.reason,
      });
      showToast('Stock updated successfully');
      setStockUpdate({ product_id: '', quantity: '', type: 'in', reason: '' });
      fetchProducts();
      fetchStockMovements();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update stock', 'error');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/categories', { tenant_id: 1, name: newCategory.name, color: newCategory.color });
      showToast('Category added');
      setNewCategory({ name: '', color: '#10B981' });
      fetchCategories();
    } catch { showToast('Failed to add category', 'error'); }
  };

  const handleSaveCategoryEdit = async ({ name, color }) => {
    try {
      await axios.put(`/categories/${editingCategoryModal.id}`, { name, color });
      fetchCategories();
      showToast('Category updated');
    } catch { showToast('Update failed', 'error'); }
    finally { setEditingCategoryModal(null); }
  };

  const handleDeleteCategory = (category) => {
    setConfirmModal({
      message: `Delete category "${category.name}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await axios.delete(`/categories/${category.id}`);
          fetchCategories();
          showToast('Category deleted');
        } catch { showToast('Delete failed', 'error'); }
        finally { setConfirmModal(null); }
      }
    });
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/tables', newTable);
      showToast('Table added');
      setNewTable({ name: '', capacity: 4, is_vip: false });
      fetchTables();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add table', 'error');
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload = { name: editingUser.name, email: editingUser.email, role: editingUser.role };
        if (editingUser.password) payload.password = editingUser.password;
        await axios.put(`/users/${editingUser.id}`, payload);
        showToast('User updated successfully');
        setEditingUser(null);
      } else {
        await axios.post('/users', newUser);
        showToast('User created successfully');
        setNewUser({ name: '', email: '', password: '', role: 'cashier' });
      }
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save user', 'error');
    }
  };

  const handleDeleteUser = (id) => {
    setConfirmModal({
      message: 'Delete this user? This cannot be undone.',
      onConfirm: async () => {
        try {
          await axios.delete(`/users/${id}`);
          fetchUsers();
          showToast('User deleted');
        } catch { showToast('Failed to delete user', 'error'); }
        finally { setConfirmModal(null); }
      }
    });
  };

  const toggleUserStatus = async (user) => {
    try {
      await axios.put(`/users/${user.id}`, {
        name:      user.name,
        email:     user.email,
        role:      user.role,
        is_active: !user.is_active,
      });
      showToast(`User ${user.is_active ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch { showToast('Failed to update user status', 'error'); }
  };

  const openAddExpense = () => {
    setEditingExpenseId(null);
    setExpenseForm(EMPTY_EXPENSE);
    setShowExpenseModal(true);
  };

  const openEditExpense = (exp) => {
    setEditingExpenseId(exp.id);
    setExpenseForm({
      title:    exp.title    || '',
      amount:   exp.amount   || '',
      category: exp.category || 'operational',
      notes:    exp.notes    || '',
    });
    setShowExpenseModal(true);
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    try {
      if (editingExpenseId) {
        await axios.put(`/expenses/${editingExpenseId}`, expenseForm);
        showToast('Expense updated successfully');
      } else {
        await axios.post('/expenses', expenseForm);
        showToast('Expense added successfully');
      }
      setShowExpenseModal(false);
      setEditingExpenseId(null);
      setExpenseForm(EMPTY_EXPENSE);
      fetchExpenses();
      fetchDailyReport(fromDate, toDate, paymentMethod, cashierId);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save expense', 'error');
    }
  };

  const handleDeleteExpense = (id) => {
    setConfirmModal({
      message: 'Delete this expense?',
      onConfirm: async () => {
        try {
          await axios.delete(`/expenses/${id}`);
          showToast('Expense deleted');
          fetchExpenses();
          fetchDailyReport(fromDate, toDate, paymentMethod, cashierId);
        } catch { showToast('Failed to delete expense', 'error'); }
        finally { setConfirmModal(null); }
      }
    });
  };

  const handleConfirmVoid = async (reason) => {
    try {
      await axios.post(`/sales/${voidSaleId}/void`, { reason });
      showToast('Sale voided — stock restored');
      fetchSales();
      fetchDailyReport(fromDate, toDate, paymentMethod, cashierId);
      loadCashierReport();
      loadZReport();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to void sale', 'error');
    } finally { setVoidSaleId(null); }
  };

  const viewReceipt = async (saleId) => {
    try {
      const res = await axios.get(`/sales/${saleId}`);
      setSelectedSale(res.data);
      setShowReceipt(true);
    } catch { showToast('Failed to load receipt', 'error'); }
  };

  const handleResetFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today); setToDate(today);
    setPaymentMethod(''); setCashierId('');
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await axios.put('/settings', settings);
      showToast('Business settings saved successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save settings', 'error');
    } finally { setIsSavingSettings(false); }
  };

  const handleSaveBranchSettings = async (e) => {
    e.preventDefault();
    if (!activeBranch) return;
    setIsSavingBranch(true);
    try {
      await axios.put(`/branches/${activeBranch.id}`, branchForm);
      showToast(`${branchForm.name} branch details saved`);
      fetchActiveBranch();
      loadBranches();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save branch details', 'error');
    } finally { setIsSavingBranch(false); }
  };

  const createBranch = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/branches', newBranch);
      setNewBranch({ name: '', location: '', phone: '' });
      loadBranches();
      showToast('Branch created successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create branch', 'error');
    }
  };

  const editBranch = async (branch) => {
    const name = prompt('Branch Name', branch.name);
    if (!name) return;
    try {
      await axios.put(`/branches/${branch.id}`, {
        name,
        location: branch.location,
        phone: branch.phone,
      });
      loadBranches();
      showToast('Branch updated successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update branch', 'error');
    }
  };

  const deleteBranch = async (id) => {
    if (!window.confirm('Delete this branch?')) return;
    try {
      await axios.delete(`/branches/${id}`);
      loadBranches();
      showToast('Branch deleted successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete branch', 'error');
    }
  };

  const handleSwitchBranch = async (branchId) => {
    try {
      await axios.post('/switch-branch', { branch_id: branchId });
      const me = await axios.get('/me');
      setSelectedBranch(me.data.data.branch_id);
      fetchProducts(); fetchSales();
      fetchDailyReport(fromDate, toDate, paymentMethod, cashierId);
      fetchActiveBranch();
      showToast('Branch switched successfully');
    } catch { showToast('Failed to switch branch', 'error'); }
  };

  // ── DERIVED VALUES ────────────────────────────
  const inventoryValue = products.reduce(
    (sum, p) => sum + (Number(p.cost || 0) * Number(p.stock_quantity || 0)), 0
  );
  const lowStockCount    = products.filter(p => !p.is_unlimited && (p.stock_quantity || 0) <= 10).length;
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredSales = (sales || []).filter(sale =>
    sale.receipt_number?.toLowerCase().includes(salesSearch.toLowerCase()) ||
    sale.payment_method?.toLowerCase().includes(salesSearch.toLowerCase()) ||
    sale.user?.name?.toLowerCase().includes(salesSearch.toLowerCase())
  );
  const currentSales = filteredSales.slice((salesPage - 1) * itemsPerPage, salesPage * itemsPerPage);
  const totalPages   = Math.ceil(filteredSales.length / itemsPerPage);

  const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const netProfit     = (report?.total_sales || 0) - totalExpenses;

  const TABS = [
    { id: 'dashboard',        name: 'Dashboard',       icon: LayoutDashboard, color: 'emerald' },
    { id: 'analytics',        name: 'Analytics',        icon: TrendingUp,      color: 'purple'  },
    { id: 'sales',            name: 'Sales',            icon: Receipt,         color: 'blue'    },
    { id: 'inventory-report', name: 'Inventory Report', icon: ClipboardList,   color: 'orange'  },
    { id: 'inventory',        name: 'Stock Control',    icon: Box,             color: 'amber'   },
    { id: 'stock-history',    name: 'Stock History',    icon: Clock,           color: 'cyan'    },
    { id: 'products',         name: 'Products',         icon: Package,         color: 'green'   },
    { id: 'categories',       name: 'Categories',       icon: Boxes,           color: 'indigo'  },
    { id: 'tables',           name: 'Tables',           icon: Coffee,          color: 'yellow'  },
    { id: 'cashiers',         name: 'Cashiers',         icon: Award,           color: 'teal'    },
    { id: 'z-report',         name: 'Z Report',         icon: FileText,        color: 'cyan'    },
    { id: 'users',            name: 'Users',            icon: UserCircle,      color: 'red'     },
    { id: 'branches',         name: 'Branches',         icon: Building,        color: 'blue'    },
    { id: 'settings',         name: 'Settings',         icon: Settings,        color: 'slate'   },
  ];

  // ─────────────────────────────────────────────
  // RENDER (JSX with added print buttons)
  // ─────────────────────────────────────────────
  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen relative">

      {confirmModal && (
        <ConfirmModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />
      )}
      {voidSaleId && (
        <VoidSaleModal onConfirm={handleConfirmVoid} onCancel={() => setVoidSaleId(null)} />
      )}
      {editingCategoryModal && (
        <CategoryEditModal category={editingCategoryModal} onSave={handleSaveCategoryEdit} onCancel={() => setEditingCategoryModal(null)} />
      )}

      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white font-bold ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}>
            {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
            {toast.message}
          </div>
        ))}
      </div>

      {/* HEADER (unchanged) */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            {settings.restaurantName} Administration
          </h1>
          <p className="text-slate-500 mt-1">Complete management system for your business</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm">
          <span className="font-bold text-slate-700 flex items-center gap-2">
            <Building size={18} className="text-emerald-600" /> Active Branch
          </span>
          <select value={selectedBranch} onChange={(e) => handleSwitchBranch(Number(e.target.value))}
            className="border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium">
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="text-right bg-white px-6 py-3 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-slate-400 font-mono">Admin Access</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-3 mb-6 flex-wrap sticky top-0 bg-slate-100/95 backdrop-blur-sm py-2 z-10">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setAdminTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all text-sm hover:scale-105
              ${adminTab === tab.id ? `bg-${tab.color}-600 text-white shadow-lg` : 'bg-white text-slate-600 hover:shadow-md'}`}>
            <tab.icon size={16} />{tab.name}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          DASHBOARD (unchanged)
      ══════════════════════════════════════ */}
      {adminTab === 'dashboard' && (
        <div>
          {/* Filter Bar (unchanged) */}
          <div className="bg-white rounded-3xl p-6 shadow-lg mb-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2"><Calendar size={20} className="text-emerald-600" /> Report Filters</h2>
              <button onClick={handleResetFilters} className="text-slate-500 hover:text-emerald-600 text-sm flex items-center gap-1"><RefreshCw size={14} /> Reset</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              <input type="date" value={toDate}   onChange={(e) => setToDate(e.target.value)}   className="border rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="border rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="">All Payments</option>
                <option value="Cash">💵 Cash</option>
                <option value="Mobile Money">📱 Mobile Money</option>
                <option value="Card">💳 Card</option>
              </select>
              <select value={cashierId} onChange={(e) => setCashierId(e.target.value)} className="border rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="">All Cashiers</option>
                {users.filter(u => u.role === 'cashier').map(c => (
                  <option key={c.id} value={c.id}>👤 {c.name}</option>
                ))}
              </select>
              <button onClick={() => fetchDailyReport(fromDate, toDate, paymentMethod, cashierId)}
                disabled={isLoading}
                className="bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 py-3">
                {isLoading ? 'Loading...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {/* Action Buttons (unchanged) */}
          <div className="flex gap-3 mb-6 justify-end">
            <button onClick={openAddExpense} className="bg-red-500 text-white px-5 py-3 rounded-2xl font-bold hover:bg-red-600 flex items-center gap-2">
              <DollarSign size={18} /> Add Expense
            </button>
            <button onClick={() => setShowPrintReport(true)} className="bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-emerald-700 flex items-center gap-2">
              <Printer size={18} /> Print Day Report
            </button>
            <button onClick={() => setShowThermalAnalytics(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2">
              <TrendingUp size={18} /> Thermal Analytics
            </button>
          </div>

          {/* Stats and other dashboard content (unchanged) */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl shadow-lg border border-emerald-100 hover:scale-105 transition">
                  <p className="text-slate-500 text-sm">Total Sales</p>
                  <h2 className="text-3xl font-bold text-emerald-600 mt-2">{Number(report?.total_sales || 0).toLocaleString()} {settings.currency}</h2>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl shadow-lg border border-blue-100 hover:scale-105 transition">
                  <p className="text-slate-500 text-sm">Total Orders</p>
                  <h2 className="text-3xl font-bold text-blue-600 mt-2">{report?.total_orders || 0}</h2>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-2xl shadow-lg border border-purple-100 hover:scale-105 transition">
                  <p className="text-slate-500 text-sm">Total Expenses</p>
                  <h2 className="text-3xl font-bold text-purple-600 mt-2">{totalExpenses.toLocaleString()} {settings.currency}</h2>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-2xl shadow-lg border border-green-100 hover:scale-105 transition">
                  <p className="text-slate-500 text-sm">Net Profit</p>
                  <h2 className={`text-3xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{netProfit.toLocaleString()} {settings.currency}</h2>
                </div>
              </div>

              {expenses.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <DollarSign size={20} className="text-red-500" /> Expenses
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="bg-slate-50">
                        <th className="p-3 text-left">Title</th>
                        <th className="p-3 text-left">Category</th>
                        <th className="p-3 text-left">Notes</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr></thead>
                      <tbody>
                        {expenses.map(exp => (
                          <tr key={exp.id} className="border-t hover:bg-slate-50">
                            <td className="p-3 font-medium">{exp.title}</td>
                            <td className="p-3 capitalize">{exp.category}</td>
                            <td className="p-3 text-slate-500 text-sm">{exp.notes || '-'}</td>
                            <td className="p-3 text-right font-bold text-red-500">{Number(exp.amount).toLocaleString()} {settings.currency}</td>
                            <td className="p-3 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => openEditExpense(exp)} className="text-blue-500 hover:bg-blue-100 p-2 rounded">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDeleteExpense(exp.id)} className="text-red-500 hover:bg-red-100 p-2 rounded">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <AnalyticsDashboard report={report} expenses={expenses} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-2xl shadow-lg p-5">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Receipt size={20} className="text-blue-600" /> Recent Sales</h2>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {(report?.recent_sales || []).map((sale) => (
                      <div key={sale.id} className="flex justify-between border-b pb-2 hover:bg-slate-50 p-2 rounded-lg">
                        <div>
                          <p className="font-bold font-mono">{sale.receipt_number}</p>
                          <p className="text-xs text-slate-500">{sale.payment_method}</p>
                          <p className="text-xs text-slate-400">{new Date(sale.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600">{Number(sale.total).toLocaleString()} {settings.currency}</div>
                          <div className="text-xs text-slate-400">{sale.user?.name || '-'}</div>
                        </div>
                      </div>
                    ))}
                    {(!report?.recent_sales || report.recent_sales.length === 0) && (
                      <p className="text-slate-500 text-center py-8">No recent sales</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-5">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Package size={20} className="text-orange-600" /> Top Products</h2>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {(report?.top_products?.length > 0) ? report.top_products.map((p, i) => (
                      <div key={i} className="flex justify-between items-center border-b pb-2 p-2 rounded-lg hover:bg-slate-50">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600">{i + 1}</div>
                          <div>
                            <div className="font-bold">{p.name}</div>
                            <div className="text-xs text-slate-500">{p.quantity} units sold</div>
                          </div>
                        </div>
                        <div className="text-emerald-600 font-bold">{Number(p.amount || 0).toLocaleString()} {settings.currency}</div>
                      </div>
                    )) : (
                      <p className="text-slate-500 text-center py-8">No product data</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ANALYTICS (unchanged) */}
      {adminTab === 'analytics' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><PieChart size={24} className="text-purple-600" /> Advanced Analytics</h2>
          <AnalyticsDashboard report={report} expenses={expenses} />
        </div>
      )}

      {/* SALES (unchanged) */}
      {adminTab === 'sales' && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b flex gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search receipt, payment, cashier..."
                value={salesSearch} onChange={(e) => setSalesSearch(e.target.value)}
                className="w-full p-3 pl-10 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              {salesSearch && <button onClick={() => setSalesSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={18} className="text-slate-400" /></button>}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100"><tr>
                <th className="p-4 text-left">Receipt #</th>
                <th className="p-4 text-left">Date & Time</th>
                <th className="p-4 text-left">Total ({settings.currency})</th>
                <th className="p-4 text-left">Payment</th>
                <th className="p-4 text-left">Cashier</th>
                <th className="p-4 text-left">Actions</th>
              </tr></thead>
              <tbody>
                {currentSales.length > 0 ? currentSales.map((sale) => (
                  <tr key={sale.id} className="border-t hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold">{sale.receipt_number}</td>
                    <td className="p-4">
                      {new Date(sale.created_at).toLocaleDateString()}<br />
                      <span className="text-xs text-slate-400">{new Date(sale.created_at).toLocaleTimeString()}</span>
                    </td>
                    <td className="p-4 font-bold text-emerald-600">{Number(sale.total).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${paymentBadge(sale.payment_method)}`}>
                        {sale.payment_method}
                      </span>
                    </td>
                    <td className="p-4">{sale.user?.name || '-'}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => viewReceipt(sale.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1"><Eye size={14} /> View</button>
                        <button onClick={() => setVoidSaleId(sale.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1"><AlertTriangle size={14} /> Void</button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="6" className="p-8 text-center text-slate-500">No sales found</td></tr>}
              </tbody>
            </table>
            <div className="p-4 border-t flex justify-between items-center bg-slate-50">
              <button disabled={salesPage === 1} onClick={() => setSalesPage(p => p - 1)} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 font-bold">Previous</button>
              <span className="text-slate-500">Page {salesPage} of {totalPages || 1}</span>
              <button disabled={salesPage >= totalPages} onClick={() => setSalesPage(p => p + 1)} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 font-bold">Next</button>
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY REPORT (added print button) */}
      {adminTab === 'inventory-report' && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><ClipboardList size={24} className="text-orange-600" /> Inventory Report</h2>
            <div className="flex gap-3">
              <button onClick={printInventoryReport} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                <Printer size={16} /> Print Report
              </button>
              {lowStockCount > 0 && <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2"><AlertTriangle size={16} /> {lowStockCount} Low Stock</div>}
              <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl font-bold">{products.length} Products</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-50 to-amber-50"><tr>
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-center">Category</th>
                <th className="p-4 text-center">Sell Price</th>
                <th className="p-4 text-center">Cost</th>
                <th className="p-4 text-center">Stock Qty</th>
                <th className="p-4 text-right">Stock Value</th>
              </tr></thead>
              <tbody>
                {products.map((product) => {
                  const stockValue = Number(product.cost || 0) * Number(product.stock_quantity || 0);
                  return (
                    <tr key={product.id} className="border-b hover:bg-slate-50">
                      <td className="p-4 flex items-center gap-2"><Package size={16} className="text-slate-400" /><span className="font-bold">{product.name}</span></td>
                      <td className="p-4 text-center"><span className="px-2 py-1 bg-slate-100 rounded-full text-xs">{product.category?.name || 'Uncategorized'}</span></td>
                      <td className="p-4 text-center font-mono">{Number(product.price || 0).toLocaleString()}</td>
                      <td className="p-4 text-center font-mono text-slate-500">{Number(product.cost || 0).toLocaleString()}</td>
                      <td className="p-4 text-center">
                        {product.is_unlimited ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">♾️ Unlimited</span>
                        ) : (
                          <>
                            <span className={`font-mono font-bold ${(product.stock_quantity || 0) <= 10 ? 'text-red-600' : 'text-slate-700'}`}>
                              {product.stock_quantity || 0}
                            </span>
                            {(product.stock_quantity || 0) <= 10 && <span className="ml-1 animate-pulse">⚠️</span>}
                          </>
                        )}
                      </td>
                      <td className="p-4 text-right font-bold text-emerald-600">{stockValue.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100">
                <tr><td colSpan="5" className="p-4 text-right font-bold">Total Inventory Value:</td><td className="p-4 text-right font-black text-xl text-emerald-700">{inventoryValue.toLocaleString()} {settings.currency}</td></tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* STOCK CONTROL (unchanged) */}
      {adminTab === 'inventory' && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Update Stock</h2>
          {products.some(p => p.is_unlimited) && (
            <div className="mb-4 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm font-medium">
              ♾️ Unlimited products (tea, coffee etc.) are not shown here — they don't track stock.
            </div>
          )}
          <form onSubmit={handleUpdateStock} className="flex flex-col sm:flex-row gap-4 items-end flex-wrap">
            <select value={stockUpdate.product_id} onChange={(e) => setStockUpdate({...stockUpdate, product_id: e.target.value})}
              className="p-3 border rounded-xl flex-1 focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="">Select Product</option>
              {products.filter(p => !p.is_unlimited).map((p) => (
                <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity || 0})</option>
              ))}
            </select>
            <select value={stockUpdate.type} onChange={(e) => setStockUpdate({...stockUpdate, type: e.target.value})} className="p-3 border rounded-xl">
              <option value="in">➕ Stock In</option>
              <option value="out">➖ Stock Out</option>
              <option value="adjust">🔄 Adjustment</option>
            </select>
            <input type="number" placeholder="Quantity" value={stockUpdate.quantity} onChange={(e) => setStockUpdate({...stockUpdate, quantity: e.target.value})} className="p-3 border rounded-xl w-32" />
            <input type="text" placeholder="Reason (Optional)" value={stockUpdate.reason} onChange={(e) => setStockUpdate({...stockUpdate, reason: e.target.value})} className="p-3 border rounded-xl flex-1" />
            <button type="submit" className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-emerald-700">Save</button>
          </form>
        </div>
      )}

      {/* STOCK HISTORY (added print button) */}
      {adminTab === 'stock-history' && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Clock size={24} className="text-cyan-600" /> Stock Movement History</h2>
            <div className="flex gap-3">
              <button onClick={printStockHistory} className="bg-cyan-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                <Printer size={16} /> Print Report
              </button>
              <button onClick={fetchStockMovements} className="bg-cyan-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-cyan-700 flex items-center gap-2"><RefreshCw size={16} /> Refresh</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-cyan-50 to-blue-50"><tr className="border-b">
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-center">Qty</th>
                <th className="p-4 text-left">By</th>
                <th className="p-4 text-left">Reason</th>
              </tr></thead>
              <tbody>
                {stockMovements.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-slate-50">
                    <td className="p-4 text-sm">{new Date(m.created_at).toLocaleString()}</td>
                    <td className="p-4 font-medium">{m.product?.name || '-'}</td>
                    <td className="p-4">
                      {m.type === 'in'     && <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">➕ In</span>}
                      {m.type === 'out'    && <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">➖ Out</span>}
                      {m.type === 'adjust' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">🔄 Adjust</span>}
                    </td>
                    <td className="p-4 text-center font-bold">{Math.abs(m.quantity)}</td>
                    <td className="p-4 text-slate-500">{m.user?.name || '-'}</td>
                    <td className="p-4 text-slate-600">{m.reason || '-'}</td>
                  </tr>
                ))}
                {stockMovements.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500">No movements yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCTS (added print button) */}
      {adminTab === 'products' && (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <button onClick={printProductsList} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                <Printer size={16} /> Print All Products
              </button>
            </div>
            <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input type="text" placeholder="Product Name" value={editingProduct ? editingProduct.name : newProduct.name} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} className="p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
              <input type="number" step="0.01" placeholder="Selling Price" value={editingProduct ? editingProduct.price : newProduct.price} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})} className="p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
              <input type="number" step="0.01" placeholder="Cost (optional)" value={editingProduct ? (editingProduct.cost || '') : (newProduct.cost || '')} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, cost: e.target.value}) : setNewProduct({...newProduct, cost: e.target.value})} className="p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl cursor-pointer col-span-1">
                <input type="checkbox"
                  checked={editingProduct ? Boolean(editingProduct.is_unlimited) : Boolean(newProduct.is_unlimited)}
                  onChange={(e) => editingProduct
                    ? setEditingProduct({...editingProduct, is_unlimited: e.target.checked, stock_quantity: e.target.checked ? 0 : editingProduct.stock_quantity})
                    : setNewProduct({...newProduct, is_unlimited: e.target.checked, stock_quantity: e.target.checked ? 0 : newProduct.stock_quantity})}
                  className="w-5 h-5 accent-blue-600" />
                <div>
                  <span className="font-bold text-blue-800">Unlimited Stock ♾️</span>
                  <p className="text-xs text-blue-600">For tea, coffee, water — stock never decrements</p>
                </div>
              </label>
              {!(editingProduct ? editingProduct.is_unlimited : newProduct.is_unlimited) && (
                <input type="number" placeholder="Stock Quantity" value={editingProduct ? editingProduct.stock_quantity : newProduct.stock_quantity} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, stock_quantity: e.target.value}) : setNewProduct({...newProduct, stock_quantity: e.target.value})} className="p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
              )}
              <select value={editingProduct ? editingProduct.category_id : newProduct.category_id} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, category_id: e.target.value}) : setNewProduct({...newProduct, category_id: e.target.value})} className="p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <select value={editingProduct ? editingProduct.preparation_area : newProduct.preparation_area} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, preparation_area: e.target.value}) : setNewProduct({...newProduct, preparation_area: e.target.value})} className="p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="direct">🏪 Direct / No Kitchen</option>
                <option value="bar">🍺 Bar</option>
                <option value="kitchen">🍳 Kitchen</option>
              </select>
              <div className="md:col-span-2 lg:col-span-3 flex gap-3">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700">{editingProduct ? 'Update Product' : '➕ Add Product'}</button>
                {editingProduct && <button type="button" onClick={() => setEditingProduct(null)} className="px-6 bg-slate-200 rounded-xl font-bold hover:bg-slate-300">Cancel</button>}
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4 gap-4">
              <h2 className="text-2xl font-bold">Inventory List</h2>
              <div className="relative w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="w-full p-3 pl-10 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filteredProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center border-b pb-3 hover:bg-slate-50 p-3 rounded-lg">
                  <div>
                    <p className="font-bold">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.category?.name} | {product.is_unlimited ? '♾️ Unlimited' : `Stock: ${product.stock_quantity}`}
                      {!product.is_unlimited && (product.stock_quantity || 0) <= 10 && <span className="ml-1 text-red-500 font-bold">⚠️ Low</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-emerald-600 font-bold">{Number(product.price).toLocaleString()} {settings.currency}</div>
                    </div>
                    <button onClick={() => setEditingProduct(product)} className="bg-blue-50 text-blue-600 p-3 rounded-lg hover:bg-blue-100"><Edit2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES (unchanged) */}
      {adminTab === 'categories' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Add Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <input type="text" placeholder="Category Name" value={newCategory.name} onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
              <input type="color" value={newCategory.color} onChange={(e) => setNewCategory({...newCategory, color: e.target.value})} className="w-full h-14 rounded-xl border p-1" />
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700">Add Category</button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Existing Categories</h2>
            {categories.map((category) => (
              <div key={category.id} className="flex justify-between items-center border-b pb-3 hover:bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: category.color }} />
                  <span className="font-bold">{category.name}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingCategoryModal(category)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-1"><Edit2 size={14} /> Edit</button>
                  <button onClick={() => handleDeleteCategory(category)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 flex items-center gap-1"><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TABLES (unchanged) */}
      {adminTab === 'tables' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Add Table</h2>
            <form onSubmit={handleAddTable} className="space-y-4">
              <input type="text" placeholder="Table Name" value={newTable.name} onChange={(e) => setNewTable({...newTable, name: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
              <input type="number" placeholder="Capacity" value={newTable.capacity} onChange={(e) => setNewTable({...newTable, capacity: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={newTable.is_vip} onChange={(e) => setNewTable({...newTable, is_vip: e.target.checked})} className="w-5 h-5 accent-emerald-600" />
                <span className="font-bold">Mark as VIP Table</span>
              </label>
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700">Add Table</button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Restaurant Tables</h2>
              <button onClick={fetchTables} className="bg-slate-200 px-3 py-2 rounded-xl text-sm font-bold hover:bg-slate-300 flex items-center gap-1"><RefreshCw size={14} /> Refresh</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tables.map((table) => (
                <div key={table.id} className={`p-5 rounded-2xl border shadow-sm hover:scale-105 transition
                  ${table.status === 'occupied' ? 'bg-red-50 border-red-200' :
                    table.status === 'reserved' ? 'bg-yellow-50 border-yellow-200' :
                    table.is_vip              ? 'bg-yellow-50 border-yellow-300' :
                                                'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{table.name}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Users size={12} /> {table.capacity} seats</p>
                      <span className={`text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded-full
                        ${table.status === 'occupied' ? 'bg-red-100 text-red-700' :
                          table.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' :
                                                         'bg-green-100 text-green-700'}`}>
                        {table.status}
                      </span>
                    </div>
                    {table.is_vip && <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded-full font-bold">👑 VIP</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CASHIERS (added print button) */}
      {adminTab === 'cashiers' && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black flex items-center gap-3"><Award size={28} className="text-teal-600" /> Cashier Performance</h2>
            <div className="flex gap-3">
              <button onClick={printCashierReport} className="bg-teal-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                <Printer size={16} /> Print Report
              </button>
              <button onClick={loadCashierReport} className="bg-teal-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2"><RefreshCw size={16} /> Refresh</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-teal-50 to-emerald-50"><tr>
                <th className="p-4 text-left">Cashier</th>
                <th className="p-4 text-left">Orders</th>
                <th className="p-4 text-left">Total Sales ({settings.currency})</th>
                <th className="p-4 text-left">Avg Order</th>
                <th className="p-4 text-left">Performance</th>
              </tr></thead>
              <tbody>
                {cashierReport.map((cashier, index) => {
                  const avg = cashier.orders_count > 0 ? cashier.total_sales / cashier.orders_count : 0;
                  const max = Math.max(...cashierReport.map(c => c.total_sales), 1);
                  return (
                    <tr key={index} className="border-b">
                      <td className="p-4 font-bold">{cashier.name}</td>
                      <td className="p-4">{cashier.orders_count || 0}</td>
                      <td className="p-4 text-emerald-600 font-bold">{Number(cashier.total_sales || 0).toLocaleString()}</td>
                      <td className="p-4">{Number(avg).toLocaleString()}</td>
                      <td className="p-4">
                        <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${(cashier.total_sales / max) * 100}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {cashierReport.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500">No cashier data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Z-REPORT (added print button) */}
      {adminTab === 'z-report' && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black flex items-center gap-3"><FileText size={28} className="text-cyan-600" /> End-of-Day Z-Report</h2>
            <div className="flex gap-3">
              <button onClick={printZReport} disabled={!zReport} className="bg-cyan-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50">
                <Printer size={16} /> Print Report
              </button>
              <button onClick={loadZReport} className="bg-cyan-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-cyan-700 flex items-center gap-2"><RefreshCw size={16} /> Refresh</button>
            </div>
          </div>
          {zReport ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                  <p className="text-slate-500 text-sm">Transactions</p>
                  <h3 className="text-3xl font-bold text-blue-600 mt-2">{zReport.transactions || 0}</h3>
                </div>
                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                  <p className="text-slate-500 text-sm">Total Sales</p>
                  <h3 className="text-3xl font-bold text-emerald-600 mt-2">{Number(zReport.total_sales || 0).toLocaleString()} {settings.currency}</h3>
                </div>
                <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
                  <p className="text-slate-500 text-sm">Avg Order Value</p>
                  <h3 className="text-3xl font-bold text-purple-600 mt-2">
                    {zReport.transactions > 0 ? Number(zReport.total_sales / zReport.transactions).toLocaleString() : 0} {settings.currency}
                  </h3>
                </div>
              </div>
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold mb-4">Payment Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center">
                    <span className="font-bold text-green-700">💵 Cash</span>
                    <span className="text-xl font-bold text-green-700">{Number(zReport.cash_sales || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center">
                    <span className="font-bold text-purple-700">📱 Mobile Money</span>
                    <span className="text-xl font-bold text-purple-700">{Number(zReport.mobile_sales || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center">
                    <span className="font-bold text-blue-700">💳 Card</span>
                    <span className="text-xl font-bold text-blue-700">{Number(zReport.card_sales || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <FileText size={48} className="mx-auto mb-4 text-slate-300" />
              <p>No Z-Report data yet</p>
              <button onClick={loadZReport} className="mt-4 bg-cyan-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-cyan-700">Load</button>
            </div>
          )}
        </div>
      )}

      {/* USERS (unchanged) */}
      {adminTab === 'users' && (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-black mb-6">{editingUser ? 'Edit User' : 'Add Staff User'}</h2>
            <form onSubmit={handleSaveUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Full Name" value={editingUser ? editingUser.name : newUser.name} onChange={(e) => editingUser ? setEditingUser({...editingUser, name: e.target.value}) : setNewUser({...newUser, name: e.target.value})} className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none" required />
              <input type="email" placeholder="Email Address" value={editingUser ? editingUser.email : newUser.email} onChange={(e) => editingUser ? setEditingUser({...editingUser, email: e.target.value}) : setNewUser({...newUser, email: e.target.value})} className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none" required />
              <input type="password" placeholder={editingUser ? 'Leave blank to keep password' : 'Password'} value={editingUser ? (editingUser.password || '') : newUser.password} onChange={(e) => editingUser ? setEditingUser({...editingUser, password: e.target.value}) : setNewUser({...newUser, password: e.target.value})} className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none" required={!editingUser} />
              <select value={editingUser ? editingUser.role : newUser.role} onChange={(e) => editingUser ? setEditingUser({...editingUser, role: e.target.value}) : setNewUser({...newUser, role: e.target.value})} className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="admin">👑 Admin</option>
                <option value="manager">📊 Manager</option>
                <option value="cashier">💰 Cashier</option>
                <option value="waiter">🍽️ Waiter</option>
                <option value="kitchen">👨‍🍳 Kitchen</option>
              </select>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="bg-emerald-600 text-white px-6 py-4 rounded-xl font-black flex-1 hover:bg-emerald-700">{editingUser ? 'Update User' : 'Create User'}</button>
                {editingUser && <button type="button" onClick={() => setEditingUser(null)} className="px-6 bg-slate-200 rounded-xl font-bold hover:bg-slate-300">Cancel</button>}
              </div>
            </form>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100"><tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr></thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t hover:bg-slate-50">
                    <td className="p-4 font-bold">{user.name}</td>
                    <td className="p-4 text-slate-500">{user.email}</td>
                    <td className="p-4 capitalize font-bold text-slate-700">{user.role}</td>
                    <td className="p-4">
                      <button onClick={() => toggleUserStatus(user)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold transition ${user.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                        {user.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {user.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => setEditingUser(user)} className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-200"><Edit2 size={14} /></button>
                      <button onClick={() => handleDeleteUser(user.id)} className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-200"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500">No users found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BRANCHES (unchanged) */}
      {adminTab === 'branches' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Add Branch</h2>
            <form onSubmit={createBranch} className="space-y-4">
              <input type="text" placeholder="Branch Name" value={newBranch.name} onChange={(e) => setNewBranch({...newBranch, name: e.target.value})} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
              <input type="text" placeholder="Location" value={newBranch.location} onChange={(e) => setNewBranch({...newBranch, location: e.target.value})} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              <input type="text" placeholder="Phone" value={newBranch.phone} onChange={(e) => setNewBranch({...newBranch, phone: e.target.value})} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              <button type="submit" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 w-full">Create Branch</button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Existing Branches</h2>
            {branches.length === 0 && <p className="text-slate-500 text-center py-8">No branches yet</p>}
            {branches.map(branch => (
              <div key={branch.id} className="border-b py-3 p-2 rounded-lg hover:bg-slate-50 flex justify-between items-center">
                <div>
                  <div className="font-bold text-emerald-700">{branch.name}</div>
                  <div className="text-sm text-slate-500 mt-1">📍 {branch.location} | 📞 {branch.phone}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editBranch(branch)} className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={() => deleteBranch(branch.id)} className="bg-red-100 text-red-700 px-3 py-2 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS (unchanged) */}
      {adminTab === 'settings' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Settings size={22} className="text-slate-600" />
              <h2 className="text-2xl font-bold">Business Settings</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6">These apply to <strong>all branches</strong> — name, currency, tax rate, receipt footer.</p>
            <form className="space-y-5" onSubmit={handleSaveSettings}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Business Name</label>
                <input type="text" value={settings.restaurantName} onChange={e => setSettings({...settings, restaurantName: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Currency</label>
                  <input type="text" value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tax Rate (%)</label>
                  <input type="number" value={settings.taxRate} onChange={e => setSettings({...settings, taxRate: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Receipt Footer Text</label>
                <textarea value={settings.receiptFooter} onChange={e => setSettings({...settings, receiptFooter: e.target.value})} placeholder="Thank you for your business!" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 resize-none" rows="3" />
              </div>
              <button type="submit" disabled={isSavingSettings} className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {isSavingSettings ? <><RefreshCw size={18} className="animate-spin" /> Saving...</> : <><CheckCircle size={18} /> Save Business Settings</>}
              </button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Building size={22} className="text-emerald-600" />
              <h2 className="text-2xl font-bold">Branch Settings</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6">These apply to the <strong className="text-emerald-600">{activeBranch?.name || 'active branch'}</strong> only — address and phone number.</p>
            <form className="space-y-5" onSubmit={handleSaveBranchSettings}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Branch Name</label>
                <input type="text" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                <input type="text" value={branchForm.phone} onChange={e => setBranchForm({...branchForm, phone: e.target.value})} placeholder="+256 700 000000" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
                <input type="text" value={branchForm.address} onChange={e => setBranchForm({...branchForm, address: e.target.value})} placeholder="e.g. Kampala Road, Kampala" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Location / Area</label>
                <input type="text" value={branchForm.location} onChange={e => setBranchForm({...branchForm, location: e.target.value})} placeholder="e.g. Kampala" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500" />
              </div>
              <button type="submit" disabled={isSavingBranch} className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold hover:bg-emerald-800 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {isSavingBranch ? <><RefreshCw size={18} className="animate-spin" /> Saving...</> : <><CheckCircle size={18} /> Save Branch Settings</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALS (unchanged) */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">{editingExpenseId ? 'Edit Expense' : 'Add Expense'}</h2>
            <form onSubmit={handleSaveExpense} className="space-y-4">
              <input type="text" placeholder="Title (e.g. Electricity Bill)" value={expenseForm.title}
                onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
              <input type="number" step="0.01" placeholder={`Amount (${settings.currency})`} value={expenseForm.amount}
                onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
              <select value={expenseForm.category} onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="operational">Operational</option>
                <option value="salary">Salary</option>
                <option value="utilities">Utilities</option>
                <option value="supplies">Supplies</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <textarea placeholder="Notes (optional)" value={expenseForm.notes}
                onChange={(e) => setExpenseForm({...expenseForm, notes: e.target.value})}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none" rows={2} />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold flex-1 hover:bg-emerald-700">
                  {editingExpenseId ? 'Update' : 'Save'}
                </button>
                <button type="button"
                  onClick={() => { setShowExpenseModal(false); setEditingExpenseId(null); setExpenseForm(EMPTY_EXPENSE); }}
                  className="bg-slate-200 px-5 py-3 rounded-xl font-bold flex-1 hover:bg-slate-300">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSale && showReceipt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto shadow-2xl">
            <ReceiptPrint sale={selectedSale} />
            <div className="flex gap-3 mt-4 sticky bottom-0 bg-white pt-4 border-t">
              <button onClick={() => window.print()} className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold flex-1 hover:bg-emerald-700 flex items-center justify-center gap-2"><Printer size={18} /> Print</button>
              <button onClick={() => { setShowReceipt(false); setSelectedSale(null); }} className="bg-slate-200 px-5 py-3 rounded-xl font-bold flex-1 hover:bg-slate-300">Close</button>
            </div>
          </div>
        </div>
      )}

      {showThermalAnalytics && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto shadow-2xl">
            <ThermalAnalyticsReport report={report} fromDate={fromDate} toDate={toDate} branch={activeBranch} />
            <div className="flex gap-3 mt-4 sticky bottom-0 bg-white pt-4 border-t">
              <button onClick={() => window.print()} className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold flex-1 hover:bg-emerald-700 flex items-center justify-center gap-2"><Printer size={18} /> Print</button>
              <button onClick={() => setShowThermalAnalytics(false)} className="bg-slate-200 px-5 py-3 rounded-xl font-bold flex-1 hover:bg-slate-300">Close</button>
            </div>
          </div>
        </div>
      )}

      {showPrintReport && <DailyReportPrint report={report} branch={activeBranch} onClose={() => setShowPrintReport(false)} />}
    </div>
  );
}