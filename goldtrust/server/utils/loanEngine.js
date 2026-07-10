// Internal credit scoring + installment schedule generation.
// Mirrors the original business logic: savings behaviour + account age
// produce a score out of 900, which caps the eligible loan amount.

function scoreClient(client) {
  const accountAgeMonths = Math.max(
    (Date.now() - new Date(client.onboardedAt || client.createdAt)) / (1000 * 60 * 60 * 24 * 30),
    1
  );

  const totalSavings = client.balance || 0;
  const savingsBehavior = totalSavings / 1; // no withdrawal history modelled here

  const creditScore = Math.min(
    900,
    Math.floor((savingsBehavior / 1000) * 100 + accountAgeMonths * 20)
  );

  const riskClass = creditScore > 750 ? "LOW" : creditScore > 500 ? "MEDIUM" : "HIGH";

  return { creditScore, riskClass };
}

function buildLoanOffer({ requestedAmount, durationInMonths, creditScore }) {
  let months = Number(durationInMonths) || 3;
  if (months < 3) months = 3;
  if (months > 6) months = 6;

  const eligibleAmount = Math.min(requestedAmount, (creditScore / 900) * 500000);

  const interestRate = 0.08; // 8% per month, flat
  const totalInterest = eligibleAmount * interestRate * months;
  const totalRepayment = Math.round(eligibleAmount + totalInterest);

  const weeksPerMonth = 4;
  const totalWeeks = months * weeksPerMonth;
  const weeklyBase = Math.floor(totalRepayment / totalWeeks);

  let remaining = totalRepayment;
  const installments = [];
  let dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  for (let i = 1; i <= totalWeeks; i++) {
    const amount = i === totalWeeks ? remaining : weeklyBase;
    installments.push({
      week: i,
      amount,
      dueDate: new Date(dueDate),
      day: dueDate.toLocaleDateString("en-US", { weekday: "long" }),
      status: "unpaid",
    });
    remaining -= amount;
    dueDate.setDate(dueDate.getDate() + 7);
  }

  return {
    approvedAmount: Math.round(eligibleAmount),
    interestRate: 8,
    totalInterest: Math.round(totalInterest),
    totalRepayment,
    durationInMonths: months,
    weeklyInstallment: weeklyBase,
    installments,
    dueDate: installments[installments.length - 1].dueDate,
  };
}

module.exports = { scoreClient, buildLoanOffer };
