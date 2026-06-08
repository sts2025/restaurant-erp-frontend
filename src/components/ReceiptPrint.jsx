import ThermalReportLayout from './ThermalReportLayout';

/**
 * ReceiptPrint
 *
 * FIX: Branch address and phone now come from sale.branch
 * which is loaded by SaleController.show() via the branch relation.
 * No more hardcoded address or phone numbers.
 *
 * Make sure SaleController.show() loads the branch relation:
 *   Sale::with(['items.product', 'user', 'branch'])->...
 */
export default function ReceiptPrint({ sale }) {
  if (!sale) return null;

  const branch  = sale.branch  || {};
  const address = branch.address || branch.location || '';
  const phone   = branch.phone   || '';
  const branchName = branch.name || 'Main Branch';

  return (
    <ThermalReportLayout title={branchName}>

      {/* BRANCH CONTACT DETAILS — from database, not hardcoded */}
      {address && (
        <div className="thermal-center thermal-small">{address}</div>
      )}
      {phone && (
        <div className="thermal-center thermal-small">{phone}</div>
      )}

      <div className="thermal-divider" />

      {/* RECEIPT INFO */}
      <div className="thermal-small">
        Receipt: {sale.receipt_number}
      </div>
      <div className="thermal-small">
        {new Date(sale.created_at).toLocaleString()}
      </div>
      {sale.table?.name && (
        <div className="thermal-small">
          Table: {sale.table.name}
        </div>
      )}
      {sale.user?.name && (
        <div className="thermal-small">
          Cashier: {sale.user.name}
        </div>
      )}

      {sale.is_reprint && (
        <div className="thermal-center thermal-bold" style={{ color: 'red' }}>
          *** REPRINT COPY ***
        </div>
      )}

      <div className="thermal-divider" />

      {/* ITEMS */}
      {sale.items?.map((item) => (
        <div key={item.id} className="thermal-section">
          <div className="thermal-row">
            <span>{item.product?.name || 'Item'}</span>
            <span>{Number(item.quantity * item.price).toLocaleString()}</span>
          </div>
          <div className="thermal-small">
            {item.quantity} x {Number(item.price).toLocaleString()}
          </div>
        </div>
      ))}

      <div className="thermal-divider" />

      {/* TOTALS */}
      <div className="thermal-row thermal-bold">
        <span>TOTAL</span>
        <span>{Number(sale.total).toLocaleString()} UGX</span>
      </div>

      <div className="thermal-row">
        <span>PAID</span>
        <span>{Number(sale.paid).toLocaleString()} UGX</span>
      </div>

      <div className="thermal-row">
        <span>CHANGE</span>
        <span>{Number(sale.change || 0).toLocaleString()} UGX</span>
      </div>

      <div className="thermal-row">
        <span>ITEMS</span>
        <span>
          {sale.items?.reduce((sum, item) => sum + Number(item.quantity), 0)}
        </span>
      </div>

      <div className="thermal-divider" />

      {/* PAYMENT METHOD */}
      <div className="thermal-center">{sale.payment_method}</div>

      <div className="thermal-divider" />

      {/* FOOTER */}
      <div className="thermal-center thermal-bold">THANK YOU</div>
      <div className="thermal-center thermal-small">Please Come Again</div>

    </ThermalReportLayout>
  );
}
