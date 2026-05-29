import {

  ResponsiveContainer,

  BarChart,

  Bar,

  XAxis,

  YAxis,

  Tooltip,

  PieChart,

  Pie,

  Cell

} from 'recharts';

export default function AnalyticsDashboard({

  report,

  expenses

}) {

  /**
   * SALES DATA
   */
  const salesData = [

    {

      name: 'Sales',

      value:
        Number(
          report?.total_sales || 0
        )

    },

    {

      name: 'Expenses',

      value:

        expenses.reduce(

          (sum, exp) =>

            sum +
            Number(exp.amount),

          0

        )

    }

  ];

  /**
   * PAYMENT DATA
   */
  const paymentData = [

    {

      name: 'Cash',

      value:
        Number(
          report?.cash_sales || 0
        )

    },

    {

      name: 'Mobile',

      value:
        Number(
          report?.mobile_money_sales || 0
        )

    }

  ];

  /**
   * PROFIT
   */
  const estimatedProfit =

    Number(
      report?.total_sales || 0
    )

    -

    expenses.reduce(

      (sum, exp) =>

        sum +
        Number(exp.amount),

      0

    );

  return (

    <div className="
      grid
      lg:grid-cols-2
      gap-6
      mt-8
    ">

      {/* SALES VS EXPENSES */}
      <div className="
        bg-white
        rounded-3xl
        p-6
        shadow-sm
      ">

        <h2 className="
          text-2xl
          font-black
          mb-6
        ">

          Sales Overview

        </h2>

        <div className="
          h-80
        ">

          <ResponsiveContainer>

            <BarChart
              data={salesData}
            >

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="value" />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* PAYMENTS */}
      <div className="
        bg-white
        rounded-3xl
        p-6
        shadow-sm
      ">

        <h2 className="
          text-2xl
          font-black
          mb-6
        ">

          Payment Methods

        </h2>

        <div className="
          h-80
        ">

          <ResponsiveContainer>

            <PieChart>

              <Pie

                data={paymentData}

                dataKey="value"

                nameKey="name"

                outerRadius={100}

                label

              >

                {paymentData.map(
                  (_, index) => (

                  <Cell
                    key={index}
                  />

                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* PROFIT CARD */}
      <div className="
        bg-emerald-50
        border
        border-emerald-200
        rounded-3xl
        p-8
      ">

        <p className="
          text-emerald-600
          font-bold
        ">

          Estimated Profit

        </p>

        <h2 className="
          text-5xl
          font-black
          text-emerald-700
          mt-4
        ">

          {estimatedProfit
            .toLocaleString()}
          {' '}
          UGX

        </h2>

      </div>

      {/* ORDERS */}
      <div className="
        bg-blue-50
        border
        border-blue-200
        rounded-3xl
        p-8
      ">

        <p className="
          text-blue-600
          font-bold
        ">

          Total Orders

        </p>

        <h2 className="
          text-5xl
          font-black
          text-blue-700
          mt-4
        ">

          {report?.total_orders || 0}

        </h2>

      </div>

    </div>

  );

}