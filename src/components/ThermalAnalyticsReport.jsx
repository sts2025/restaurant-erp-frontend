import ThermalReportLayout
from './ThermalReportLayout';

export default function ThermalAnalyticsReport({

  report,

  fromDate,

  toDate

}) {

  if (!report)
    return null;

  return (

    <ThermalReportLayout
      title="Sales Analytics"
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

      {/* CATEGORY SALES */}
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

          report.category_totals || {}

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

          Product Sales

        </div>

        <div className="
          thermal-divider
        " />

        {(report.product_sales || [])
          .slice(0, 20)
          .map((product) => (

          <div
            key={product.name}
            className="
              thermal-row
            "
          >

            <span>

              {product.name}
              {' x'}
              {product.quantity}

            </span>

            <span>

              {Number(
                product.amount
              ).toLocaleString()}

            </span>

          </div>

        ))}

      </div>

      {/* PAYMENTS */}
      <div className="
        thermal-section
      ">

        <div className="
          thermal-bold
          thermal-center
        ">

          Payment Summary

        </div>

        <div className="
          thermal-divider
        " />

        <div className="
          thermal-row
        ">

          <span>
            Cash
          </span>

          <span>

            {Number(
              report.cash_sales
            ).toLocaleString()}

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
              report.mobile_money_sales
            ).toLocaleString()}

          </span>

        </div>

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
            Orders
          </span>

          <span>

            {report.total_orders}

          </span>

        </div>

        <div className="
          thermal-row
          thermal-bold
        ">

          <span>
            Total Sales
          </span>

          <span>

            {Number(
              report.total_sales
            ).toLocaleString()}

          </span>

        </div>

      </div>

    </ThermalReportLayout>

  );

}