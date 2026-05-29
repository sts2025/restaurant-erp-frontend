import ThermalReportLayout
from './ThermalReportLayout';

export default function ThermalDailyReport({

  report,

  fromDate,

  toDate

}) {

  /**
   * CATEGORY TOTALS
   */
  const categoryTotals =
    report?.category_totals || {};

  /**
   * CATEGORY QUANTITIES
   */
  const categoryQuantities =
    report?.category_quantities || {};

  /**
   * PRODUCT SALES
   */
  const productSales =
    report?.product_sales || [];

  return (

    <ThermalReportLayout
      title="Daily Sales Report"
    >

      {/* DATE RANGE */}
      <div className="
        thermal-center
        thermal-small
      ">

        {fromDate}
        {' - '}
        {toDate}

      </div>

      <div className="
        thermal-divider
      " />

      {/* SALES BY CATEGORY */}
      <div className="
        thermal-section
      ">

        <div className="
          thermal-bold
          thermal-center
        ">

          Sales By Category

        </div>

        <div className="
          thermal-divider
        " />

        {Object.entries(
          categoryTotals
        ).map(([name, amount]) => (

          <div
            key={name}
            className="
              thermal-row
            "
          >

            <span>

              {name}

            </span>

            <span>

              {Number(amount)
                .toLocaleString()}
              {' '}
              UGX

            </span>

          </div>

        ))}

      </div>

      {/* CATEGORY QUANTITIES */}
      <div className="
        thermal-section
      ">

        <div className="
          thermal-bold
          thermal-center
        ">

          Quantities By Category

        </div>

        <div className="
          thermal-divider
        " />

        {Object.entries(
          categoryQuantities
        ).map(([name, qty]) => (

          <div
            key={name}
            className="
              thermal-row
            "
          >

            <span>

              {name}

            </span>

            <span>

              {qty}

            </span>

          </div>

        ))}

      </div>

      {/* PRODUCT SALES */}
      <div className="
        thermal-section
      ">

        <div className="
          thermal-bold
          thermal-center
        ">

          Products

        </div>

        <div className="
          thermal-divider
        " />

        <table className="
          thermal-table
        ">

          <thead>

            <tr>

              <td>
                Product
              </td>

              <td>
                Qty
              </td>

              <td>
                Amount
              </td>

            </tr>

          </thead>

          <tbody>

            {productSales.map((item) => (

              <tr key={item.name}>

                <td>

                  {item.name}

                </td>

                <td>

                  {item.quantity}

                </td>

                <td>

                  {Number(item.amount)
                    .toLocaleString()}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* TOTALS */}
      <div className="
        thermal-section
      ">

        <div className="
          thermal-divider
        " />

        <div className="
          thermal-row
          thermal-bold
        ">

          <span>
            Total Sales
          </span>

          <span>

            {Number(
              report?.total_sales || 0
            ).toLocaleString()}
            {' '}
            UGX

          </span>

        </div>

        <div className="
          thermal-row
        ">

          <span>
            Orders
          </span>

          <span>

            {report?.total_orders || 0}

          </span>

        </div>

        <div className="
          thermal-row
        ">

          <span>
            Cash
          </span>

          <span>

            {Number(
              report?.cash_sales || 0
            ).toLocaleString()}
            {' '}
            UGX

          </span>

        </div>

        <div className="
          thermal-row
        ">

          <span>
            Mobile Money
          </span>

          <span>

            {Number(
              report?.mobile_money_sales || 0
            ).toLocaleString()}
            {' '}
            UGX

          </span>

        </div>

      </div>

    </ThermalReportLayout>

  );
}