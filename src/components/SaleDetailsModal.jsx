export default function SaleDetailsModal({

  sale,

  onClose

}) {

  if (!sale) return null;

  return (

    <div className="
      fixed
      inset-0
      bg-black/50
      flex
      items-center
      justify-center
      z-50
    ">

      <div className="
        bg-white
        rounded-3xl
        shadow-2xl
        w-full
        max-w-2xl
        p-8
        max-h-[90vh]
        overflow-y-auto
      ">

        {/* HEADER */}
        <div className="
          flex
          justify-between
          items-center
          mb-6
        ">

          <div>

            <h2 className="
              text-3xl
              font-black
            ">

              Receipt Details

            </h2>

            <p className="text-slate-500 mt-1">

              {sale.receipt_number}

            </p>

          </div>

          <button

            onClick={onClose}

            className="
              bg-red-500
              text-white
              px-4
              py-2
              rounded-xl
              font-bold
            "
          >

            Close

          </button>

        </div>

        {/* INFO */}
        <div className="
          grid
          grid-cols-2
          gap-4
          mb-8
        ">

          <div className="
            bg-slate-100
            p-4
            rounded-xl
          ">

            <p className="text-sm text-slate-500">
              Payment Method
            </p>

            <p className="font-bold text-lg">

              {sale.payment_method}

            </p>

          </div>

          <div className="
            bg-slate-100
            p-4
            rounded-xl
          ">

            <p className="text-sm text-slate-500">
              Table
            </p>

            <p className="font-bold text-lg">

              {sale.table?.name ||
                'Takeaway'}

            </p>

          </div>

          <div className="
            bg-slate-100
            p-4
            rounded-xl
          ">

            <p className="text-sm text-slate-500">
              Total
            </p>

            <p className="
              font-black
              text-2xl
              text-emerald-600
            ">

              {Number(
                sale.total
              ).toLocaleString()} UGX

            </p>

          </div>

          <div className="
            bg-slate-100
            p-4
            rounded-xl
          ">

            <p className="text-sm text-slate-500">
              Change
            </p>

            <p className="
              font-black
              text-2xl
              text-blue-600
            ">

              {Number(
                sale.change
              ).toLocaleString()} UGX

            </p>

          </div>

        </div>

        {/* ITEMS */}
        <div>

          <h3 className="
            text-xl
            font-black
            mb-4
          ">

            Items

          </h3>

          <div className="space-y-3">

            {sale.items?.map((item) => (

              <div

                key={item.id}

                className="
                  flex
                  justify-between
                  items-center
                  border
                  rounded-xl
                  p-4
                "
              >

                <div>

                  <p className="font-bold">

                    {item.product?.name}

                  </p>

                  <p className="
                    text-sm
                    text-slate-500
                  ">

                    Qty:
                    {' '}
                    {item.quantity}

                  </p>

                </div>

                <div className="
                  font-black
                  text-emerald-600
                ">

                  {Number(
                    item.total
                  ).toLocaleString()} UGX

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* FOOTER */}
        <div className="
          mt-8
          flex
          justify-end
        ">

          <button

            onClick={() =>
              window.print()
            }

            className="
              bg-emerald-600
              text-white
              px-6
              py-3
              rounded-xl
              font-bold
            "
          >

            Reprint Receipt

          </button>

        </div>

      </div>

    </div>

  );

}