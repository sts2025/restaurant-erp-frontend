// File: src/components/ShiftReportPrint.jsx
import React from 'react';

// FIX: Import ThermalReportLayout properly (it's a component, not a default import)
import ThermalReportLayout from './ThermalReportLayout';

export default function ShiftReportPrint({
  shift,
  report,
  onClose
}) {
  if (!shift || !report) return null;

  /**
   * EXPECTED CASH
   */
  const expectedCash =
    Number(shift.starting_cash || 0) +
    Number(report.cash_sales || 0);

  /**
   * CASH DIFFERENCE
   */
  const difference =
    Number(shift.closing_cash || 0) - expectedCash;

  // Print function
  const handlePrint = () => {
    const printContent = document.getElementById('shift-report-print');
    if (!printContent) return;
    
    const originalTitle = document.title;
    document.title = 'Shift Report';
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Shift Report</title>
          <style>
            body {
              font-family: monospace;
              padding: 20px;
              max-width: 300px;
              margin: 0 auto;
            }
            .thermal-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .thermal-bold {
              font-weight: bold;
            }
            .thermal-divider {
              border-top: 1px dashed #000;
              margin: 12px 0;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    
    document.title = originalTitle;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div id="shift-report-print">
          <h1 className="text-center font-bold text-xl mb-4">Shift Report</h1>
          
          {/* CASHIER */}
          <div className="thermal-row">
            <span>Cashier</span>
            <span>{shift.user?.name}</span>
          </div>

          {/* DATE */}
          <div className="thermal-row">
            <span>Business Date</span>
            <span>{shift.business_date}</span>
          </div>

          {/* START */}
          <div className="thermal-row">
            <span>Start</span>
            <span>{new Date(shift.start_time).toLocaleTimeString()}</span>
          </div>

          {/* END */}
          <div className="thermal-row">
            <span>End</span>
            <span>{shift.end_time ? new Date(shift.end_time).toLocaleTimeString() : '-'}</span>
          </div>

          <div className="thermal-divider" />

          {/* OPENING CASH */}
          <div className="thermal-row">
            <span>Opening Cash</span>
            <span>{Number(shift.starting_cash).toLocaleString()} UGX</span>
          </div>

          {/* CASH SALES */}
          <div className="thermal-row">
            <span>Cash Sales</span>
            <span>{Number(report.cash_sales).toLocaleString()} UGX</span>
          </div>

          {/* EXPECTED */}
          <div className="thermal-row thermal-bold">
            <span>Expected Cash</span>
            <span>{Number(expectedCash).toLocaleString()} UGX</span>
          </div>

          {/* ACTUAL */}
          <div className="thermal-row">
            <span>Actual Cash</span>
            <span>{Number(shift.closing_cash).toLocaleString()} UGX</span>
          </div>

          {/* DIFFERENCE */}
          <div className="thermal-row thermal-bold">
            <span>Difference</span>
            <span style={{ color: difference >= 0 ? 'green' : 'red' }}>
              {Number(difference).toLocaleString()} UGX
            </span>
          </div>

          <div className="thermal-divider" />

          {/* SALES */}
          <div className="thermal-row">
            <span>Total Sales</span>
            <span>{Number(report.total_sales).toLocaleString()} UGX</span>
          </div>

          {/* ORDERS */}
          <div className="thermal-row">
            <span>Orders</span>
            <span>{report.total_orders}</span>
          </div>

          {/* MOBILE MONEY */}
          <div className="thermal-row">
            <span>Mobile Money</span>
            <span>{Number(report.mobile_money_sales).toLocaleString()} UGX</span>
          </div>
          
          {/* Card Sales */}
          <div className="thermal-row">
            <span>Card Sales</span>
            <span>{Number(report.card_sales || 0).toLocaleString()} UGX</span>
          </div>
          
          <div className="thermal-divider" />
          
          <div className="text-center text-xs mt-4">
            Thank you for your service!
          </div>
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={onClose}
            className="py-3 border rounded-xl font-bold hover:bg-slate-100 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
          >
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
}