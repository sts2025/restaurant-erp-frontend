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

  report = {},
  expenses = []

}) {

  /**
   * TOTAL SALES
   */
  const totalSales =
    Number(report?.total_sales) ||
    Number(report?.revenue_today) ||
    0;

  /**
   * TOTAL ORDERS
   */
  const totalOrders =
    Number(report?.total_orders) ||
    Number(report?.transactions_today) ||
    0;

  /**
   * CASH SALES
   */
  const cashSales =
    Number(report?.cash_sales) ||
    0;

  /**
   * MOBILE MONEY SALES
   */
  const mobileMoneySales =
    Number(report?.mobile_money_sales) ||
    0;

  /**
   * CARD SALES
   */
  const cardSales =
    Number(report?.card_sales) ||
    0;

  /**
   * TOTAL EXPENSES
   */
  const totalExpenses =
    expenses.reduce(
      (sum, exp) =>
        sum + Number(exp.amount || 0),
      0
    );

  /**
   * SALES OVERVIEW DATA
   */
  const salesData = [
    {
      name: 'Sales',
      value: totalSales
    },
    {
      name: 'Expenses',
      value: totalExpenses
    }
  ];

  /**
   * PAYMENT METHODS DATA
   */
  const paymentData = [
    {
      name: 'Cash',
      value: cashSales
    },
    {
      name: 'Mobile Money',
      value: mobileMoneySales
    },
    {
      name: 'Card',
      value: cardSales
    }
  ];

  /**
   * ESTIMATED PROFIT
   */
  const estimatedProfit =
    totalSales - totalExpenses;

  return (

    <div className="
      grid
      lg:grid-cols-2
      gap-6
      mt-8
    ">

      {/* SALES OVERVIEW */}

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

        <div className="h-80">

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart data={salesData}>

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="value" />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* PAYMENT METHODS */}

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

        <div className="h-80">

          <ResponsiveContainer
            width="100%"
            height={300}
          >

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
                    <Cell key={index} />
                  )
                )}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* PROFIT */}

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

          {estimatedProfit.toLocaleString()}
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
          {totalOrders}
        </h2>

      </div>

    </div>

  );

}