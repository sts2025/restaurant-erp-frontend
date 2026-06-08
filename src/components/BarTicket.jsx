import { useEffect } from 'react';

export default function BarTicket({ receipt }) {

  if (!receipt) return null;

  /**
   * ONLY BAR ITEMS
   */
  const barItems =
  receipt.items?.filter(
    item =>
     (item.product?.preparation_area ||
 item.preparation_area) === 'bar'
  ) || [];

  /**
   * DON'T PRINT IF THERE ARE NO
   * BAR ITEMS
   */
  if (barItems.length === 0) {
    return null;
  }

  /**
   * PRINT BAR TICKET
   */
  const printBarTicket = () => {

    const element =
document.getElementById(
 `bar-print-${receipt.id}`
);

if (!element) {
  console.log('Bar element not found');
  return;
}

const content = element.innerHTML;
    if (!content) {
      console.error(
        'Bar content not found'
      );
      return;
    }

    const win = window.open(
  '',
  '_blank',
  'width=420,height=800'
);

if (!win) {
  alert('Popup blocked. Allow popups for this site.');
  return;
}

    win.document.write(`

      <html>

        <head>

          <title>Bar Order</title>

          <style>

            @page{
              size:80mm auto;
              margin:0;
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
              font-size:24px;
            }

            h2{
              text-align:center;
              margin:8px 0;
              font-size:18px;
            }

            .line{
              border-top:1px dashed #000;
              margin:10px 0;
            }

            .item{
              display:flex;
              justify-content:space-between;
              margin-bottom:10px;
              font-size:18px;
              font-weight:bold;
            }

            .center{
              text-align:center;
            }

          </style>

        </head>

        <body>

          ${content}

        </body>

      </html>

    `);

    win.document.close();

    win.onload = () => {
   win.print();
   win.close();
};

  };

  /**
   * AUTO PRINT
   *
   * Delay allows customer
   * receipt to finish first.
   */
 useEffect(() => {

  if (!receipt) return;

  setTimeout(() => {
    printBarTicket();
  }, 2000);

}, [receipt]);

  return (

    <div
      id={`bar-print-${receipt.id}`}
      style={{ display: 'none' }}
    >

      <h1>
        BAR ORDER
      </h1>

      <h2>
        PREPARE DRINKS
      </h2>

      <div className="line"></div>

      <h2
        style={{
          textAlign: 'center',
          fontSize: '22px',
          margin: '10px 0'
        }}
      >
        #{receipt.receipt_number}
      </h2>

      <p>
        <strong>
          Table:
        </strong>

        {' '}

        {receipt.table?.name ||
          'TAKEAWAY'}
      </p>

      <p>
        <strong>
          Time:
        </strong>

        {' '}

        {new Date(
          receipt.created_at
        ).toLocaleString()}
      </p>

      <div className="line"></div>

      {barItems.map(item => (

        <div
          key={item.id}
          className="item"
        >

          <span>
            {item.quantity}x
          </span>

          <span>
            {item.product?.name}
          </span>

        </div>

      ))}

      {receipt.notes && (
        <>
          <div className="line"></div>

          <h3>
            SPECIAL NOTES
          </h3>

          <p>
            {receipt.notes}
          </p>
        </>
      )}

      <div className="line"></div>

      <div className="center">
        <strong>
          SEND TO BARTENDER
        </strong>
      </div>

    </div>

  );

}