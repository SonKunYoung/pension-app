"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend, type TooltipItem } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { AssetInputs } from "@/lib/types";
import { calcMonthlyAt65 } from "./AssetInputSection";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  nationalPension: number;  // 국민연금 이직 후 65세 월 수령액 (만원)
  currentAge: number;
  assetInputs: AssetInputs;
}

function fmt(n: number) {
  return n.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
}

const ITEMS = [
  {
    key: "national",
    label: "국민연금",
    icon: "🏛️",
    color: "#3b82f6",
    bgClass: "bg-blue-500/15",
    borderClass: "border-blue-500/30",
    textClass: "text-blue-300",
  },
  {
    key: "irp",
    label: "IRP",
    icon: "🏦",
    color: "#8b5cf6",
    bgClass: "bg-violet-500/15",
    borderClass: "border-violet-500/30",
    textClass: "text-violet-300",
  },
  {
    key: "savings",
    label: "연금저축",
    icon: "💼",
    color: "#10b981",
    bgClass: "bg-emerald-500/15",
    borderClass: "border-emerald-500/30",
    textClass: "text-emerald-300",
  },
  {
    key: "etf",
    label: "ETF",
    icon: "📈",
    color: "#f59e0b",
    bgClass: "bg-amber-500/15",
    borderClass: "border-amber-500/30",
    textClass: "text-amber-300",
  },
] as const;

export default function RetirementAssetSection({
  nationalPension,
  currentAge,
  assetInputs,
}: Props) {
  const yearsUntil65 = Math.max(0, 65 - currentAge);

  const irp = calcMonthlyAt65(assetInputs.irpMonthly, assetInputs.irpRate, yearsUntil65);
  const savings = calcMonthlyAt65(assetInputs.savingsMonthly, assetInputs.savingsRate, yearsUntil65);
  const etf = calcMonthlyAt65(assetInputs.etfMonthly, assetInputs.etfRate, yearsUntil65);

  const values = {
    national: nationalPension,
    irp,
    savings,
    etf,
  };

  const total = Math.round((nationalPension + irp + savings + etf) * 10) / 10;

  // 파이차트 데이터 — 값 0인 항목 제외
  const nonZeroItems = ITEMS.filter((item) => values[item.key] > 0);
  const chartData = {
    labels: nonZeroItems.map((i) => i.label),
    datasets: [
      {
        data: nonZeroItems.map((i) => values[i.key]),
        backgroundColor: nonZeroItems.map((i) => i.color + "cc"), // 80% opacity
        borderColor: nonZeroItems.map((i) => i.color),
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "65%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "rgba(99, 102, 241, 0.3)",
        borderWidth: 1,
        titleColor: "#e2e8f0",
        bodyColor: "#94a3b8",
        padding: 10,
        callbacks: {
          label: (ctx: TooltipItem<"doughnut">) => {
            const val = ctx.parsed as number;
            const pct = total > 0 ? Math.round((val / total) * 100) : 0;
            return ` ${fmt(val)}만원/월 (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">💰 65세 예상 월 총소득</h2>

      {/* 히어로 카드 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-950/70 via-violet-950/40 to-slate-900/70 border border-blue-400/30 rounded-xl p-6 text-center shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
        <p className="text-sm text-slate-400 mb-1">국민연금 + IRP + 연금저축 + ETF 합산</p>
        <p className="text-5xl font-extrabold text-white tracking-tight">
          {fmt(total)}
          <span className="text-2xl font-semibold text-slate-400 ml-1">만원/월</span>
        </p>
        {yearsUntil65 > 0 && (
          <p className="text-xs text-slate-500 mt-2">{yearsUntil65}년 후 65세 기준 · 20년 수령 가정</p>
        )}
      </div>

      {/* 항목별 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ITEMS.map((item) => {
          const val = values[item.key];
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <div
              key={item.key}
              className={`bg-slate-800/60 border ${item.borderClass} rounded-xl p-3.5 text-center`}
            >
              <div className="text-xl mb-1">{item.icon}</div>
              <p className="text-xs text-slate-500 mb-1">{item.label}</p>
              <p className={`text-lg font-bold ${item.textClass}`}>
                {fmt(val)}
                <span className="text-xs font-normal text-slate-500">만원</span>
              </p>
              <div className="mt-2">
                <div className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${item.bgClass} ${item.textClass}`}>
                  {pct}%
                </div>
              </div>
              {/* 미니 기여 바 */}
              <div className="mt-2 w-full bg-slate-700/50 rounded-full h-1">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 파이차트 + 범례 */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">항목별 기여 비율</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* 도넛 차트 */}
          <div className="relative w-48 h-48 flex-shrink-0">
            {total > 0 ? (
              <>
                <Doughnut data={chartData} options={chartOptions} />
                {/* 중앙 레이블 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-xs text-slate-500">월 총소득</p>
                  <p className="text-lg font-bold text-white">{fmt(total)}</p>
                  <p className="text-xs text-slate-500">만원</p>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">
                납입액을 입력하면<br />차트가 표시됩니다
              </div>
            )}
          </div>

          {/* 범례 */}
          <div className="flex-1 w-full space-y-2.5">
            {ITEMS.map((item) => {
              const val = values[item.key];
              const pct = total > 0 ? Math.round((val / total) * 100) : 0;
              const barPct = Math.min(100, pct);
              return (
                <div key={item.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-slate-400">
                        {item.icon} {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${item.textClass}`}>
                        {fmt(val)}만원
                      </span>
                      <span className="text-xs text-slate-600 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700/40 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${barPct}%`, backgroundColor: item.color + "bb" }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="border-t border-slate-700 pt-2.5 flex justify-between items-center">
              <span className="text-sm text-slate-400 font-semibold">합계</span>
              <span className="text-base font-bold text-white">{fmt(total)}만원/월</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
