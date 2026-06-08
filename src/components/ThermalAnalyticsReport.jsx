import ThermalReportLayout from './ThermalReportLayout';

/**
 * ThermalAnalyticsReport
 *
 * FIX: Now accepts `branch` prop so the thermal report header shows
 * the correct branch name, address and phone.
 * Pass `branch={activeBranch}` from AdminView when opening this modal.
 */
export default function ThermalAnalyticsReport({ report, fromDate, toDate, branch }) {
  if (!report) return null;

  const branchName    = branch?.name     || 'Branch Report';
  const branchAddress = branch?.address  || branch?.location || '';
  const branchPhone   = branch?.phone    || '';

  return (
    <ThermalReportLayout title={branchName}>

      {/* BRANCH CONTACT — from database */}
      {branchAddress && (
        <div className="thermal-center thermal-small">{branchAddress}</div>
      )}
      {branchPhone && (
        <div className="thermal-center thermal-small">{branchPhone}</div>
      )}

      <div className="thermal-divider" />

      {/* REPORT TYPE */}
      <div className="thermal-bold thermal-center">SALES ANALYTICS</div>

      {/* DATE RANGE */}
      <div className="thermal-center thermal-small">
        {fromDate} - {toDate}
      </div>

      <div className="thermal-divider" />

      {/* SUMMARY */}
      <div className="thermal-section">
        <div className="thermal-row thermal-bold">
          <span>Orders</span>
          <span>{report.total_orders || 0}</span>
        </div>
        <div className="thermal-row thermal-bold">
          <span>Total Sales</span>
          <span>{Number(report.total_sales || 0).toLocaleString()} UGX</span>
        </div>
      </div>

      <div className="thermal-divider" />

      {/* PAYMENT SUMMARY */}
      <div className="thermal-section">
        <div className="thermal-bold thermal-center">Payment Summary</div>
        <div className="thermal-divider" />
        <div className="thermal-row">
          <span>Cash</span>
          <span>{Number(report.cash_sales || 0).toLocaleString()}</span>
        </div>
        <div className="thermal-row">
          <span>Mobile Money</span>
          <span>{Number(report.mobile_money_sales || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="thermal-divider" />

      {/* CATEGORY SALES */}
      {Object.keys(report.category_totals || {}).length > 0 && (
        <div className="thermal-section">
          <div className="thermal-bold thermal-center">Sales By Category</div>
          <div className="thermal-divider" />
          {Object.entries(report.category_totals || {}).map(([name, amount]) => (
            <div key={name} className="thermal-row">
              <span>{name}</span>
              <span>{Number(amount).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      <div className="thermal-divider" />

      {/* TOP PRODUCTS */}
      {(report.top_products || []).length > 0 && (
        <div className="thermal-section">
          <div className="thermal-bold thermal-center">Top Products</div>
          <div className="thermal-divider" />
          {(report.top_products || []).slice(0, 20).map((product) => (
            <div key={product.id || product.name} className="thermal-row">
              <span>{product.name} x{product.quantity}</span>
              <span>{Number(product.amount || 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      <div className="thermal-divider" />

      {/* FOOTER */}
      <div className="thermal-center thermal-small">
        Printed: {new Date().toLocaleString()}
      </div>
      <div className="thermal-center thermal-small">{branchName}</div>

    </ThermalReportLayout>
  );
}
