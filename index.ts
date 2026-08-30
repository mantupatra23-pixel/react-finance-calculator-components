// ============================================================================
// React Finance & Business Calculator Engines
// Production-ready deterministic calculation algorithms
// https://www.mycalculator.xyz
// ============================================================================

// 1. LOAN EMI ENGINE
export interface EMIInputs {
  principal: number;
  annualRate: number;
  tenureYears: number;
}

export function calculateLoanEMI({ principal, annualRate, tenureYears }: EMIInputs) {
  const r = annualRate / 12 / 100;
  const n = tenureYears * 12;

  if (r === 0) {
    const emi = principal / n;
    return { emi: Math.round(emi), totalInterest: 0, totalPayment: principal };
  }

  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - principal;

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
  };
}

// 2. UPWORK NET PAYOUT & TDS (SEC 194-O) ENGINE
export interface UpworkInputs {
  invoiceAmount: number;
  upworkFeePct?: number;
  tdsPct?: number;
  fxSpreadPct?: number;
  withdrawalFee?: number;
}

export function calculateUpwork({
  invoiceAmount,
  upworkFeePct = 10,
  tdsPct = 1.0,
  fxSpreadPct = 1.5,
  withdrawalFee = 0.99,
}: UpworkInputs) {
  const serviceFee = (invoiceAmount * upworkFeePct) / 100;
  const postFeeAmount = invoiceAmount - serviceFee;
  const estimatedTds = (invoiceAmount * tdsPct) / 100;
  const fxFee = (postFeeAmount * fxSpreadPct) / 100;

  const totalDeductions = serviceFee + estimatedTds + fxFee + withdrawalFee;
  const netPayout = Math.max(0, invoiceAmount - totalDeductions);

  return {
    grossInvoice: invoiceAmount,
    serviceFee,
    estimatedTds,
    withdrawalAndFx: fxFee + withdrawalFee,
    netPayout: parseFloat(netPayout.toFixed(2)),
  };
}

// 3. PAYMENT GATEWAY (STRIPE / PAYPAL / RAZORPAY) ENGINE
export interface PaymentGatewayInputs {
  mode: "forward" | "reverse";
  amount: number;
  feePct?: number;
  fixedFee?: number;
  taxPct?: number;
}

export function calculatePaymentGateway({
  mode,
  amount,
  feePct = 2.0,
  fixedFee = 0.0,
  taxPct = 18.0,
}: PaymentGatewayInputs) {
  if (mode === "forward") {
    const baseFee = (amount * feePct) / 100 + fixedFee;
    const taxOnFee = (baseFee * taxPct) / 100;
    const totalDeduction = baseFee + taxOnFee;
    const netReceived = Math.max(0, amount - totalDeduction);
    return { grossAmount: amount, totalDeduction, netReceived };
  } else {
    const effectiveFeeRate = (feePct / 100) * (1 + taxPct / 100);
    const fixedWithTax = fixedFee * (1 + taxPct / 100);
    const grossAmount = (amount + fixedWithTax) / (1 - effectiveFeeRate);
    const totalDeduction = grossAmount - amount;
    return { grossAmount, totalDeduction, netReceived: amount };
  }
}

// 4. E-COMMERCE ROAS & BREAK-EVEN ENGINE
export interface ROASInputs {
  sellingPrice: number;
  orders: number;
  cogs: number;
  shipping: number;
  packaging: number;
  returnsPct: number;
  adSpend: number;
  fixedOverheads?: number;
}

export function calculateROAS({
  sellingPrice,
  orders,
  cogs,
  shipping,
  packaging,
  returnsPct,
  adSpend,
  fixedOverheads = 0,
}: ROASInputs) {
  const grossRevenue = orders * sellingPrice;
  const netRevenue = grossRevenue * (1 - returnsPct / 100);
  const nonAdCosts = orders * (cogs + shipping + packaging);
  const contributionBeforeAds = netRevenue - nonAdCosts;
  const netProfit = contributionBeforeAds - adSpend - fixedOverheads;

  const actualRoas = adSpend > 0 ? grossRevenue / adSpend : 0;
  const breakEvenRoas = contributionBeforeAds > 0 ? grossRevenue / contributionBeforeAds : 0;

  return {
    grossRevenue,
    netRevenue,
    contributionBeforeAds,
    netProfit,
    actualRoas: parseFloat(actualRoas.toFixed(2)),
    breakEvenRoas: parseFloat(breakEvenRoas.toFixed(2)),
  };
}
