import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function RiskSummaryCards({ items = [] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="atlas-glass rounded-xl p-4"
        >
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">{item.label}</div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</span>
            <div className="flex items-center gap-1">
              {item.trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-red-400" />
              ) : item.trend === "down" ? (
                <TrendingDown className="w-3 h-3 text-emerald-400" />
              ) : (
                <Minus className="w-3 h-3 text-slate-500" />
              )}
              <span
                className={`text-xs font-medium ${
                  item.trend === "up" ? "text-red-400" : item.trend === "down" ? "text-emerald-400" : "text-slate-500"
                }`}
              >
                {item.change}
              </span>
            </div>
          </div>
          <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.value}%` }}
              transition={{ duration: 1, delay: i * 0.15 }}
              className="h-full rounded-full"
              style={{ backgroundColor: item.color }}
            />
          </div>
        </motion.div>
      ))}

      {items.length === 0 && (
        <div className="col-span-2 lg:col-span-4 text-sm text-slate-500">Loading risk summary...</div>
      )}
    </div>
  );
}
