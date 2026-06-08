/**
 * DailyReportPrint
 *
 * FIX: Now accepts `branch` prop so the report header shows
 * the correct branch name, address and phone.
 * Pass `branch={activeBranch}` from AdminView when opening this modal.
 */
export default function DailyReportPrint({ report, branch, onClose }) {

  const printReport = () => window.print();

  const branchName    = branch?.name     || 'Branch Report';
  const branchAddress = branch?.address  || branch?.location || '';
  const branchPhone   = branch?.phone    || '';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 print:shadow-none">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            {/* Business / branch identity on the report */}
            <h1 className="text-4xl font-black">{branchName}</h1>
            {branchAddress && (
              <p className="text-slate-500 text-sm mt-1">📍 {branchAddress}</p>
            )}
            {branchPhone && (
              <p className="text-slate-500 text-sm">📞 {branchPhone}</p>
            )}
            <p className="text-slate-400 text-sm mt-2">
              Daily Sales Report — {new Date().toLocaleDateString('en-UG', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>

          <div className="flex gap-3 print:hidden">
            <button
              onClick={printReport}
              className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-emerald-700"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="bg-slate-200 px-5 py-3 rounded-xl font-bold hover:bg-slate-300"
            >
              Close
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="border rounded-2xl p-5">
            <p className="text-slate-500 text-sm">Total Sales</p>
            <h2 className="text-3xl font-black text-emerald-600">
              {Number(report?.total_sales || 0).toLocaleString()} UGX
            </h2>
          </div>
          <div className="border rounded-2xl p-5">
            <p className="text-slate-500 text-sm">Orders</p>
            <h2 className="text-3xl font-black">{report?.total_orders || 0}</h2>
          </div>
          <div className="border rounded-2xl p-5">
            <p className="text-slate-500 text-sm">Cash Sales</p>
            <h2 className="text-3xl font-black">
              {Number(report?.cash_sales || 0).toLocaleString()} UGX
            </h2>
          </div>
          <div className="border rounded-2xl p-5">
            <p className="text-slate-500 text-sm">Mobile Money</p>
            <h2 className="text-3xl font-black">
              {Number(report?.mobile_money_sales || 0).toLocaleString()} UGX
            </h2>
          </div>
        </div>

        {/* TOP PRODUCTS */}
        <div className="mb-10">
          <h2 className="text-2xl font-black mb-4">Top Products</h2>
          <div className="border rounded-2xl overflow-hidden">
            {(report?.top_products || []).length > 0 ? (
              (report.top_products).map((product) => (
                <div key={product.id || product.name} className="flex justify-between p-4 border-b last:border-0">
                  <span className="font-bold">{product.name}</span>
                  <span className="text-slate-500">{product.quantity} sold</span>
                  <span className="font-bold text-emerald-600">
                    {Number(product.amount || 0).toLocaleString()} UGX
                  </span>
                </div>
              ))
            ) : (
              <p className="p-4 text-slate-500 text-center">No product data for this period</p>
            )}
          </div>
        </div>

        {/* RECENT SALES */}
        <div>
          <h2 className="text-2xl font-black mb-4">Recent Sales</h2>
          <table className="w-full border rounded-2xl overflow-hidden">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">Receipt</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">Payment</th>
                <th className="p-4 text-left">Cashier</th>
              </tr>
            </thead>
            <tbody>
              {(report?.recent_sales || []).map((sale) => (
                <tr key={sale.id} className="border-t">
                  <td className="p-4 font-bold font-mono">{sale.receipt_number}</td>
                  <td className="p-4">{Number(sale.total).toLocaleString()} UGX</td>
                  <td className="p-4 capitalize">{sale.payment_method}</td>
                  {/* FIX: cashier name via user relation */}
                  <td className="p-4">{sale.user?.name || '-'}</td>
                </tr>
              ))}
              {(report?.recent_sales || []).length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">No sales for this period</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PRINT FOOTER */}
        <div className="mt-8 pt-4 border-t text-center text-slate-400 text-sm print:block hidden">
          <p>{branchName} {branchAddress && `| ${branchAddress}`} {branchPhone && `| ${branchPhone}`}</p>
          <p>Printed on {new Date().toLocaleString()}</p>
        </div>

      </div>
    </div>
  );
}
