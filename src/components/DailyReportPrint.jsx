export default function DailyReportPrint({

  report,

  onClose

}) {

  const printReport = () =>
  {
    window.print();
  };

  return (

    <div className="
      fixed
      inset-0
      bg-black/40
      z-50
      flex
      items-center
      justify-center
      p-6
    ">

      <div className="
        bg-white
        rounded-3xl
        w-full
        max-w-4xl
        max-h-[90vh]
        overflow-y-auto
        p-8
        print:shadow-none
      ">

        {/* HEADER */}
        <div className="
          flex
          justify-between
          items-center
          mb-8
        ">

          <div>

            <h1 className="
              text-4xl
              font-black
            ">

              Daily Sales Report

            </h1>

            <p className="
              text-slate-500
              mt-2
            ">

              {new Date()
                .toLocaleDateString()}

            </p>

          </div>

          <div className="
            flex
            gap-3
            print:hidden
          ">

            <button

              onClick={printReport}

              className="
                bg-emerald-600
                text-white
                px-5
                py-3
                rounded-xl
                font-bold
              "
            >

              Print

            </button>

            <button

              onClick={onClose}

              className="
                bg-slate-200
                px-5
                py-3
                rounded-xl
                font-bold
              "
            >

              Close

            </button>

          </div>

        </div>

        {/* SUMMARY */}
        <div className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-4
          mb-10
        ">

          <div className="
            border
            rounded-2xl
            p-5
          ">

            <p className="
              text-slate-500
            ">

              Total Sales

            </p>

            <h2 className="
              text-3xl
              font-black
              text-emerald-600
            ">

              {Number(
                report?.total_sales || 0
              ).toLocaleString()}
              {' '}
              UGX

            </h2>

          </div>

          <div className="
            border
            rounded-2xl
            p-5
          ">

            <p className="
              text-slate-500
            ">

              Orders

            </p>

            <h2 className="
              text-3xl
              font-black
            ">

              {report?.total_orders || 0}

            </h2>

          </div>

          <div className="
            border
            rounded-2xl
            p-5
          ">

            <p className="
              text-slate-500
            ">

              Cash Sales

            </p>

            <h2 className="
              text-3xl
              font-black
            ">

              {Number(
                report?.cash_sales || 0
              ).toLocaleString()}
              {' '}
              UGX

            </h2>

          </div>

          <div className="
            border
            rounded-2xl
            p-5
          ">

            <p className="
              text-slate-500
            ">

              Mobile Money

            </p>

            <h2 className="
              text-3xl
              font-black
            ">

              {Number(
                report?.mobile_money_sales || 0
              ).toLocaleString()}
              {' '}
              UGX

            </h2>

          </div>

        </div>

        {/* TOP PRODUCTS */}
        <div className="mb-10">

          <h2 className="
            text-2xl
            font-black
            mb-4
          ">

            Top Products

          </h2>

          <div className="
            border
            rounded-2xl
            overflow-hidden
          ">

            {Object.entries(
              report?.top_products || {}
            ).map(([name, qty]) => (

              <div

                key={name}

                className="
                  flex
                  justify-between
                  p-4
                  border-b
                "
              >

                <span className="
                  font-bold
                ">

                  {name}

                </span>

                <span>

                  {qty} sold

                </span>

              </div>

            ))}

          </div>

        </div>

        {/* RECENT SALES */}
        <div>

          <h2 className="
            text-2xl
            font-black
            mb-4
          ">

            Recent Sales

          </h2>

          <table className="
            w-full
            border
            rounded-2xl
            overflow-hidden
          ">

            <thead className="
              bg-slate-100
            ">

              <tr>

                <th className="p-4 text-left">
                  Receipt
                </th>

                <th className="p-4 text-left">
                  Total
                </th>

                <th className="p-4 text-left">
                  Payment
                </th>

              </tr>

            </thead>

            <tbody>

              {(report?.recent_sales || [])
                .map((sale) => (

                <tr
                  key={sale.id}
                  className="border-t"
                >

                  <td className="
                    p-4
                    font-bold
                  ">

                    {sale.receipt_number}

                  </td>

                  <td className="p-4">

                    {Number(
                      sale.total
                    ).toLocaleString()}
                    {' '}
                    UGX

                  </td>

                  <td className="
                    p-4
                    capitalize
                  ">

                    {sale.payment_method}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}