import { useState } from 'react';
import { Coffee, User } from 'lucide-react';

export default function TableManagement({ tables, onSelectTable }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Select Table</h2>
      <div className="grid grid-cols-4 gap-4">
        {tables.map(table => (
          <button 
            key={table.id}
            onClick={() => onSelectTable(table)}
            className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
              table.isOccupied ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 hover:border-emerald-400'
            }`}
          >
            <Coffee size={32} />
            <span className="font-bold text-lg">{table.name}</span>
            <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">{table.capacity} Seats</span>
          </button>
        ))}
      </div>
    </div>
  );
}