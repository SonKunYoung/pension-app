"use client";

import type { SimulatorInputs, JobRole } from "@/lib/types";
import SalarySearch from "./SalarySearch";

interface Props {
  inputs: SimulatorInputs;
  onChange: (field: keyof SimulatorInputs, value: number | string) => void;
}

const SALARY_MIN = 2400;
const SALARY_MAX = 50000;
const SALARY_STEP = 100;

export default function InputSection({ inputs, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* 개인 정보 */}
      <section>
        <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
          개인 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SliderCard
            label="현재 나이"
            unit="세"
            min={18}
            max={64}
            step={1}
            value={inputs.currentAge}
            onChange={(v) => onChange("currentAge", v)}
          />
          <SliderCard
            label="국민연금 가입기간"
            unit="년"
            min={0}
            max={40}
            step={1}
            value={inputs.subscriptionYears}
            onChange={(v) => onChange("subscriptionYears", v)}
          />
        </div>

        {/* 직무 선택 */}
        <div className="mt-4 bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-3">
            직무를 선택하면 같은 나이대·직무 동료와 연금을 비교할 수 있습니다
          </p>
          <div className="flex flex-wrap gap-2">
            {(["개발", "마케팅", "영업", "재무", "인사", "디자인", "생산"] as JobRole[]).map((role) => {
              const active = inputs.job === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => onChange("job", role)}
                  className={`px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                    active
                      ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/30"
                      : "bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 연금 수령 시작 나이 */}
      <section>
        <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
          연금 수령 시작 나이
        </h2>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-3">
            연기 수령 시 1년당 7.2% 가산 · 최대 5년 연기(70세) = +36%
          </p>
          <div className="flex flex-wrap gap-2">
            {[65, 66, 67, 68, 69, 70].map((age) => {
              const bonus = (age - 65) * 7.2;
              const active = inputs.pensionStartAge === age;
              return (
                <button
                  key={age}
                  type="button"
                  onClick={() => onChange("pensionStartAge", age)}
                  className={`flex flex-col items-center px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    active
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30"
                      : "bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                  }`}
                >
                  <span className="font-bold">{age}세</span>
                  {bonus > 0 && (
                    <span className={`text-xs mt-0.5 ${active ? "text-blue-200" : "text-emerald-500"}`}>
                      +{bonus.toFixed(0)}%
                    </span>
                  )}
                  {bonus === 0 && (
                    <span className={`text-xs mt-0.5 ${active ? "text-blue-200" : "text-slate-600"}`}>
                      기본
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 연봉 비교 */}
      <section>
        <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
          연봉 비교
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 현재 연봉 */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-3">
            <SalarySearch
              label="현재 회사"
              onSelect={(v) => onChange("currentSalary", v)}
            />
            <SliderCard
              label="현재 연봉"
              unit="만원"
              min={SALARY_MIN}
              max={SALARY_MAX}
              step={SALARY_STEP}
              value={inputs.currentSalary}
              onChange={(v) => onChange("currentSalary", v)}
              compact
            />
            <div className="border-t border-slate-700/60 pt-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">협상 목표 연봉</span>
                {inputs.targetSalary > inputs.currentSalary && (
                  <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded-full">
                    +{(inputs.targetSalary - inputs.currentSalary).toLocaleString()}만원
                  </span>
                )}
              </div>
              <SliderCard
                label="목표 연봉"
                unit="만원"
                min={SALARY_MIN}
                max={SALARY_MAX}
                step={SALARY_STEP}
                value={inputs.targetSalary}
                onChange={(v) => onChange("targetSalary", v)}
                compact
                accent="green"
              />
            </div>
          </div>

          {/* 이직 후 연봉 */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-3">
            <SalarySearch
              label="이직 희망 회사"
              onSelect={(v) => onChange("newSalary", v)}
            />
            <SliderCard
              label="이직 후 연봉"
              unit="만원"
              min={SALARY_MIN}
              max={SALARY_MAX}
              step={SALARY_STEP}
              value={inputs.newSalary}
              onChange={(v) => onChange("newSalary", v)}
              compact
            />
          </div>
        </div>

        {/* 이직 후 재직 기간 */}
        <div className="mt-4">
          <SliderCard
            label="이직 후 재직 예상 기간"
            unit="년"
            min={1}
            max={Math.max(1, 65 - inputs.currentAge)}
            step={1}
            value={Math.min(inputs.additionalYears, Math.max(1, 65 - inputs.currentAge))}
            onChange={(v) => onChange("additionalYears", v)}
            hint={`최대 ${Math.max(1, 65 - inputs.currentAge)}년 (65세까지)`}
          />
        </div>
      </section>

      {/* 시나리오 설정 */}
      <section>
        <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
          시나리오 설정
        </h2>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-4">
          <p className="text-xs text-slate-500">
            물가 상승률은 연금 수령 시점의 실질 구매력 계산에 사용됩니다
          </p>
          <InflationSlider
            value={inputs.inflationRate}
            onChange={(v) => onChange("inflationRate", v)}
          />
        </div>
      </section>
    </div>
  );
}

function InflationSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const presets = [0, 1, 2, 3, 4, 5];
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-slate-400">물가 상승률 (연평균)</label>
        <span className="text-sm font-bold text-amber-300">{value.toFixed(1)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={5}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 cursor-pointer accent-amber-400"
      />
      <div className="flex justify-between mt-2 gap-1">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`flex-1 py-1 rounded text-xs font-medium transition-all ${
              value === p
                ? "bg-amber-500/30 border border-amber-500/50 text-amber-300"
                : "bg-slate-700/50 border border-slate-600/50 text-slate-500 hover:text-slate-400"
            }`}
          >
            {p}%
          </button>
        ))}
      </div>
    </div>
  );
}

interface SliderCardProps {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  compact?: boolean;
  accent?: "blue" | "green";
}

function SliderCard({ label, unit, min, max, step, value, onChange, hint, compact, accent = "blue" }: SliderCardProps) {
  // 슬라이더 값이 범위를 벗어나지 않도록 clamp
  const safeValue = Math.min(max, Math.max(min, value));

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    // step 단위로 정확히 스냅
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

  const isSalary = unit === "만원";

  return (
    <div className={compact ? "" : "bg-slate-800/60 border border-slate-700/50 rounded-xl p-4"}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-slate-400">
          {label}
          {hint && <span className="ml-1 text-xs text-slate-600">({hint})</span>}
        </label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={safeValue}
            onChange={handleNumber}
            className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-right text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-400 text-sm">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeValue}
        onChange={handleSlider}
        className={`w-full h-1.5 cursor-pointer ${accent === "green" ? "accent-green-500" : "accent-blue-500"}`}
      />
      <div className="flex justify-between text-xs text-slate-600 mt-1">
        <span>{isSalary ? `${min.toLocaleString()}만원` : `${min}${unit}`}</span>
        <span className="font-medium text-slate-400">
          {isSalary ? `${safeValue.toLocaleString()}만원` : `${safeValue}${unit}`}
        </span>
        <span>{isSalary ? `${max.toLocaleString()}만원` : `${max}${unit}`}</span>
      </div>
    </div>
  );
}
