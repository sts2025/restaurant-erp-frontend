import React, { useEffect } from 'react';

export default function Receipt({
  receipt,
  onClose
}) {

  if (!receipt) return null;

  /**
   * PRINT RECEIPT
   */
  const printReceipt = () => {

    const content =
     document.getElementById(
  `receipt-print-${receipt.id}`
)?.innerHTML;

    if (!content) return;

    const win = window.open(
      '',
      '',
      'width=420,height=800'
    );

    win.document.write(`
      <html>
        <head>

          <title>Receipt</title>

          <style>

            @page{
              size:80mm auto;
              margin:0;
            }

            body{
              width:72mm;
              padding:8px;
              margin:0;
              font-family:Arial,sans-serif;
              color:#000;
            }

            h1{
              text-align:center;
              margin:0;
              font-size:20px;
            }

            .center{
              text-align:center;
            }

            .line{
              border-top:1px dashed #000;
              margin:8px 0;
            }

            .row{
              display:flex;
              justify-content:space-between;
              margin-bottom:4px;
            }

            .item{
              margin-bottom:8px;
            }

            .small{
              font-size:12px;
            }

          </style>

        </head>

        <body onload="window.print();window.close();">

          ${content}

        </body>

      </html>
    `);

    win.document.close();
  };

  /**
   * AUTO PRINT
   */
  useEffect(() => {

    const timer = setTimeout(() => {

      printReceipt();

    }, 500);

    return () => clearTimeout(timer);

  }, []);

  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white w-[360px] rounded-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}

        <div className="bg-emerald-600 text-white p-5 text-center">

          <h1 className="text-3xl font-black">

  {receipt.branch?.name ||
    'MAIN RESTAURANT'}

</h1>

          <p className="text-sm opacity-90">

            SALES RECEIPT

          </p>

        </div>

        {/* PRINT AREA */}

        <div
         id={`receipt-print-${receipt.id}`}
          className="p-5 text-sm"
        >

          {/* BUSINESS */}

          <div className="text-center mb-4">

            <p>Kampala, Uganda</p>

            <p>+256 700 000000</p>

          </div>

          <div className="border-t border-dashed border-black my-3"></div>

          {/* INFO */}

          <div className="space-y-1 mb-4">

            <div className="flex justify-between">

              <span>Receipt</span>

              <span className="font-bold">

                {receipt.receipt_number || receipt.id}

              </span>

            </div>

            <div className="flex justify-between">

              <span>Date</span>

              <span>

                {new Date(
                  receipt.created_at
                ).toLocaleString()}

              </span>

            </div>

            <div className="flex justify-between">

              <span>Table</span>

              <span>

                {receipt.table?.name ||
                  'Takeaway'}

              </span>

            </div>

            <div className="flex justify-between">

              <span>Payment</span>

              <span>

                {receipt.payment_method}

              </span>

            </div>

            {receipt.is_offline && (

              <div className="text-center text-red-600 font-bold mt-2">

                OFFLINE SALE

              </div>

            )}

          </div>

          <div className="border-t border-dashed border-black my-3"></div>

          {/* ITEMS */}

          <div>

            {receipt.items?.map(
              (item, index) => (

                <div
                  key={index}
                  className="mb-3"
                >

                  <div className="font-bold">

                    {item.product?.name ||
                      'Item'}

                  </div>
                  {receipt.is_reprint && (

  <div className="text-center text-red-600 font-bold mt-2">

    *** REPRINT COPY ***

  </div>

)}

                  <div className="flex justify-between text-xs">

                    <span>

                      {item.quantity} × {Number(
                        item.price || 0
                      ).toLocaleString()}

                    </span>

                    <span>

                      {Number(
                        item.total ||
                        (
                          item.quantity *
                          item.price
                        )
                      ).toLocaleString()}

                    </span>

                  </div>

                </div>

              )
            )}

          </div>

          <div className="border-t border-dashed border-black my-3"></div>

          {/* TOTALS */}

          <div className="space-y-2">

            <div className="flex justify-between">

              <span>Total</span>

              <span className="font-bold">

                {Number(
                  receipt.total || 0
                ).toLocaleString()} UGX

              </span>

            </div>

            <div className="flex justify-between">

              <span>Paid</span>

              <span className="font-bold">

                {Number(
                  receipt.paid ||
                  receipt.paid_amount ||
                  0
                ).toLocaleString()} UGX

              </span>

            </div>
            <div className="flex justify-between">

  <span>Cashier</span>

  <span>

    {receipt.user?.name || 'Staff'}

  </span>

</div>
<div className="flex justify-between">

  <span>Branch</span>

  <span>

    {receipt.branch?.name || 'Main'}

  </span>

</div>
<div className="flex justify-between">

  <span>Items</span>

  <span>

    {receipt.items?.reduce(
      (sum, item) =>
        sum + Number(item.quantity),
      0
    )}

  </span>

</div>

            <div className="flex justify-between text-emerald-700">

              <span>Change</span>

              <span className="font-bold">

                {Number(
                  receipt.change || 0
                ).toLocaleString()} UGX

              </span>

            </div>

          </div>

          <div className="border-t border-dashed border-black my-3"></div>

          {/* FOOTER */}

          <div className="text-center">

            <p className="font-bold">

              THANK YOU

            </p>

            <p className="text-xs text-slate-500">

              Please Come Again

            </p>

          </div>

        </div>

        {/* BUTTONS */}

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