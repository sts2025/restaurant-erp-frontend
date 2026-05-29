import ThermalReportLayout
from './ThermalReportLayout';

export default function ReceiptPrint({

  sale

}) {

  if (!sale)
    return null;

  return (

    <ThermalReportLayout
      title="Customer Receipt"
    >

      {/* RECEIPT INFO */}
      <div className="
        thermal-small
      ">

        Receipt:
        {' '}
        {sale.receipt_number}

      </div>

      <div className="
        thermal-small
      ">

        {new Date(
          sale.created_at
        ).toLocaleString()}

      </div>

      <div className="
        thermal-divider
      " />

      {/* ITEMS */}
      {sale.items?.map((item) => (

        <div
          key={item.id}
          className="
            thermal-section
          "
        >

          <div className="
            thermal-row
          ">

            <span>

              {item.product?.name}

            </span>

            <span>

              {(item.quantity * item.price)
                .toLocaleString()}

            </span>

          </div>

          <div className="
            thermal-small
          ">

            {item.quantity}
            {' x '}
            {Number(item.price)
              .toLocaleString()}

          </div>

        </div>

      ))}

      <div className="
        thermal-divider
      " />

      {/* TOTAL */}
      <div className="
        thermal-row
        thermal-bold
      ">

        <span>
          TOTAL
        </span>

        <span>

          {Number(
            sale.total
          ).toLocaleString()}
          {' '}
          UGX

        </span>

      </div>

      {/* PAID */}
      <div className="
        thermal-row
      ">

        <span>
          PAID
        </span>

        <span>

          {Number(
            sale.paid
          ).toLocaleString()}
          {' '}
          UGX

        </span>

      </div>

      {/* CHANGE */}
      <div className="
        thermal-row
      ">

        <span>
          CHANGE
        </span>

        <span>

          {Number(
            sale.change
          ).toLocaleString()}
          {' '}
          UGX

        </span>

      </div>

      <div className="
        thermal-divider
      " />

      {/* PAYMENT */}
      <div className="
        thermal-center
      ">

        {sale.payment_method}

      </div>

      <div className="
        thermal-center
        thermal-small
      ">

        Thank you

      </div>

    </ThermalReportLayout>

  );

}