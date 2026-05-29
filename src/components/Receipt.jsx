import React from 'react';

export default function Receipt({
  receipt,
  onClose
}) {
  if (!receipt) return null;

  /**
   * PRINT RECEIPT
   */
  const printReceipt = () => {
    const content = document.getElementById('receipt-print').innerHTML;
    const win = window.open('', '', 'width=400,height=700');

    win.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              width: 80mm;
              padding: 10px;
              color: #000;
            }
            .center {
              text-align: center;
            }
            .bold {
              font-weight: bold;
            }
            .line {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .small {
              font-size: 12px;
            }
            h1 {
              margin: 0;
              font-size: 24px;
            }
            @media print {
              body {
                width: 80mm;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${content}
        </body>
      </html>
    `);

    win.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[360px] rounded-2xl shadow-2xl overflow-hidden">
        {/* TOP HEADER */}
        <div className="bg-emerald-600 text-white p-5 text-center">
          <h1 className="text-3xl font-bold tracking-wide">
            MAIN RESTAURANT
          </h1>
          <p className="text-sm opacity-90">
            SALES RECEIPT
          </p>
        </div>

        {/* RECEIPT CONTENT WITH PRINT ID */}
        <div id="receipt-print" className="p-5 text-sm">
          {/* BUSINESS INFO */}
          <div className="text-center mb-4 text-slate-700">
            <p>Kampala, Uganda</p>
            <p>+256 700 000000</p>
          </div>

          <div className="border-t border-dashed border-black my-3"></div>

          {/* RECEIPT INFO */}
          <div className="space-y-1 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt</span>
              <span className="font-bold">{receipt.receipt_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Table</span>
              <span>{receipt.table_id || 'Takeaway'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment</span>
              <span>{receipt.payment_method}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-black my-3"></div>

          {/* ITEMS */}
          <div>
            {receipt.items?.map((item, index) => (
              <div key={index} className="mb-3">
                <div className="font-bold text-[15px]">
                  {item.product?.name || 'Item'}
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{item.quantity} × {Number(item.price).toLocaleString()}</span>
                  <span>{Number(item.total).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-black my-3"></div>

          {/* TOTALS */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-bold">{Number(receipt.total).toLocaleString()} UGX</span>
            </div>
            <div className="flex justify-between">
              <span>Paid</span>
              <span className="font-bold">{Number(receipt.paid).toLocaleString()} UGX</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Change</span>
              <span className="font-bold">{Number(receipt.change).toLocaleString()} UGX</span>
            </div>
          </div>

          <div className="border-t border-dashed border-black my-3"></div>

          {/* FOOTER */}
          <div className="text-center mt-5">
            <p className="font-bold text-base">THANK YOU</p>
            <p className="text-xs text-slate-500 mt-1">Please Come Again</p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2">
          <button
            onClick={onClose}
            className="py-4 border-r font-bold hover:bg-slate-100"
          >
            Close
          </button>
          <button
            onClick={printReceipt}
            className="py-4 bg-emerald-600 text-white font-bold hover:bg-emerald-700"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}