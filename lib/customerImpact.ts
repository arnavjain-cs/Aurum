/**
 * GridShield OS — Customer Impact Analysis
 * Estimates customer mix and impact scores for load shedding decisions.
 */

import type { GridGraph } from '../src/lib/simulation/types'

export interface CustomerImpactScore {
  nodeId: string
  residentialWeight: number // 0–1, higher = more residential
  commercialWeight: number // 0–1
  industrialWeight: number // 0–1
  impactRatio: number // 0–1, normalized impact score
}

/**
 * Calculate customer impact score for a load node.
 * Higher impactRatio means worse to shed (more residential = higher impact).
 */
export function calculateCustomerImpact(
  graph: GridGraph,
  loadNodeId: string
): CustomerImpactScore {
  const node = graph.nodes.get(loadNodeId)
  if (!node || node.type !== 'load') {
    return {
      nodeId: loadNodeId,
      residentialWeight: 0,
      commercialWeight: 0.5,
      industrialWeight: 0.5,
      impactRatio: 0.5,
    }
  }

  // Estimate based on node location and name hints
  const nodeName = node.name.toLowerCase()

  let resWeight = 0
  let comWeight = 0
  let indWeight = 0

  if (nodeName.includes('city') || nodeName.includes('metro') || nodeName.includes('urban')) {
    resWeight = 0.7
    comWeight = 0.2
    indWeight = 0.1
  } else if (nodeName.includes('industrial') || nodeName.includes('refinery')) {
    resWeight = 0.1
    comWeight = 0.2
    indWeight = 0.7
  } else if (nodeName.includes('business') || nodeName.includes('downtown')) {
    resWeight = 0.2
    comWeight = 0.6
    indWeight = 0.2
  } else {
    resWeight = 0.33
    comWeight = 0.33
    indWeight = 0.34
  }

  // Impact ratio: weights per research (residential 70%, commercial 30%, industrial 10% severity)
  // Higher impactRatio means worse to shed (more residential = higher impact)
  const impactRatio = resWeight * 0.7 + comWeight * 0.3 + indWeight * 0.1

  return {
    nodeId: loadNodeId,
    residentialWeight: resWeight,
    commercialWeight: comWeight,
    industrialWeight: indWeight,
    impactRatio,
  }
}
