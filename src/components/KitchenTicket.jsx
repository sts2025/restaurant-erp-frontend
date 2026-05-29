import { useEffect } from 'react';

export default function KitchenTicket({ receipt }) {

  if (!receipt) return null;

  const printKitchenTicket = () => {

    const content =
      document.getElementById('kitchen-print')
        ?.innerHTML;

    if (!content) {
      console.error('Kitchen content not found');
      return;
    }

    const win = window.open(
      '',
      '',
      'width=400,height=700'
    );

    win.document.write(`
      <html>
        <head>
          <title>Kitchen Order</title>

          <style>

            @page {
              size: 80mm auto;
              margin: 0;
            }

            body{
              width:72mm;
              margin:0;
              padding:8px;
              font-family:monospace;
              color:#000;
            }

            h1{
              text-align:center;
              margin:0;
              font-size:22px;
            }

            .line{
              border-top:1px dashed #000;
              margin:8px 0;
            }

            .item{
              display:flex;
              justify-content:space-between;
              margin-bottom:8px;
              font-size:16px;
              font-weight:bold;
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

  useEffect(() => {

    if (!receipt) return;

    setTimeout(() => {
      printKitchenTicket();
    }, 500);

  }, [receipt]);

  return (

    <div
      id="kitchen-print"
      style={{ display: 'none' }}
    >

      <h1>KITCHEN ORDER</h1>

      <div className="line"></div>

      <p>
        Receipt:
        {' '}
        {receipt.receipt_number}
      </p>

      <p>
        Table:
        {' '}
        {receipt.table?.name || 'TAKEAWAY'}
      </p>

      <p>
        Time:
        {' '}
        {new Date(
          receipt.created_at
        ).toLocaleString()}
      </p>

      <div className="line"></div>

      {receipt.items?.map(item => (

        <div
          key={item.id}
          className="item"
        >
          <span>
            {item.product?.name}
          </span>

          <span>
            x{item.quantity}
          </span>
        </div>

      ))}

      <div className="line"></div>

      <h3
        style={{
          textAlign: 'center'
        }}
      >
        PREPARE IMMEDIATELY
      </h3>

    </div>

  );
}