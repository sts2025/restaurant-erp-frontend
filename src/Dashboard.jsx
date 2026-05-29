import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard({ token }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/analytics/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      console.log("DASHBOARD DATA:", res.data); // Look here in your console
      setStats(res.data);
    })
    .catch(err => console.error("DASHBOARD ERROR:", err));
  }, [token]);

  if (!stats) return <div className="p-10">Loading Dashboard Data...</div>;

  return (
    <div className="p-8 bg-slate-50">
      <h1 className="text-2xl font-bold mb-6">Manager Analytics</h1>
      
      {/* KPI Section */}
      <div className="flex gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow w-1/2">
          <p className="text-slate-500">Revenue Today</p>
          <p className="text-2xl font-bold">{stats.revenue_today} UGX</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow w-1/2">
          <p className="text-slate-500">Transactions</p>
          <p className="text-2xl font-bold">{stats.transactions_today}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="mb-4 font-semibold">Top Products (Sold Count)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.top_products}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product.name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_sold" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}