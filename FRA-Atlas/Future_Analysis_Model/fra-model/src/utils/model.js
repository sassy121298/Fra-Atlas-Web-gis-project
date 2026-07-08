/**
 * FRA What-If Analysis Model Engine
 * Weights calibrated to FRA implementation literature
 */

const WEIGHTS = {
  forestCover: 0.35,
  tribalDensity: 0.20,
  claimsPending: 0.15,   // inverse — high pending = bad
  encroachmentRate: 0.15, // inverse — high encroachment = bad
  gramSabhaActivity: 0.15
};

/**
 * Normalize a value (0-100) into [0,1], optionally inverted
 */
function norm(val, invert = false) {
  const n = Math.min(100, Math.max(0, val)) / 100;
  return invert ? 1 - n : n;
}

/**
 * Compute composite approval score for a scenario
 * Returns object with approvalRate, riskIndex, priority, projectedAnnual
 */
export function computeMetrics(scenario, baselineTotalClaims = 6000) {
  const score =
    norm(scenario.forestCover) * WEIGHTS.forestCover +
    norm(scenario.tribalDensity) * WEIGHTS.tribalDensity +
    norm(scenario.claimsPending, true) * WEIGHTS.claimsPending +
    norm(scenario.encroachmentRate, true) * WEIGHTS.encroachmentRate +
    norm(scenario.gramSabhaActivity) * WEIGHTS.gramSabhaActivity;

  // Map score [0,1] → approvalRate [15%, 90%]
  const approvalRate = Math.round(15 + score * 75);

  // Risk index: higher encroachment + lower forest cover + higher pending
  const riskRaw =
    norm(scenario.encroachmentRate) * 0.35 +
    norm(scenario.forestCover, true) * 0.30 +
    norm(scenario.claimsPending) * 0.20 +
    norm(scenario.gramSabhaActivity, true) * 0.15;
  const riskIndex = Math.round(riskRaw * 100);

  // Priority classification
  let priority;
  if (approvalRate < 40 || riskIndex > 65) priority = "High";
  else if (approvalRate < 60 || riskIndex > 45) priority = "Medium";
  else priority = "Low";

  // Projected annual approvals
  const projectedAnnual = Math.round(baselineTotalClaims * (approvalRate / 100));

  return { approvalRate, riskIndex, priority, projectedAnnual };
}

/**
 * Compute delta between what-if and baseline metrics
 */
export function computeDeltas(whatIfMetrics, baselineMetrics) {
  return {
    approvalRate: whatIfMetrics.approvalRate - baselineMetrics.approvalRate,
    riskIndex: whatIfMetrics.riskIndex - baselineMetrics.riskIndex,
    projectedAnnual: whatIfMetrics.projectedAnnual - baselineMetrics.projectedAnnual,
  };
}

/**
 * Identify the biggest driver of change between baseline and what-if
 */
export function getPrimaryDriver(baseline, whatIf) {
  const changes = [
    { key: "forestCover", label: "Forest Cover", delta: whatIf.forestCover - baseline.forestCover, invert: false },
    { key: "tribalDensity", label: "Tribal Density", delta: whatIf.tribalDensity - baseline.tribalDensity, invert: false },
    { key: "claimsPending", label: "Claims Pending", delta: whatIf.claimsPending - baseline.claimsPending, invert: true },
    { key: "encroachmentRate", label: "Encroachment Rate", delta: whatIf.encroachmentRate - baseline.encroachmentRate, invert: true },
    { key: "gramSabhaActivity", label: "Gram Sabha Activity", delta: whatIf.gramSabhaActivity - baseline.gramSabhaActivity, invert: false },
  ];

  changes.sort((a, b) => Math.abs(b.delta * (b.invert ? -1 : 1)) - Math.abs(a.delta * (a.invert ? -1 : 1)));
  return changes[0];
}

/**
 * Generate contextual insights for a given scenario vs baseline
 */
export function generateInsights(baseline, whatIf, baselineMetrics, whatIfMetrics) {
  const insights = [];
  const delta = computeDeltas(whatIfMetrics, baselineMetrics);

  // Encroachment threshold insight
  if (whatIf.encroachmentRate > 35) {
    const gain = computeMetrics({ ...whatIf, encroachmentRate: 20 }, baseline.totalClaims).approvalRate - whatIfMetrics.approvalRate;
    insights.push({
      type: "warning",
      icon: "⚠️",
      text: `Encroachment at ${whatIf.encroachmentRate}% is a primary suppressor. Reducing to 20% could gain ~${gain}% approval rate.`
    });
  }

  // Forest cover insight
  if (whatIf.forestCover < 50) {
    insights.push({
      type: "critical",
      icon: "🌲",
      text: `Forest cover below 50% critically reduces claimable forest area. FRA Section 3 eligibility may be challenged for many claimants.`
    });
  }

  // Gram Sabha insight
  if (whatIf.gramSabhaActivity < 50) {
    const gain = computeMetrics({ ...whatIf, gramSabhaActivity: 80 }, baseline.totalClaims).approvalRate - whatIfMetrics.approvalRate;
    insights.push({
      type: "opportunity",
      icon: "🏘️",
      text: `Low Gram Sabha activity (${whatIf.gramSabhaActivity}%) is limiting verification throughput. Mobilising to 80% could add ~${gain}% approval rate.`
    });
  }

  // Claims backlog insight
  if (whatIf.claimsPending > 60) {
    insights.push({
      type: "warning",
      icon: "📋",
      text: `${whatIf.claimsPending}% claims pending signals administrative bottleneck. Dedicated SDLCs could clear backlog in 2-3 quarters.`
    });
  }

  // Improvement summary
  if (delta.approvalRate > 0) {
    insights.push({
      type: "positive",
      icon: "📈",
      text: `Your scenario improves approval rate by ${delta.approvalRate}pp (+${delta.projectedAnnual.toLocaleString()} approvals/year vs baseline).`
    });
  } else if (delta.approvalRate < 0) {
    insights.push({
      type: "negative",
      icon: "📉",
      text: `Your scenario reduces approval rate by ${Math.abs(delta.approvalRate)}pp (${delta.projectedAnnual.toLocaleString()} fewer approvals/year).`
    });
  } else {
    insights.push({
      type: "neutral",
      icon: "➡️",
      text: `Approval rate unchanged from baseline. Adjust key drivers (forest cover, encroachment, Gram Sabha) for meaningful impact.`
    });
  }

  // Tribal density
  if (whatIf.tribalDensity > 80) {
    insights.push({
      type: "opportunity",
      icon: "👥",
      text: `High tribal density (${whatIf.tribalDensity}%) is a strong eligibility multiplier under FRA. Ensure documentation and legal support is scaled to match demand.`
    });
  }

  return insights;
}

/**
 * Rank all districts by risk (descending)
 */
export function rankDistricts(districts) {
  return districts
    .map(d => ({
      ...d,
      metrics: computeMetrics(d, d.totalClaims)
    }))
    .sort((a, b) => b.metrics.riskIndex - a.metrics.riskIndex);
}
