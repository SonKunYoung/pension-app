export type JobRole = "개발" | "마케팅" | "영업" | "재무" | "인사" | "디자인" | "생산";

export interface SimulatorInputs {
  currentAge: number;         // 현재 나이 (18~64)
  subscriptionYears: number;  // 현재 국민연금 가입기간 (년)
  currentSalary: number;      // 현재 연봉 (만원)
  newSalary: number;          // 이직 후 연봉 (만원)
  additionalYears: number;    // 이직 후 재직 예상 기간 (년)
  pensionStartAge: number;    // 연금 수령 시작 나이 (65~70)
  targetSalary: number;       // 협상 목표 연봉 (만원)
  job: JobRole;               // 직무
}

export interface AssetInputs {
  irpMonthly: number;      // IRP 월 납입액 (만원)
  irpRate: number;         // IRP 연수익률 (%)
  savingsMonthly: number;  // 연금저축 월 납입액 (만원)
  savingsRate: number;     // 연금저축 연수익률 (%)
  etfMonthly: number;      // ETF 월 적립액 (만원)
  etfRate: number;         // ETF 연수익률 (%)
}

export interface SpouseInputs {
  age: number;               // 배우자 나이
  subscriptionYears: number; // 국민연금 가입기간
  salary: number;            // 연봉 (만원)
}

export interface NegotiationResult {
  raise: number;                    // 연봉 인상액 (만원)
  annualTakeHomeIncrease: number;   // 연간 실수령액 증가분 (만원)
  monthlyPensionIncrease: number;   // 65세 월 연금 증가분 (만원)
  total30Increase: number;          // 30년 누적 연금 증가분 (만원)
  lifetimeValue: number;            // 평생 가치 (만원)
  workingYears: number;             // 남은 근무 연수
}

export interface PensionScenario {
  monthlyPension: number;         // 65세 즉시 수령 월 수령액 (만원)
  monthlyPensionDeferred: number; // 연기 수령 월 수령액 (만원)
  totalPension30: number;         // 즉시 수령 30년 누적 (만원)
  totalPensionDeferred30: number; // 연기 수령 30년 누적 (만원)
  subscriptionYears: number;
  avgMonthlyIncome: number;
}

export interface IRPResult {
  currentDeduction: number;
  newDeduction: number;
  diff: number;
}

export interface SimulatorResults {
  current: PensionScenario;
  afterChange: PensionScenario;
  monthlyDiff: number;
  total30Diff: number;
  irp: IRPResult;
  chartData: ChartDataPoint[];
  retirementAge: number;
  pensionStartAge: number;
}

export interface ChartDataPoint {
  year: number;
  current: number;
  afterChange: number;
  currentDeferred: number;
  afterChangeDeferred: number;
}
