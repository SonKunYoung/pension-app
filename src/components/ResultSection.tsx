"use client";

import type { SimulatorResults, SimulatorInputs } from "@/lib/types";

interface Props {
  results: SimulatorResults;
  inputs: SimulatorInputs;
}

function fmt(n: number): string {
  return n.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
}

function DiffBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-slate-400">변화 없음</span>;
  const positive = value > 0;
  return (
    <span className={positive ? "text-emerald-400" : "text-rose-400"}>
      {positive ? "+" : ""}
      {fmt(value)}만원
    </span>
  );
}

export default function ResultSection({ results, inputs }: Props) {
  const { current, afterChange, monthlyDiff, total30Diff, irp, pensionStartAge } = results;
  const isDeferred = pensionStartAge > 65;
  const deferYears = pensionStartAge - 65;
  const bonusPct = (deferYears * 7.2).toFixed(0);
  const yearsToRetirement = Math.max(0, (isDeferred ? pensionStartAge : 65) - inputs.currentAge);
  const inflationFactor = Math.pow(1 + inputs.inflationRate / 100, yearsToRetirement);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">📊 시뮬레이션 결과</h2>

      {/* 이직 전/후 비교 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScenarioCard
          title="현재 회사 유지"
          color="blue"
          salary={inputs.currentSalary}
          years={current.subscriptionYears}
          avgIncome={current.avgMonthlyIncome}
          monthly65={current.monthlyPension}
          monthlyDeferred={current.monthlyPensionDeferred}
          total30={current.totalPension30}
          total30Deferred={current.totalPensionDeferred30}
          pensionStartAge={pensionStartAge}
          inflationFactor={inflationFactor}
          inflationRate={inputs.inflationRate}
        />
        <ScenarioCard
          title="이직 후"
          color="emerald"
          salary={inputs.newSalary}
          years={afterChange.subscriptionYears}
          avgIncome={afterChange.avgMonthlyIncome}
          monthly65={afterChange.monthlyPension}
          monthlyDeferred={afterChange.monthlyPensionDeferred}
          total30={afterChange.totalPension30}
          total30Deferred={afterChange.totalPensionDeferred30}
          pensionStartAge={pensionStartAge}
          inflationFactor={inflationFactor}
          inflationRate={inputs.inflationRate}
        />
      </div>

      {/* 소득대체율 시나리오 */}
      <PensionScenariosSection
        currentMonthly={current.monthlyPension}
        afterMonthly={afterChange.monthlyPension}
        currentAge={inputs.currentAge}
        inflationRate={inputs.inflationRate}
      />

      {/* 이직 차이 요약 */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-base font-semibold text-slate-300 mb-4">이직으로 인한 연금 변화 (65세 즉시 수령 기준)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">월 수령액 차이</p>
            <p className="text-2xl font-bold"><DiffBadge value={monthlyDiff} /></p>
            <p className="text-xs text-slate-600 mt-1">65세부터 매월</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">30년 누적 차이</p>
            <p className="text-2xl font-bold"><DiffBadge value={total30Diff} /></p>
            <p className="text-xs text-slate-600 mt-1">30년 합계</p>
          </div>
        </div>
      </div>

      {/* 연기 수령 비교 (pensionStartAge > 65일 때만) */}
      {isDeferred && (
        <DeferredCompareSection
          current={current}
          afterChange={afterChange}
          pensionStartAge={pensionStartAge}
          deferYears={deferYears}
          bonusPct={bonusPct}
        />
      )}

      {/* IRP */}
      <IRPSection irp={irp} />

      {/* 연금 최적화 제안 */}
      <PensionOptimizationCard inputs={inputs} />
    </div>
  );
}

function ScenarioCard({
  title,
  color,
  salary,
  years,
  avgIncome,
  monthly65,
  monthlyDeferred,
  total30,
  total30Deferred,
  pensionStartAge,
  inflationFactor,
  inflationRate,
}: {
  title: string;
  color: "blue" | "emerald";
  salary: number;
  years: number;
  avgIncome: number;
  monthly65: number;
  monthlyDeferred: number;
  total30: number;
  total30Deferred: number;
  pensionStartAge: number;
  inflationFactor: number;
  inflationRate: number;
}) {
  const isDeferred = pensionStartAge > 65;
  const borderColor = color === "blue" ? "border-blue-500/40" : "border-emerald-500/40";
  const badgeColor = color === "blue" ? "bg-blue-500/15 text-blue-300" : "bg-emerald-500/15 text-emerald-300";
  const monthlyColor = color === "blue" ? "text-blue-400" : "text-emerald-400";
  const displayMonthly = isDeferred ? monthlyDeferred : monthly65;
  const realMonthly = Math.round((displayMonthly / inflationFactor) * 10) / 10;

  return (
    <div className={`bg-slate-800/60 border ${borderColor} rounded-xl p-5`}>
      <div className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3 ${badgeColor}`}>
        {title}
      </div>
      <div className="space-y-2.5">
        <Row label="연봉" value={`${fmt(salary)}만원`} />
        <Row label="총 가입기간" value={`${years}년`} />
        <Row label="가중 평균 월 소득" value={`${fmt(avgIncome)}만원`} />
        <hr className="border-slate-700" />
        <div>
          <p className="text-xs text-slate-500 mb-1">65세 즉시 수령</p>
          <p className={`text-2xl font-bold ${monthlyColor}`}>{fmt(monthly65)}만원<span className="text-sm font-normal text-slate-500">/월</span></p>
          <p className="text-xs text-slate-600">30년 누적 {fmt(total30)}만원</p>
        </div>
        {isDeferred && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-xs text-amber-400 mb-1">{pensionStartAge}세 연기 수령</p>
            <p className="text-xl font-bold text-amber-300">{fmt(monthlyDeferred)}만원<span className="text-sm font-normal text-amber-500/70">/월</span></p>
            <p className="text-xs text-amber-500/70">30년 누적 {fmt(total30Deferred)}만원</p>
          </div>
        )}
        {inflationRate > 0 && (
          <div className="bg-slate-700/40 border border-slate-600/40 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-500 mb-0.5">실질 구매력 (오늘날 가치, 물가 {inflationRate}%)</p>
            <p className="text-sm font-semibold text-amber-300">≈ {fmt(realMonthly)}만원/월</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function DeferredCompareSection({
  current,
  afterChange,
  pensionStartAge,
  deferYears,
  bonusPct,
}: {
  current: SimulatorResults["current"];
  afterChange: SimulatorResults["afterChange"];
  pensionStartAge: number;
  deferYears: number;
  bonusPct: string;
}) {
  const currentGain = Math.round((current.monthlyPensionDeferred - current.monthlyPension) * 10) / 10;
  const afterGain = Math.round((afterChange.monthlyPensionDeferred - afterChange.monthlyPension) * 10) / 10;

  return (
    <div className="bg-slate-800/60 border border-amber-500/30 rounded-xl p-5">
      <h3 className="text-base font-semibold text-slate-300 mb-1">
        ⏳ 연기 수령 효과 ({pensionStartAge}세, {deferYears}년 연기 · +{bonusPct}%)
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        65세 즉시 수령 vs {pensionStartAge}세 연기 수령 월 수령액 비교
      </p>
      <div className="grid grid-cols-2 gap-4">
        <DeferredItem
          label="현재 회사 유지"
          immediate={current.monthlyPension}
          deferred={current.monthlyPensionDeferred}
          gain={currentGain}
        />
        <DeferredItem
          label="이직 후"
          immediate={afterChange.monthlyPension}
          deferred={afterChange.monthlyPensionDeferred}
          gain={afterGain}
        />
      </div>
      <p className="mt-3 text-xs text-slate-600">
        * 연기 수령은 월 수령액은 많지만 수령 시작이 늦어져 누적 수령액 손익분기는 개인차가 있습니다.
      </p>
    </div>
  );
}

function DeferredItem({
  label,
  immediate,
  deferred,
  gain,
}: {
  label: string;
  immediate: number;
  deferred: number;
  gain: number;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500">65세 수령</span>
          <span className="text-sm font-semibold text-blue-400">{fmt(immediate)}만원</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-amber-400/80">연기 수령</span>
          <span className="text-sm font-bold text-amber-300">{fmt(deferred)}만원</span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-700 pt-1.5">
          <span className="text-xs text-slate-600">가산액</span>
          <span className="text-sm font-bold text-emerald-400">+{fmt(gain)}만원/월</span>
        </div>
      </div>
    </div>
  );
}

function PensionOptimizationCard({ inputs }: { inputs: SimulatorInputs }) {
  const IRP_LIMIT_ANNUAL = 900; // 만원/년
  const additionalMonthly = Math.round((IRP_LIMIT_ANNUAL / 12) * 10) / 10; // 75만원

  const taxRate = inputs.currentSalary <= 5500 ? 0.165 : 0.132;
  const annualRefundIncrease = Math.round(IRP_LIMIT_ANNUAL * taxRate * 10) / 10;

  const yearsUntil65 = Math.max(0, 65 - inputs.currentAge);
  const annualReturn = 0.04;
  // FV of annuity: PMT × ((1+r)^n − 1) / r
  const irpBalanceAt65 =
    yearsUntil65 > 0
      ? IRP_LIMIT_ANNUAL * ((Math.pow(1 + annualReturn, yearsUntil65) - 1) / annualReturn)
      : IRP_LIMIT_ANNUAL;
  const monthlyAt65 = Math.round((irpBalanceAt65 / (20 * 12)) * 10) / 10;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-950/60 via-amber-950/40 to-slate-900/60 border border-orange-400/50 rounded-xl p-5 shadow-lg shadow-orange-900/20">
      {/* 배경 글로우 */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">💡</span>
        <h3 className="text-base font-bold text-orange-200">연금 최적화 제안</h3>
        <span className="ml-auto text-xs bg-orange-500/25 text-orange-300 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-medium">
          절세 여력 있음
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        현재 IRP 미가입 기준 · 연간 세액공제 한도 900만원 전액 활용 시
      </p>

      <div className="space-y-3">
        {/* 제안 1: 연말정산 환급 */}
        <div className="flex items-center gap-3 bg-slate-800/70 border border-orange-500/20 rounded-xl p-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-300 leading-snug">
              월{" "}
              <span className="text-orange-300 font-bold text-base">{fmt(additionalMonthly)}만원</span>{" "}
              더 납입하면
            </p>
            <p className="text-sm font-semibold text-white mt-0.5">
              연말정산 환급액{" "}
              <span className="text-orange-300 font-bold text-base">+{fmt(annualRefundIncrease)}만원</span>{" "}
              증가
            </p>
            <p className="text-xs text-slate-500 mt-1">
              세율 {(taxRate * 100).toFixed(1)}% 적용 · 연 900만원 납입 기준
            </p>
          </div>
          <a
            href="https://www.miraeasset.com/retirement/irp/index.do"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-3.5 py-2.5 bg-orange-500 hover:bg-orange-400 active:scale-95 transition-all text-white text-xs font-bold rounded-lg shadow-md shadow-orange-900/40 whitespace-nowrap"
          >
            IRP 가입하기
          </a>
        </div>

        {/* 제안 2: 65세 월 수령액 */}
        <div className="flex items-center gap-3 bg-slate-800/70 border border-amber-500/20 rounded-xl p-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-300 leading-snug">
              월{" "}
              <span className="text-amber-300 font-bold text-base">{fmt(additionalMonthly)}만원</span>{" "}
              더 납입하면
            </p>
            <p className="text-sm font-semibold text-white mt-0.5">
              65세 월 수령액{" "}
              <span className="text-amber-300 font-bold text-base">+{fmt(monthlyAt65)}만원</span>{" "}
              증가
            </p>
            <p className="text-xs text-slate-500 mt-1">
              연 4% 수익률 가정 · {yearsUntil65}년 적립 · 20년 분할 수령
            </p>
          </div>
          <a
            href="https://www.miraeasset.com/retirement/irp/index.do"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all text-white text-xs font-bold rounded-lg shadow-md shadow-amber-900/40 whitespace-nowrap"
          >
            IRP 가입하기
          </a>
        </div>
      </div>
    </div>
  );
}

function PensionScenariosSection({
  currentMonthly,
  afterMonthly,
  currentAge,
  inflationRate,
}: {
  currentMonthly: number;
  afterMonthly: number;
  currentAge: number;
  inflationRate: number;
}) {
  const yearsToRetirement = Math.max(0, 65 - currentAge);
  const inflationFactor = Math.pow(1 + inflationRate / 100, yearsToRetirement);

  const scenarios = [
    { label: "40%", sublabel: "현행 유지", rate: 1.0, color: "text-blue-400", badge: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
    { label: "35%", sublabel: "개혁안 A", rate: 35 / 40, color: "text-amber-400", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
    { label: "30%", sublabel: "개혁안 B", rate: 30 / 40, color: "text-rose-400", badge: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  ];

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
      <h3 className="text-base font-semibold text-slate-300 mb-1">📋 소득대체율 시나리오 비교</h3>
      <p className="text-xs text-slate-500 mb-4">
        국민연금 소득대체율 개편 시 예상 월 수령액 (65세 즉시 수령 기준)
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-xs text-slate-500 font-medium pb-2 pr-3">시나리오</th>
              <th className="text-right text-xs text-slate-500 font-medium pb-2 px-2">현재 회사 유지</th>
              <th className="text-right text-xs text-slate-500 font-medium pb-2 px-2">이직 후</th>
              {inflationRate > 0 && (
                <th className="text-right text-xs text-amber-500/70 font-medium pb-2 pl-2">이직 후 실질가치</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {scenarios.map((s) => {
              const cur = Math.round(currentMonthly * s.rate * 10) / 10;
              const after = Math.round(afterMonthly * s.rate * 10) / 10;
              const afterReal = Math.round((after / inflationFactor) * 10) / 10;
              return (
                <tr key={s.label}>
                  <td className="py-2.5 pr-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${s.badge}`}>
                      {s.label} <span className="font-normal opacity-70">{s.sublabel}</span>
                    </span>
                  </td>
                  <td className={`py-2.5 px-2 text-right font-semibold ${s.color}`}>{fmt(cur)}만원</td>
                  <td className={`py-2.5 px-2 text-right font-bold ${s.color}`}>{fmt(after)}만원</td>
                  {inflationRate > 0 && (
                    <td className="py-2.5 pl-2 text-right text-amber-300/80 text-xs font-medium">≈ {fmt(afterReal)}만원</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-600">
        * 소득대체율 40% = 40년 가입 시 평균 소득의 40% 수령 (1988년 70%→2028년 40% 단계 인하 완료 예정)
      </p>
    </div>
  );
}

function IRPSection({ irp }: { irp: SimulatorResults["irp"] }) {
  const { currentDeduction, newDeduction, diff } = irp;
  const diffColor = diff > 0 ? "text-emerald-400" : diff < 0 ? "text-rose-400" : "text-slate-400";

  return (
    <div className="bg-slate-800/60 border border-purple-500/30 rounded-xl p-5">
      <h3 className="text-base font-semibold text-slate-300 mb-1">🏦 IRP 세액공제 변화</h3>
      <p className="text-xs text-slate-500 mb-4">
        연간 IRP 납입 한도 900만원 기준 · 연봉 5,500만원 이하 16.5% / 초과 13.2%
      </p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-slate-500 mb-1">현재</p>
          <p className="text-lg font-bold text-blue-400">{fmt(currentDeduction)}만원</p>
          <p className="text-xs text-slate-600">연간 공제</p>
        </div>
        <div className="flex items-center justify-center text-2xl">→</div>
        <div>
          <p className="text-xs text-slate-500 mb-1">이직 후</p>
          <p className="text-lg font-bold text-emerald-400">{fmt(newDeduction)}만원</p>
          <p className="text-xs text-slate-600">연간 공제</p>
        </div>
      </div>
      {diff !== 0 && (
        <div className="mt-3 text-center text-sm">
          <span className="text-slate-400">이직 후 세액공제 </span>
          <span className={`font-bold ${diffColor}`}>{diff > 0 ? "+" : ""}{fmt(diff)}만원</span>
          <span className="text-slate-400"> 변화</span>
        </div>
      )}
    </div>
  );
}
