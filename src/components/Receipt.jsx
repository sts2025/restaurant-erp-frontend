import React, { useEffect, useRef } from 'react';

export default function Receipt({ receipt, onClose }) {
  const printedRef = useRef(false);

  useEffect(() => {
    if (!receipt) return;
    if (printedRef.current) return;

    printedRef.current = true;

    const receiptHtml = `
    <html>
    <head>
      <title>Receipt</title>
      <style>
        /* Fix 1: Updated page and body styles */
        @page {
          margin: 0;
          size: 80mm auto;
        }

        html, body {
          width: 72mm;
          margin: 0;
          padding: 2mm;
          font-family: monospace;
          font-size: 12px;
          display: inline-block;
        }

        /* Fix 2: Receipt wrapper forces tight wrap */
        .receipt {
          width: 72mm;
          display: inline-block;
        }

        /* Fix 3: Remove default paragraph margins */
        p {
          margin: 2px 0;
        }

        /* Existing receipt styling */
        .center {
          text-align: center;
        }

        .line {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin: 2px 0;
        }

        .big {
          font-size: 18px;
          font-weight: bold;
        }

        .bold {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <!-- Fix 2: Wrap entire content in .receipt -->
      <div class="receipt">
        <div class="center">
          <div class="big">
            ${receipt.branch?.name || 'MY BUSINESS'}
          </div>
          <div>
            ${receipt.branch?.address || 'Kampala, Uganda'}
          </div>
          <div>
            Tel: ${receipt.branch?.phone || '0700000000'}
          </div>
        </div>

        <div class="line"></div>

        <div>Receipt: ${receipt.receipt_number}</div>
        <div>Date: ${new Date(receipt.created_at).toLocaleString()}</div>
        <div>Cashier: ${receipt.user?.name || 'ADMIN'}</div>
        <div>Table: ${receipt.table?.name || 'TAKEAWAY'}</div>
        <div>Payment: ${receipt.payment_method || 'CASH'}</div>

        <div class="line"></div>

        ${(receipt.items || [])
          .map(
            (item) => `
          <div>${item.quantity} x ${item.product?.name || ''}</div>
          <div class="row">
            <span>@ ${Number(item.price).toLocaleString()}</span>
            <span>${Number(item.quantity * item.price).toLocaleString()}</span>
          </div>
        `
          )
          .join('')}

        <div class="line"></div>

        <div class="row">
          <span>Items</span>
          <span>
            ${(receipt.items || []).reduce(
              (total, item) => total + Number(item.quantity),
              0
            )}
          </span>
        </div>

        <div class="row bold">
          <span>TOTAL</span>
          <span>${Number(receipt.total || 0).toLocaleString()}</span>
        </div>

        <div class="row bold">
          <span>PAID</span>
          <span>
            ${Number(
              receipt.paid_amount || receipt.paid || receipt.total || 0
            ).toLocaleString()}
          </span>
        </div>

        <div class="row bold">
          <span>CHANGE</span>
          <span>${Number(receipt.change || 0).toLocaleString()}</span>
        </div>

        <div class="line"></div>

        <div class="center">
          THANK YOU<br/>
          PLEASE COME AGAIN
        </div>
      </div>
    </body>
    </html>
    `;

    const printWindow = window.open('', 'PRINT', 'height=600,width=400');

    if (!printWindow) {
      console.error('Popup blocked');
      return;
    }

    printWindow.document.write(receiptHtml);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();

      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    }, 500);
  }, [receipt, onClose]);

  return null;
}