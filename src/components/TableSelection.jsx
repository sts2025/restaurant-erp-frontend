import {
  Coffee,
  ShoppingBag,
  Crown,
  Users
} from 'lucide-react';

export default function TableSelection({

  tables = [],

  onSelectTable

}) {

  return (

    <div className="h-full bg-slate-100 p-8 overflow-y-auto">

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-4xl font-black text-slate-800">

          Select Table

        </h1>

        <p className="text-slate-500 mt-2">

          Choose where the order belongs

        </p>

      </div>

      {/* GRID */}
      <div className="
        grid
        grid-cols-2
        md:grid-cols-4
        lg:grid-cols-5
        gap-6
      ">

        {/* TAKEAWAY */}
        <button

          onClick={() =>
            onSelectTable({
              id: null,
              name: 'Takeaway'
            })
          }

          className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            rounded-3xl
            p-8
            shadow-lg
            flex
            flex-col
            items-center
            justify-center
            transition-all
            hover:scale-105
            active:scale-95
            min-h-[220px]
          "
        >

          <ShoppingBag size={52} />

          <h2 className="mt-5 text-2xl font-black">

            Takeaway

          </h2>

          <p className="text-sm opacity-80 mt-2">

            Quick Order

          </p>

        </button>

        {/* TABLES */}
       {Array.isArray(tables) &&
  tables.map((table) => {

          /**
           * TABLE COLORS
           */
          const tableClasses =
            table.status === 'occupied'

              ? 'bg-red-500 text-white border-red-600 opacity-80'

              : table.status === 'held'

              ? 'bg-yellow-400 text-black border-yellow-500'

              : table.is_vip

              ? 'bg-purple-600 text-white border-purple-700'

              : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700';

          return (

            <button

              key={table.id}

              onClick={() => onSelectTable(table)}

              disabled={table.status === 'occupied'}

              className={`
                relative
                rounded-3xl
                p-6
                border-2
                shadow-lg
                flex
                flex-col
                justify-between
                text-left
                min-h-[220px]
                transition-all
                hover:scale-105
                active:scale-95

                ${tableClasses}
              `}
            >

              {/* VIP BADGE */}
              {table.is_vip && (

                <div className="absolute top-4 right-4">

                  <div className="
                    bg-yellow-300
                    text-black
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-black
                    flex
                    items-center
                    gap-1
                    shadow
                  ">

                    <Crown size={12} />

                    VIP

                  </div>

                </div>

              )}

              {/* ICON */}
              <div>

                <Coffee size={46} />

              </div>

              {/* INFO */}
              <div>

                <h2 className="text-2xl font-black">

                  {table.name}

                </h2>

                {/* CAPACITY */}
                <div className="
                  flex
                  items-center
                  gap-2
                  mt-3
                ">

                  <Users size={16} />

                  <span className="text-sm font-semibold">

                    Capacity:
                    {' '}
                    {table.capacity}

                  </span>

                </div>

                {/* STATUS */}
                <div className="mt-4">

                  <span className="
                    inline-block
                    bg-black/20
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-black
                    uppercase
                    tracking-wider
                  ">

                    {table.status || 'available'}

                  </span>

                </div>

              </div>

            </button>

          );

        })}

      </div>

    </div>

  );

}