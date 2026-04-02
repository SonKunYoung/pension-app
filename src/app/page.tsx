"use client";

import { useState, useCallback } from "react";
import InputSection from "@/components/InputSection";
import ResultSection from "@/components/ResultSection";
import PensionChart from "@/components/PensionChart";
import ShareButton from "@/components/ShareButton";
import NegotiationSection from "@/components/NegotiationSection";
import PeerRankSection from "@/components/PeerRankSection";
import SpouseInputSection from "@/components/SpouseInputSection";
import CoupleResultSection from "@/components/CoupleResultSection";
import AssetInputSection from "@/components/AssetInputSection";
import RetirementAssetSection from "@/components/RetirementAssetSection";
import { calculatePension } from "@/lib/calculator";
import { gtagEvent } from "@/lib/gtag";
import { calcPeerRank } from "@/lib/peer-data";
import type { SimulatorInputs, SimulatorResults, SpouseInputs, AssetInputs } from "@/lib/types";

const DEFAULT_INPUTS: SimulatorInputs = {
  currentAge: 35,
  subscriptionYears: 10,
  currentSalary: 4000,
  newSalary: 5000,
  additionalYears: 5,
  pensionStartAge: 65,
  targetSalary: 4500,
  job: "개발",
};

const DEFAULT_SPOUSE: SpouseInputs = {
  age: 33,
  subscriptionYears: 8,
  salary: 3500,
};

const DEFAULT_ASSETS: AssetInputs = {
  irpMonthly: 30,
  irpRate: 4,
  savingsMonthly: 30,
  savingsRate: 4,
  etfMonthly: 30,
  etfRate: 7,
};

export default function Home() {
  const [inputs, setInputs] = useState<SimulatorInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<SimulatorResults | null>(null);
  const [coupleMode, setCoupleMode] = useState(false);
  const [spouseInputs, setSpouseInputs] = useState<SpouseInputs>(DEFAULT_SPOUSE);
  const [livingExpense, setLivingExpense] = useState(400);
  const [assetInputs, setAssetInputs] = useState<AssetInputs>(DEFAULT_ASSETS);

  const handleCalculate = useCallback(() => {
    const res = calculatePension(inputs);
    setResults(res);
    gtagEvent("calculate_pension", {
      current_age: inputs.currentAge,
      subscription_years: inputs.subscriptionYears,
      job: inputs.job,
      couple_mode: coupleMode,
    });
  }, [inputs, coupleMode]);

  const handleChange = useCallback(
    (field: keyof SimulatorInputs, value: number | string) => {
      setInputs((prev) => ({ ...prev, [field]: value }));
      setResults(null);
    },
    []
  );

  const handleSpouseChange = useCallback(
    (field: keyof SpouseInputs, value: number) => {
      setSpouseInputs((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleAssetChange = useCallback(
    (field: keyof AssetInputs, value: number) => {
      setAssetInputs((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleToggleCouple = useCallback(() => {
    setCoupleMode((prev) => !prev);
  }, []);

  const peerRank = results
    ? calcPeerRank(inputs.currentAge, inputs.job, results.afterChange.monthlyPension)
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-300 text-sm mb-4">
            <span>💼</span>
            <span>연금 이직 시뮬레이터</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            이직하면 연금이 얼마나 달라질까?
          </h1>
          <p className="text-slate-400 text-base md:text-lg">
            국민연금 · IRP 세액공제 · 30년 누적 수령액을 한눈에 비교하세요
          </p>

          {/* 개인/부부 합산 토글 */}
          <div className="mt-6 inline-flex items-center bg-slate-800/70 border border-slate-700/50 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setCoupleMode(false)}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                !coupleMode
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/50"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <span>👤</span>
              <span>개인</span>
            </button>
            <button
              type="button"
              onClick={() => setCoupleMode(true)}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                coupleMode
                  ? "bg-pink-600 text-white shadow-md shadow-pink-900/50"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <span>👫</span>
              <span>부부 합산</span>
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-6">
          <InputSection inputs={inputs} onChange={handleChange} />
          {coupleMode && (
            <SpouseInputSection inputs={spouseInputs} onChange={handleSpouseChange} />
          )}
          <AssetInputSection
            inputs={assetInputs}
            onChange={handleAssetChange}
            currentAge={inputs.currentAge}
          />
        </div>

        {/* Calculate Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleCalculate}
            className={`px-10 py-3.5 active:scale-95 transition-all rounded-xl font-semibold text-lg shadow-lg ${
              coupleMode
                ? "bg-pink-600 hover:bg-pink-500 shadow-pink-900/40"
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/40"
            }`}
          >
            계산하기
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="mt-10 space-y-6">
            <RetirementAssetSection
              nationalPension={results.afterChange.monthlyPension}
              currentAge={inputs.currentAge}
              assetInputs={assetInputs}
            />
            <ResultSection results={results} inputs={inputs} />
            <PensionChart results={results} />
            {coupleMode && (
              <CoupleResultSection
                myMonthlyPension={results.afterChange.monthlyPension}
                myCurrentAge={inputs.currentAge}
                spouseInputs={spouseInputs}
                livingExpense={livingExpense}
                onLivingExpenseChange={setLivingExpense}
              />
            )}
            <NegotiationSection inputs={inputs} />
            <PeerRankSection inputs={inputs} results={results} peerRank={peerRank!} />
            <ShareButton inputs={inputs} results={results} peerRank={peerRank} />
          </div>
        )}

        <footer className="mt-14 text-center text-xs text-slate-600">
          본 계산기는 참고용이며 실제 수령액과 다를 수 있습니다 · 국민연금 A값 286만원 기준
        </footer>
      </div>
    </main>
  );
}
