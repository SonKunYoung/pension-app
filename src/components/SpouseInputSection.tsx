"use client";

import type { SpouseInputs } from "@/lib/types";

interface Props {
  inputs: SpouseInputs;
  onChange: (field: keyof SpouseInputs, value: number) => void;
}

interface SliderRowProps {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}

function SliderRow({ label, unit, min, max, step, value, onChange }: SliderRowProps) {
  const safe = Math.min(max, Math.max(min, value));
  const isSalary = unit === "만원";

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = Number(e.target.value);
    const snapped = Math.round((raw - min) / step) * step + min;
    onChange(Math.min(max, Math.max(min, snapped)));
  }
  function handleNumber(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = Number(e.target.value);
    if (!isNaN(raw)) {
      const snapped = Math.round((raw - min) / step) * step + min;
      onChange(Math.min(max, Math.max(min, snapped)));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm text-slate-400">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={safe}
            onChange={handleNumber}
            className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-right text-sm text-white focus:outline-none focus:border-pink-500"
          />
          <span className="text-slate-400 text-sm">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safe}
        onChange={handleSlider}
        className="w-full h-1.5 cursor-pointer accent-pink-500"
      />
      <div className="flex justify-between text-xs text-slate-600 mt-1">
        <span>{isSalary ? `${min.toLocaleString()}만원` : `${min}${unit}`}</span>
        <span className="font-medium text-slate-400">
          {isSalary ? `${safe.toLocaleString()}만원` : `${safe}${unit}`}
        </span>
        <span>{isSalary ? `${max.toLocaleString()}만원` : `${max}${unit}`}</span>
      </div>
    </div>
  );
}

export default function SpouseInputSection({ inputs, onChange }: Props) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-pink-400 uppercase tracking-wider mb-3">
        배우자 정보
      </h2>
      <div className="bg-slate-800/60 border border-pink-500/30 rounded-xl p-5 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">👫</span>
          <p className="text-sm text-slate-400">
            배우자의 국민연금 예상 수령액을 합산합니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <SliderRow
            label="배우자 나이"
            unit="세"
            min={18}
            max={64}
            step={1}
            value={inputs.age}
            onChange={(v) => onChange("age", v)}
          />
          <SliderRow
            label="국민연금 가입기간"
            unit="년"
            min={0}
            max={40}
            step={1}
            value={inputs.subscriptionYears}
            onChange={(v) => onChange("subscriptionYears", v)}
          />
          <SliderRow
            label="배우자 연봉"
            unit="만원"
            min={2400}
            max={50000}
            step={100}
            value={inputs.salary}
            onChange={(v) => onChange("salary", v)}
          />
        </div>
      </div>
    </section>
  );
}
