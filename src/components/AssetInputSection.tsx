"use client";

import type { AssetInputs } from "@/lib/types";

interface Props {
  inputs: AssetInputs;
  onChange: (field: keyof AssetInputs, value: number) => void;
  currentAge: number;
}

// ── 공통 계산 ──────────────────────────────────────────────────────────────
export function calcMonthlyAt65(
  monthlyContrib: number,
  annualRatePct: number,
  yearsUntil65: number
): number {
  if (yearsUntil65 <= 0 || monthlyContrib <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = yearsUntil65 * 12;
  const fv =
    r > 0
      ? monthlyContrib * ((Math.pow(1 + r, n) - 1) / r)
      : monthlyContrib * n;
  const wn = 240; // 20년 수령
  const monthly =
    r > 0 ? (fv * r) / (1 - Math.pow(1 + r, -wn)) : fv / wn;
  return Math.round(monthly * 10) / 10;
}

function fmt(n: number) {
  return n.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
}

// ── 슬라이더 행 ───────────────────────────────────────────────────────────
function SliderRow({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
  accentClass,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  accentClass: string;
}) {
  const safe = Math.min(max, Math.max(min, value));
  const isRate = unit === "%";

  function snap(raw: number) {
    return Math.min(max, Math.max(min, Math.round((raw - min) / step) * step + min));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs text-slate-400">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={safe}
            onChange={(e) => {
              const raw = Number(e.target.value);
              if (!isNaN(raw)) onChange(snap(raw));
            }}
            className="w-16 bg-slate-700/80 border border-slate-600 rounded-md px-2 py-0.5 text-right text-xs text-white focus:outline-none focus:border-slate-500"
          />
          <span className="text-slate-500 text-xs">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safe}
        onChange={(e) => onChange(snap(Number(e.target.value)))}
        className={`w-full h-1.5 cursor-pointer ${accentClass}`}
      />
      <div className="flex justify-between text-xs text-slate-700 mt-0.5">
        <span>{isRate ? `${min}%` : `${min}만원`}</span>
        <span>{isRate ? `${max}%` : `${max}만원`}</span>
      </div>
    </div>
  );
}

// ── 자산 카드 ──────────────────────────────────────────────────────────────
function AssetCard({
  icon,
  title,
  color,
  accentSlider,
  monthlyField,
  rateField,
  monthlyValue,
  rateValue,
  onChange,
  monthlyAt65,
}: {
  icon: string;
  title: string;
  color: { border: string; badge: string; value: string; bg: string };
  accentSlider: string;
  monthlyField: keyof AssetInputs;
  rateField: keyof AssetInputs;
  monthlyValue: number;
  rateValue: number;
  onChange: (field: keyof AssetInputs, value: number) => void;
  monthlyAt65: number;
}) {
  return (
    <div className={`bg-slate-800/60 border ${color.border} rounded-xl p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className={`text-sm font-semibold ${color.badge}`}>{title}</span>
        </div>
        <div className={`text-right ${color.bg} rounded-lg px-2 py-1`}>
          <p className="text-xs text-slate-500 leading-none mb-0.5">65세 월 수령</p>
          <p className={`text-sm font-bold ${color.value}`}>
            {monthlyAt65 > 0 ? `${fmt(monthlyAt65)}만원` : "—"}
          </p>
        </div>
      </div>
      <SliderRow
        label="월 납입액"
        unit="만원"
        min={0}
        max={200}
        step={1}
        value={monthlyValue}
        onChange={(v) => onChange(monthlyField, v)}
        accentClass={accentSlider}
      />
      <SliderRow
        label="연수익률"
        unit="%"
        min={1}
        max={15}
        step={0.5}
        value={rateValue}
        onChange={(v) => onChange(rateField, v)}
        accentClass={accentSlider}
      />
    </div>
  );
}

// ── 메인 ──────────────────────────────────────────────────────────────────
export default function AssetInputSection({ inputs, onChange, currentAge }: Props) {
  const yearsUntil65 = Math.max(0, 65 - currentAge);

  const irpAt65 = calcMonthlyAt65(inputs.irpMonthly, inputs.irpRate, yearsUntil65);
  const savingsAt65 = calcMonthlyAt65(inputs.savingsMonthly, inputs.savingsRate, yearsUntil65);
  const etfAt65 = calcMonthlyAt65(inputs.etfMonthly, inputs.etfRate, yearsUntil65);

  return (
    <section>
      <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
        노후자산 설정
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AssetCard
          icon="🏦"
          title="IRP"
          color={{
            border: "border-violet-500/30",
            badge: "text-violet-300",
            value: "text-violet-300",
            bg: "bg-violet-500/10",
          }}
          accentSlider="accent-violet-500"
          monthlyField="irpMonthly"
          rateField="irpRate"
          monthlyValue={inputs.irpMonthly}
          rateValue={inputs.irpRate}
          onChange={onChange}
          monthlyAt65={irpAt65}
        />
        <AssetCard
          icon="💼"
          title="연금저축"
          color={{
            border: "border-emerald-500/30",
            badge: "text-emerald-300",
            value: "text-emerald-300",
            bg: "bg-emerald-500/10",
          }}
          accentSlider="accent-emerald-500"
          monthlyField="savingsMonthly"
          rateField="savingsRate"
          monthlyValue={inputs.savingsMonthly}
          rateValue={inputs.savingsRate}
          onChange={onChange}
          monthlyAt65={savingsAt65}
        />
        <AssetCard
          icon="📈"
          title="ETF"
          color={{
            border: "border-amber-500/30",
            badge: "text-amber-300",
            value: "text-amber-300",
            bg: "bg-amber-500/10",
          }}
          accentSlider="accent-amber-500"
          monthlyField="etfMonthly"
          rateField="etfRate"
          monthlyValue={inputs.etfMonthly}
          rateValue={inputs.etfRate}
          onChange={onChange}
          monthlyAt65={etfAt65}
        />
      </div>
      <p className="mt-2 text-xs text-slate-600 text-right">
        * 65세부터 20년간 월 수령 기준 · 월복리 계산
      </p>
    </section>
  );
}
