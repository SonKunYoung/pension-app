"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { SimulatorResults } from "@/lib/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  results: SimulatorResults;
}

export default function PensionChart({ results }: Props) {
  const { chartData, pensionStartAge } = results;
  const isDeferred = pensionStartAge > 65;
  const labels = chartData.map((d) => `${d.year}년차`);

  const datasets = [
    {
      label: "현재 유지 (65세)",
      data: chartData.map((d) => d.current),
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "rgba(59, 130, 246, 0.06)",
      pointRadius: 2,
      pointHoverRadius: 5,
      fill: true,
      tension: 0.4,
    },
    {
      label: "이직 후 (65세)",
      data: chartData.map((d) => d.afterChange),
      borderColor: "rgb(16, 185, 129)",
      backgroundColor: "rgba(16, 185, 129, 0.06)",
      pointRadius: 2,
      pointHoverRadius: 5,
      fill: true,
      tension: 0.4,
    },
    ...(isDeferred
      ? [
          {
            label: `현재 유지 (${pensionStartAge}세 연기)`,
            data: chartData.map((d) => d.currentDeferred),
            borderColor: "rgb(251, 191, 36)",
            backgroundColor: "rgba(251, 191, 36, 0.04)",
            borderDash: [5, 4],
            pointRadius: 2,
            pointHoverRadius: 5,
            fill: false,
            tension: 0.4,
          },
          {
            label: `이직 후 (${pensionStartAge}세 연기)`,
            data: chartData.map((d) => d.afterChangeDeferred),
            borderColor: "rgb(251, 146, 60)",
            backgroundColor: "rgba(251, 146, 60, 0.04)",
            borderDash: [5, 4],
            pointRadius: 2,
            pointHoverRadius: 5,
            fill: false,
            tension: 0.4,
          },
        ]
      : []),
  ];

  const data = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#94a3b8",
          font: { size: 11 },
          boxWidth: 12,
          padding: 12,
        },
      },
      title: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        borderColor: "rgba(99, 102, 241, 0.3)",
        borderWidth: 1,
        titleColor: "#e2e8f0",
        bodyColor: "#94a3b8",
        padding: 10,
        callbacks: {
          label: (ctx: TooltipItem<"line">) =>
            ` ${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}만원`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#64748b", font: { size: 11 }, maxTicksLimit: 10 },
        grid: { color: "rgba(255,255,255,0.04)" },
      },
      y: {
        ticks: {
          color: "#64748b",
          font: { size: 11 },
          callback: (value: string | number) =>
            `${Number(value).toLocaleString()}만원`,
        },
        grid: { color: "rgba(255,255,255,0.04)" },
        title: {
          display: true,
          text: "누적 수령액 (만원)",
          color: "#475569",
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
      <h3 className="text-base font-semibold text-slate-300 mb-1">
        📈 수령 시작 후 30년 누적 수령액
      </h3>
      {isDeferred && (
        <p className="text-xs text-slate-500 mb-3">
          실선: 65세 즉시 수령 · 점선: {pensionStartAge}세 연기 수령 (수령 시작 시점부터 누적)
        </p>
      )}
      <Line data={data} options={options} />
    </div>
  );
}
