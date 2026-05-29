import { useEffect, useState } from 'react';
import axios from 'axios';
import Receipt from './Receipt';

export default function SalesHistory()
{
  /**
   * STATE
   */
  const [sales, setSales] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [selectedReceipt,
    setSelectedReceipt] =
    useState(null);

  /**
   * FETCH SALES
   */
  const fetchSales = async () =>
  {
    try {

      setLoading(true);

      const res = await axios.get(
        '/sales',
        {
          params: {
            search
          }
        }
      );

      /**
       * SAFE ARRAY EXTRACTION
       */
      const salesData =
        res?.data?.data?.data;

      setSales(

        Array.isArray(salesData)
          ? salesData
          : []

      );

    } catch (err) {

      console.error(err);

      alert('Failed to load sales');

      setSales([]);

    } finally {

      setLoading(false);

    }
  };

  /**
   * VIEW RECEIPT
   */
  const viewReceipt = (sale) =>
  {
    setSelectedReceipt(sale);
  };

  /**
   * REPRINT RECEIPT
   */
  const reprintReceipt = (sale) =>
  {
    setSelectedReceipt(sale);

    setTimeout(() => {

      document.body.className =
        'print-receipt';

      window.print();

      setTimeout(() => {

        document.body.className =
          '';

      }, 500);

    }, 300);
  };

  /**
   * INITIAL LOAD
   */
  useEffect(() => {

    fetchSales();

  }, []);

  return (

    <div className="
      p-6
      space-y-6
    ">

      {/* HEADER */}
      <div>

        <h1 className="
          text-3xl
          font-black
        ">

          Sales History

        </h1>

        <p className="
          text-slate-500
        ">

          View completed sales

        </p>

      </div>

      {/* SEARCH */}
      <div className="
        flex
        gap-4
      ">

        <input

          type="text"

          placeholder="
            Search receipt...
          "

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

          className="
            flex-1
            border
            rounded-2xl
            p-4
          "
        />

        <button

          onClick={fetchSales}

          className="
            bg-emerald-600
            text-white
            px-6
            rounded-2xl
            font-bold
          "
        >

          Search

        </button>

      </div>

      {/* LOADING */}
      {loading && (

        <div className="
          bg-white
          p-10
          rounded-3xl
          text-center
        ">

          Loading sales...

        </div>

      )}

      {/* SALES TABLE */}
      {!loading && (

        <div className="
          bg-white
          rounded-3xl
          shadow-sm
          overflow-hidden
        ">

          <table className="w-full">

            <thead className="
              bg-slate-100
            ">

              <tr>

                <th className="p-4 text-left">
                  Receipt
                </th>

                <th className="p-4 text-left">
                  Cashier
                </th>

                <th className="p-4 text-left">
                  Table
                </th>

                <th className="p-4 text-left">
                  Payment
                </th>

                <th className="p-4 text-left">
                  Total
                </th>

                <th className="p-4 text-left">
                  Date
                </th>

                <th className="p-4 text-left">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {sales.length === 0 && (

                <tr>

                  <td
                    colSpan="7"
                    className="
                      p-8
                      text-center
                      text-slate-400
                    "
                  >

                    No sales found

                  </td>

                </tr>

              )}

              {sales.map((sale) => (

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

                    {sale.user?.name ||
                      'Unknown'}

                  </td>

                  <td className="p-4">

                    {sale.table?.name ||
                      'Takeaway'}

                  </td>

                  <td className="
                    p-4
                    capitalize
                  ">

                    {sale.payment_method}

                  </td>

                  <td className="
                    p-4
                    font-bold
                  ">

                    {Number(
                      sale.total || 0
                    ).toLocaleString()}
                    {' '}
                    UGX

                  </td>

                  <td className="p-4">

                    {new Date(
                      sale.created_at
                    ).toLocaleString()}

                  </td>

                  <td className="p-4">

                    <div className="
                      flex
                      gap-2
                    ">

                      {/* VIEW */}
                      <button

                        onClick={() =>
                          viewReceipt(sale)
                        }

                        className="
                          bg-blue-600
                          text-white
                          px-3
                          py-2
                          rounded-lg
                          text-sm
                          font-bold
                        "
                      >

                        View

                      </button>

                      {/* REPRINT */}
                      <button

                        onClick={() =>
                          reprintReceipt(sale)
                        }

                        className="
                          bg-emerald-600
                          text-white
                          px-3
                          py-2
                          rounded-lg
                          text-sm
                          font-bold
                        "
                      >

                        Reprint

                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

      {/* RECEIPT MODAL */}
      {selectedReceipt && (

        <Receipt
          receipt={selectedReceipt}
          onClose={() =>
            setSelectedReceipt(null)
          }
        />

      )}

    </div>

  );
}