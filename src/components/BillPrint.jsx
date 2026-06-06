const printBill = () => {

  if (cart.length === 0) {
    alert('Cart is empty');
    return;
  }

  const content = `
    <html>
      <head>
        <title>Proforma Bill</title>

        <style>
          body{
            width:72mm;
            font-family:monospace;
            padding:10px;
          }

          h2{
            text-align:center;
          }

          .row{
            display:flex;
            justify-content:space-between;
            margin-bottom:5px;
          }

          hr{
            margin:8px 0;
          }
        </style>
      </head>

      <body>

        <h2>PROFORMA BILL</h2>

        <div>
          Table:
          ${selectedTable?.name || 'Takeaway'}
        </div>

        <hr/>

        ${cart.map(item => `
          <div class="row">
            <span>
              ${item.quantity} x ${item.name}
            </span>

            <span>
              ${(item.quantity * item.price).toLocaleString()}
            </span>
          </div>
        `).join('')}

        <hr/>

        <h3>
          TOTAL:
          ${total.toLocaleString()} UGX
        </h3>

        ${
          orderNotes
          ? `<p>Notes: ${orderNotes}</p>`
          : ''
        }

      </body>
    </html>
  `;

  const win = window.open(
    '',
    '',
    'width=420,height=800'
  );

  win.document.write(content);

  win.document.close();

  win.focus();

  setTimeout(() => {
    win.print();
  }, 300);
};