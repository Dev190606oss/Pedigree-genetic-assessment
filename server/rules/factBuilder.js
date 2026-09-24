/**
 * PEDIGREE — Fact Builder (AIES Module)
 * Transforms raw family graph nodes, relationships, and medical conditions
 * into a rich set of normalized, deterministic facts for rule evaluation.
 */

/**
 * Builds normalized fact dictionary from raw family graph data
 * @param {Object} familyData
 * @param {Object} familyData.family
 * @param {Array} familyData.members
 * @param {Array} familyData.relationships
 * @param {Array} familyData.conditions - Array of FamilyMemberCondition with populated conditionId
 * @returns {Object} normalized facts map
 */
function buildFacts(familyData) {
  const { family, members = [], relationships = [], conditions = [] } = familyData;

  const facts = {};

  // 1. Basic Demographic & Graph counts
  facts.family_member_count = members.length;
  facts.relationship_count = relationships.length;
  facts.condition_record_count = conditions.length;

  const proband = members.find(m => m.isProband);
  facts.proband_exists = Boolean(proband);
  facts.proband_id = proband ? proband._id.toString() : null;
  facts.proband_name = proband ? proband.name : null;
  facts.proband_sex = proband ? proband.sex : 'UNKNOWN';

  // Build Adjacency Maps
  // parent -> children: from PARENT_CHILD where fromMemberId is parent, toMemberId is child
  const parentsOf = {}; // childId -> [parentId]
  const childrenOf = {}; // parentId -> [childId]
  const spousesOf = {}; // memberId -> [spouseId]
  const siblingsOf = {}; // memberId -> [siblingId]

  members.forEach(m => {
    const id = m._id.toString();
    parentsOf[id] = [];
    childrenOf[id] = [];
    spousesOf[id] = [];
    siblingsOf[id] = [];
  });

  relationships.forEach(rel => {
    const fromId = rel.fromMemberId ? (rel.fromMemberId._id || rel.fromMemberId).toString() : null;
    const toId = rel.toMemberId ? (rel.toMemberId._id || rel.toMemberId).toString() : null;

    if (!fromId || !toId || !parentsOf[fromId] || !parentsOf[toId]) return;

    if (rel.type === 'PARENT_CHILD') {
      parentsOf[toId].push(fromId);
      childrenOf[fromId].push(toId);
    } else if (rel.type === 'SPOUSE' || rel.type === 'PARTNER') {
      spousesOf[fromId].push(toId);
      spousesOf[toId].push(fromId);
    } else if (rel.type === 'SIBLING') {
      siblingsOf[fromId].push(toId);
      siblingsOf[toId].push(fromId);
    }
  });

  // Infer shared parents as siblings
  members.forEach(m1 => {
    const id1 = m1._id.toString();
    members.forEach(m2 => {
      const id2 = m2._id.toString();
      if (id1 !== id2) {
        const p1 = parentsOf[id1] || [];
        const p2 = parentsOf[id2] || [];
        const sharedParents = p1.filter(p => p2.includes(p));
        if (sharedParents.length > 0 && !siblingsOf[id1].includes(id2)) {
          siblingsOf[id1].push(id2);
        }
      }
    });
  });

  // 2. Degree of Relatedness from Proband
  const firstDegreeIds = new Set();
  const secondDegreeIds = new Set();

  if (proband) {
    const pId = proband._id.toString();

    // 1st Degree: Parents, Children, Full Siblings
    (parentsOf[pId] || []).forEach(id => firstDegreeIds.add(id));
    (childrenOf[pId] || []).forEach(id => firstDegreeIds.add(id));
    (siblingsOf[pId] || []).forEach(id => firstDegreeIds.add(id));

    // 2nd Degree: Grandparents, Grandchildren, Aunts/Uncles, Nieces/Nephews, Half-Siblings
    // Grandparents: parents of parents
    (parentsOf[pId] || []).forEach(parentId => {
      (parentsOf[parentId] || []).forEach(gpId => secondDegreeIds.add(gpId));
      // Aunts / Uncles: siblings of parents
      (siblingsOf[parentId] || []).forEach(auId => secondDegreeIds.add(auId));
    });

    // Grandchildren: children of children
    (childrenOf[pId] || []).forEach(childId => {
      (childrenOf[childId] || []).forEach(gcId => secondDegreeIds.add(gcId));
    });

    // Nieces / Nephews: children of siblings
    (siblingsOf[pId] || []).forEach(sibId => {
      (childrenOf[sibId] || []).forEach(nnId => secondDegreeIds.add(nnId));
    });

    // Remove proband and 1st-degree from 2nd-degree set
    secondDegreeIds.delete(pId);
    firstDegreeIds.forEach(id => secondDegreeIds.delete(id));
  }

  // 3. Lineage Breakdown for Proband
  let maternalParentId = null;
  let paternalParentId = null;

  if (proband) {
    const pId = proband._id.toString();
    const parents = parentsOf[pId] || [];
    facts.parent_count = parents.length;
    facts.has_both_parents_recorded = parents.length >= 2;

    parents.forEach(pId => {
      const parentMember = members.find(m => m._id.toString() === pId);
      if (parentMember) {
        if (parentMember.sex === 'FEMALE') maternalParentId = pId;
        if (parentMember.sex === 'MALE') paternalParentId = pId;
      }
    });
  } else {
    facts.parent_count = 0;
    facts.has_both_parents_recorded = false;
  }

  // Gather maternal and paternal relative ID sets
  const maternalLineIds = new Set();
  const paternalLineIds = new Set();

  function collectAncestorsAndRelatives(startId, targetSet) {
    if (!startId) return;
    targetSet.add(startId);
    (parentsOf[startId] || []).forEach(p => collectAncestorsAndRelatives(p, targetSet));
    (siblingsOf[startId] || []).forEach(s => targetSet.add(s));
  }

  if (maternalParentId) collectAncestorsAndRelatives(maternalParentId, maternalLineIds);
  if (paternalParentId) collectAncestorsAndRelatives(paternalParentId, paternalLineIds);

  facts.maternal_relatives_recorded = maternalLineIds.size > 0;
  facts.paternal_relatives_recorded = paternalLineIds.size > 0;

  // 4. Consanguinity Analysis
  // Detect if any partner/spouse pair shares a common biological ancestor
  let consanguinityDetected = false;
  const couples = [];

  relationships.forEach(rel => {
    if (rel.type === 'SPOUSE' || rel.type === 'PARTNER') {
      const fId = (rel.fromMemberId._id || rel.fromMemberId).toString();
      const tId = (rel.toMemberId._id || rel.toMemberId).toString();
      couples.push([fId, tId]);
    }
  });

  function getAncestors(memberId, visited = new Set()) {
    const ancestors = new Set();
    const parents = parentsOf[memberId] || [];
    parents.forEach(p => {
      if (!visited.has(p)) {
        visited.add(p);
        ancestors.add(p);
        const further = getAncestors(p, visited);
        further.forEach(a => ancestors.add(a));
      }
    });
    return ancestors;
  }

  couples.forEach(([m1, m2]) => {
    const ancestors1 = getAncestors(m1);
    const ancestors2 = getAncestors(m2);
    // Check intersection
    for (const a of ancestors1) {
      if (ancestors2.has(a)) {
        consanguinityDetected = true;
        break;
      }
    }
  });

  facts.consanguinity_detected = consanguinityDetected;

  // 5. Conditions and Clinical Status Analysis
  const affectedMemberIds = new Set();
  const carrierMemberIds = new Set();
  const conditionsByMember = {}; // memberId -> [conditionObj]
  const membersByConditionCode = {}; // conditionCode -> { affected: [], carrier: [] }
  const categoriesPresent = new Set();

  let earlyOnsetDetected = false;
  let probandAffected = false;
  let probandCarrier = false;
  let firstDegreeAffected = false;
  let secondDegreeAffected = false;
  let maternalLineAffected = false;
  let paternalLineAffected = false;

  conditions.forEach(c => {
    const mId = (c.memberId._id || c.memberId).toString();
    const cond = c.conditionId || {};
    const code = cond.code || 'UNKNOWN';
    const cat = cond.category || 'OTHER';
    categoriesPresent.add(cat);

    if (!conditionsByMember[mId]) conditionsByMember[mId] = [];
    conditionsByMember[mId].push(c);

    if (!membersByConditionCode[code]) {
      membersByConditionCode[code] = { affected: [], carrier: [] };
    }

    if (c.status === 'AFFECTED') {
      affectedMemberIds.add(mId);
      membersByConditionCode[code].affected.push(mId);

      if (proband && mId === proband._id.toString()) probandAffected = true;
      if (firstDegreeIds.has(mId)) firstDegreeAffected = true;
      if (secondDegreeIds.has(mId)) secondDegreeAffected = true;
      if (maternalLineIds.has(mId)) maternalLineAffected = true;
      if (paternalLineIds.has(mId)) paternalLineAffected = true;

      if (c.ageAtOnset !== null && c.ageAtOnset !== undefined && c.ageAtOnset < 50) {
        earlyOnsetDetected = true;
      }
    } else if (c.status === 'CARRIER') {
      carrierMemberIds.add(mId);
      membersByConditionCode[code].carrier.push(mId);

      if (proband && mId === proband._id.toString()) probandCarrier = true;
    }
  });

  facts.affected_member_count = affectedMemberIds.size;
  facts.carrier_member_count = carrierMemberIds.size;
  facts.condition_present = affectedMemberIds.size > 0 || carrierMemberIds.size > 0;
  facts.condition_present_in_proband = probandAffected;
  facts.proband_is_carrier = probandCarrier;
  facts.first_degree_relative_affected = firstDegreeAffected;
  facts.second_degree_relative_affected = secondDegreeAffected;
  facts.multiple_affected_relatives = affectedMemberIds.size >= 2;
  facts.early_onset_detected = earlyOnsetDetected;
  facts.maternal_line_affected = maternalLineAffected;
  facts.paternal_line_affected = paternalLineAffected;

  // 6. Dual-Carrier Recessive Risk (Both partners in a couple carrier for the same condition)
  let coupleCarrierMatch = false;
  let matchingCarrierCondition = null;

  couples.forEach(([m1, m2]) => {
    Object.keys(membersByConditionCode).forEach(code => {
      const { carrier, affected } = membersByConditionCode[code];
      const allConcerned = [...carrier, ...affected];
      if (allConcerned.includes(m1) && allConcerned.includes(m2)) {
        coupleCarrierMatch = true;
        matchingCarrierCondition = code;
      }
    });
  });

  facts.couple_carrier_match = coupleCarrierMatch;
  facts.matching_carrier_condition = matchingCarrierCondition;

  // 7. Multi-generational Autosomal Dominant check
  // Checks if affected individuals span parent-child relationships
  let multiGenerationalTransmission = false;
  relationships.forEach(rel => {
    if (rel.type === 'PARENT_CHILD') {
      const parentId = (rel.fromMemberId._id || rel.fromMemberId).toString();
      const childId = (rel.toMemberId._id || rel.toMemberId).toString();
      if (affectedMemberIds.has(parentId) && affectedMemberIds.has(childId)) {
        multiGenerationalTransmission = true;
      }
    }
  });
  facts.multi_generational_transmission = multiGenerationalTransmission;

  // 8. Completeness Assessment
  // Comprehensive family pedigree typically contains >= 3 members, proband, and both parents or partner
  const isComplete = members.length >= 3 && Boolean(proband) && (facts.has_both_parents_recorded || couples.length > 0);
  facts.family_history_complete = isComplete;
  facts.required_family_information_missing = !isComplete;

  return facts;
}

module.exports = {
  buildFacts
};
