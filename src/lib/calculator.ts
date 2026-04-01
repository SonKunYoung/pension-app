import type {
  SimulatorInputs,
  SimulatorResults,
  PensionScenario,
  IRPResult,
  ChartDataPoint,
  NegotiationResult,
} from "./types";

// 국민연금 A값 (2024년 기준 전체 가입자 평균 월 소득)
const A_VALUE = 286; // 만원
// 연기 수령 가산율: 1년당 7.2%
const DEFERRAL_RATE_PER_YEAR = 0.072;

// 국민연금 공식: (A값 + B값) × 0.01 × 가입기간
function calcBaseMonthlyPension(avgAnnualSalary: number, years: number): number {
  const B = avgAnnualSalary / 12;
  return (A_VALUE + B) * 0.01 * years;
}

// 연기 수령 가산: 기준 연금 × (1 + 0.072 × 연기 년수)
function applyDeferral(base: number, startAge: number): number {
  const deferYears = Math.max(0, startAge - 65);
  return base * (1 + DEFERRAL_RATE_PER_YEAR * deferYears);
}

// 한계 실효세율 (소득세 한계세율 + 4대보험 근로자부담 ~9.4%)
function marginalDeductionRate(salary: number): number {
  if (salary <= 5500) return 0.094 + 0.15;  // ~24.4%
  if (salary <= 8800) return 0.094 + 0.24;  // ~33.4%
  return 0.094 + 0.35;                       // ~44.4%
}

// IRP 세액공제: 연봉 5500만원 이하 16.5% / 초과 13.2%, 한도 900만원
function calcIRPDeduction(annualSalary: number): number {
  const salaryWon = annualSalary * 10000;
  const irpLimit = 9_000_000;
  const rate = salaryWon <= 55_000_000 ? 0.165 : 0.132;
  return Math.round((irpLimit * rate) / 10000);
}

export function calculateNegotiation(inputs: SimulatorInputs): NegotiationResult {
  const { currentAge, subscriptionYears, currentSalary, targetSalary } = inputs;

  const raise = targetSalary - currentSalary;
  // 인상분에 적용되는 한계 실효세율 (목표 연봉 기준)
  const deductRate = marginalDeductionRate(targetSalary);
  const annualTakeHomeIncrease = Math.round(raise * (1 - deductRate) * 10) / 10;

  // 65세까지 총 가입기간 기준 연금 차이
  const totalYears = subscriptionYears + Math.max(0, 65 - currentAge);
  const currentMonthly = calcBaseMonthlyPension(currentSalary, totalYears);
  const targetMonthly = calcBaseMonthlyPension(targetSalary, totalYears);
  const monthlyPensionIncrease = Math.round((targetMonthly - currentMonthly) * 10) / 10;
  const total30Increase = Math.round(monthlyPensionIncrease * 12 * 30 * 10) / 10;

  // 평생 가치: 남은 근무기간 실수령 증가 + 30년 누적 연금 증가
  const workingYears = Math.max(0, 65 - currentAge);
  const lifetimeValue =
    Math.round((annualTakeHomeIncrease * workingYears + total30Increase) * 10) / 10;

  return { raise, annualTakeHomeIncrease, monthlyPensionIncrease, total30Increase, lifetimeValue, workingYears };
}

export function calculatePension(inputs: SimulatorInputs): SimulatorResults {
  const {
    currentAge,
    subscriptionYears,
    currentSalary,
    newSalary,
    additionalYears,
    pensionStartAge,
  } = inputs;

  // 65세까지 남은 가입 기간 (기준: 65세에 납입 종료)
  const remainingYears = Math.max(0, 65 - currentAge);

  // ── 현재 회사 유지 시나리오 ──
  const currentTotalYears = subscriptionYears + remainingYears;
  const currentBase = calcBaseMonthlyPension(currentSalary, currentTotalYears);
  const currentDeferred = applyDeferral(currentBase, pensionStartAge);

  const currentScenario: PensionScenario = {
    monthlyPension: Math.round(currentBase * 10) / 10,
    monthlyPensionDeferred: Math.round(currentDeferred * 10) / 10,
    totalPension30: Math.round(currentBase * 12 * 30 * 10) / 10,
    totalPensionDeferred30: Math.round(currentDeferred * 12 * 30 * 10) / 10,
    subscriptionYears: currentTotalYears,
    avgMonthlyIncome: Math.round(currentSalary / 12),
  };

  // ── 이직 후 시나리오 ──
  const preChangeYears = Math.max(0, remainingYears - additionalYears);
  const totalWeightedYears = preChangeYears + additionalYears;
  const weightedSalary =
    totalWeightedYears > 0
      ? (currentSalary * preChangeYears + newSalary * additionalYears) / totalWeightedYears
      : newSalary;

  const afterChangeTotalYears = subscriptionYears + remainingYears;
  const afterBase = calcBaseMonthlyPension(weightedSalary, afterChangeTotalYears);
  const afterDeferred = applyDeferral(afterBase, pensionStartAge);

  const afterScenario: PensionScenario = {
    monthlyPension: Math.round(afterBase * 10) / 10,
    monthlyPensionDeferred: Math.round(afterDeferred * 10) / 10,
    totalPension30: Math.round(afterBase * 12 * 30 * 10) / 10,
    totalPensionDeferred30: Math.round(afterDeferred * 12 * 30 * 10) / 10,
    subscriptionYears: afterChangeTotalYears,
    avgMonthlyIncome: Math.round(weightedSalary / 12),
  };

  // ── IRP 세액공제 ──
  const irp: IRPResult = {
    currentDeduction: calcIRPDeduction(currentSalary),
    newDeduction: calcIRPDeduction(newSalary),
    diff: calcIRPDeduction(newSalary) - calcIRPDeduction(currentSalary),
  };

  // ── 차이 (65세 즉시 수령 기준) ──
  const monthlyDiff = Math.round((afterBase - currentBase) * 10) / 10;
  const total30Diff =
    Math.round((afterScenario.totalPension30 - currentScenario.totalPension30) * 10) / 10;

  // ── 차트 데이터 (30년 누적) ──
  const chartData: ChartDataPoint[] = [];
  for (let year = 1; year <= 30; year++) {
    chartData.push({
      year,
      current: Math.round(currentBase * 12 * year * 10) / 10,
      afterChange: Math.round(afterBase * 12 * year * 10) / 10,
      currentDeferred: Math.round(currentDeferred * 12 * year * 10) / 10,
      afterChangeDeferred: Math.round(afterDeferred * 12 * year * 10) / 10,
    });
  }

  return {
    current: currentScenario,
    afterChange: afterScenario,
    monthlyDiff,
    total30Diff,
    irp,
    chartData,
    retirementAge: 65,
    pensionStartAge,
  };
}
