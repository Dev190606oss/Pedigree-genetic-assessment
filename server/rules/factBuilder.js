/**
 * PEDIGREE — Fact Builder (Clinical Decision Support / AIES Knowledge Representation)
 * Transforms raw family graph nodes, relationships, and medical conditions
 * into a rich set of normalized, deterministic facts for rule evaluation.
 */

const { getRelationshipDefinition, getBiologicalParentChildRoles } = require('../utils/relationshipHelper');

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
  facts.total_members = members.length;
  facts.family_member_count = members.length;
  facts.relationship_count = relationships.length;
  facts.condition_record_count = conditions.length;
  facts.condition_reported = conditions.length > 0;

  const proband = members.find(m => m.isProband);
  facts.proband_exists = Boolean(proband);
  facts.proband_id = proband ? proband._id.toString() : null;
  facts.proband_name = proband ? proband.name : null;
  facts.proband_sex = proband ? proband.sex : 'UNKNOWN';

  // Build Adjacency Maps
  // Biological parents and children only for inheritance and risk calculations
  const parentsOf = {}; // childId -> [parentId] (biological only)
  const childrenOf = {}; // parentId -> [childId] (biological only)
  const spousesOf = {}; // memberId -> [spouseId]
  const siblingsOf = {}; // memberId -> [siblingId] (biological)
  const stepParentsOf = {}; // childId -> [stepParentId] (non-biological)
  const adoptiveParentsOf = {}; // childId -> [adoptiveParentId] (non-biological)
  const extendedDirectRels = []; // direct extended relationships (grandparents, aunts, uncles, cousins)

  members.forEach(m => {
    const id = m._id.toString();
    parentsOf[id] = [];
    childrenOf[id] = [];
    spousesOf[id] = [];
    siblingsOf[id] = [];
    stepParentsOf[id] = [];
    adoptiveParentsOf[id] = [];
  });

  relationships.forEach(rel => {
    const fromId = rel.fromMemberId ? (rel.fromMemberId._id || rel.fromMemberId).toString() : null;
    const toId = rel.toMemberId ? (rel.toMemberId._id || rel.toMemberId).toString() : null;

    if (!fromId || !toId || !parentsOf[fromId] || !parentsOf[toId]) return;

    // Check biological parent-child role first
    const pcRole = getBiologicalParentChildRoles(rel);
    if (pcRole.isParentChild) {
      parentsOf[pcRole.childId].push(pcRole.parentId);
      childrenOf[pcRole.parentId].push(pcRole.childId);
      return;
    }

    const def = getRelationshipDefinition(rel.type);
    const baseType = rel.metadata?.baseType || def.baseType;
    const isBio = rel.metadata?.isBiological !== undefined ? rel.metadata.isBiological : def.isBiological;
    const dir = rel.metadata?.direction || def.direction;

    if (baseType === 'SPOUSE' || baseType === 'PARTNER') {
      spousesOf[fromId].push(toId);
      spousesOf[toId].push(fromId);
    } else if (baseType === 'SIBLING' && isBio) {
      siblingsOf[fromId].push(toId);
      siblingsOf[toId].push(fromId);
    } else if (baseType === 'STEP_PARENT' || (!isBio && ['STEP_FATHER', 'STEP_MOTHER', 'STEP_PARENT', 'STEP_SON', 'STEP_DAUGHTER', 'STEP_CHILD'].includes(rel.type))) {
      // Step family is explicitly non-biological
      const parentId = dir === 'CHILD_TO_PARENT' ? toId : fromId;
      const childId = dir === 'CHILD_TO_PARENT' ? fromId : toId;
      if (stepParentsOf[childId]) stepParentsOf[childId].push(parentId);
    } else if (baseType === 'ADOPTIVE_PARENT' || (!isBio && ['ADOPTIVE_FATHER', 'ADOPTIVE_MOTHER', 'ADOPTIVE_PARENT', 'ADOPTED_SON', 'ADOPTED_DAUGHTER', 'ADOPTED_CHILD'].includes(rel.type))) {
      // Adoptive family is explicitly non-biological
      const parentId = dir === 'CHILD_TO_PARENT' ? toId : fromId;
      const childId = dir === 'CHILD_TO_PARENT' ? fromId : toId;
      if (adoptiveParentsOf[childId]) adoptiveParentsOf[childId].push(parentId);
    } else {
      // Direct extended relationships
      extendedDirectRels.push({ rel, def, fromId, toId, baseType, dir });
    }
  });

  // Infer shared biological parents as siblings
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

  // 2. Generational Level Calculation
  // Proband is generation 0; parents/aunts/uncles = +1; grandparents = +2; children = -1; grandchildren = -2
  const genLevel = {};
  const queue = [];

  if (proband) {
    const pId = proband._id.toString();
    genLevel[pId] = 0;
    queue.push(pId);
  } else if (members.length > 0) {
    const firstId = members[0]._id.toString();
    genLevel[firstId] = 0;
    queue.push(firstId);
  }

  while (queue.length > 0) {
    const currId = queue.shift();
    const currLevel = genLevel[currId];

    // Parents are 1 generation above (+1)
    (parentsOf[currId] || []).forEach(parentId => {
      if (genLevel[parentId] === undefined) {
        genLevel[parentId] = currLevel + 1;
        queue.push(parentId);
      }
    });

    // Step / Adoptive parents are also 1 generation above (+1)
    (stepParentsOf[currId] || []).forEach(parentId => {
      if (genLevel[parentId] === undefined) {
        genLevel[parentId] = currLevel + 1;
        queue.push(parentId);
      }
    });
    (adoptiveParentsOf[currId] || []).forEach(parentId => {
      if (genLevel[parentId] === undefined) {
        genLevel[parentId] = currLevel + 1;
        queue.push(parentId);
      }
    });

    // Children are 1 generation below (-1)
    (childrenOf[currId] || []).forEach(childId => {
      if (genLevel[childId] === undefined) {
        genLevel[childId] = currLevel - 1;
        queue.push(childId);
      }
    });

    // Siblings are at the same generation (0 relative)
    (siblingsOf[currId] || []).forEach(sibId => {
      if (genLevel[sibId] === undefined) {
        genLevel[sibId] = currLevel;
        queue.push(sibId);
      }
    });

    // Spouses/Partners are at the same generation
    (spousesOf[currId] || []).forEach(spId => {
      if (genLevel[spId] === undefined) {
        genLevel[spId] = currLevel;
        queue.push(spId);
      }
    });
  }

  // Extended direct relationships generational propagation
  extendedDirectRels.forEach(({ def, fromId, toId, baseType }) => {
    if (genLevel[toId] !== undefined && genLevel[fromId] === undefined) {
      if (baseType === 'GRANDPARENT') {
        genLevel[fromId] = def.direction === 'CHILD_TO_PARENT' ? genLevel[toId] - 2 : genLevel[toId] + 2;
      } else if (baseType === 'AUNT_UNCLE') {
        genLevel[fromId] = def.direction === 'CHILD_TO_PARENT' ? genLevel[toId] - 1 : genLevel[toId] + 1;
      } else if (baseType === 'COUSIN') {
        genLevel[fromId] = genLevel[toId];
      }
    } else if (genLevel[fromId] !== undefined && genLevel[toId] === undefined) {
      if (baseType === 'GRANDPARENT') {
        genLevel[toId] = def.direction === 'CHILD_TO_PARENT' ? genLevel[fromId] + 2 : genLevel[fromId] - 2;
      } else if (baseType === 'AUNT_UNCLE') {
        genLevel[toId] = def.direction === 'CHILD_TO_PARENT' ? genLevel[fromId] + 1 : genLevel[fromId] - 1;
      } else if (baseType === 'COUSIN') {
        genLevel[toId] = genLevel[fromId];
      }
    }
  });

  // Fallback for any unreached/isolated members
  members.forEach(m => {
    const id = m._id.toString();
    if (genLevel[id] === undefined) {
      genLevel[id] = 0;
    }
  });

  // 3. Degree of Relatedness & Relationship Identification
  const firstDegreeIds = new Set();
  const secondDegreeIds = new Set();
  const parentIds = new Set();
  const siblingIds = new Set();
  const childIds = new Set();
  const grandparentIds = new Set();
  const auntUncleIds = new Set();
  const maternalLineIds = new Set();
  const paternalLineIds = new Set();

  if (proband) {
    const pId = proband._id.toString();

    // 1st Degree: Biological Parents, Biological Children, Full Siblings
    (parentsOf[pId] || []).forEach(id => {
      firstDegreeIds.add(id);
      parentIds.add(id);
    });
    (childrenOf[pId] || []).forEach(id => {
      firstDegreeIds.add(id);
      childIds.add(id);
    });
    (siblingsOf[pId] || []).forEach(id => {
      firstDegreeIds.add(id);
      siblingIds.add(id);
    });

    // 2nd Degree: Grandparents, Grandchildren, Aunts/Uncles, Nieces/Nephews
    (parentsOf[pId] || []).forEach(parentId => {
      (parentsOf[parentId] || []).forEach(gpId => {
        secondDegreeIds.add(gpId);
        grandparentIds.add(gpId);
      });
      (siblingsOf[parentId] || []).forEach(auId => {
        secondDegreeIds.add(auId);
        auntUncleIds.add(auId);
      });
    });

    (childrenOf[pId] || []).forEach(childId => {
      (childrenOf[childId] || []).forEach(gcId => secondDegreeIds.add(gcId));
    });

    (siblingsOf[pId] || []).forEach(sibId => {
      (childrenOf[sibId] || []).forEach(nnId => secondDegreeIds.add(nnId));
    });

    // Incorporate direct extended relationships linked to proband
    extendedDirectRels.forEach(({ def, fromId, toId, baseType }) => {
      if (toId === pId) {
        if (baseType === 'GRANDPARENT') {
          if (def.direction === 'CHILD_TO_PARENT') {
            secondDegreeIds.add(fromId);
          } else {
            secondDegreeIds.add(fromId);
            grandparentIds.add(fromId);
          }
        } else if (baseType === 'AUNT_UNCLE') {
          secondDegreeIds.add(fromId);
          if (def.direction !== 'CHILD_TO_PARENT') {
            auntUncleIds.add(fromId);
          }
        }
        if (def.lineage === 'PATERNAL' || def.code.includes('PATERNAL_')) {
          paternalLineIds.add(fromId);
        } else if (def.lineage === 'MATERNAL' || def.code.includes('MATERNAL_')) {
          maternalLineIds.add(fromId);
        }
      } else if (fromId === pId) {
        if (baseType === 'GRANDPARENT') {
          secondDegreeIds.add(toId);
          if (def.direction === 'CHILD_TO_PARENT') {
            grandparentIds.add(toId);
          }
        } else if (baseType === 'AUNT_UNCLE') {
          secondDegreeIds.add(toId);
        }
        if (def.lineage === 'PATERNAL' || def.code.includes('PATERNAL_')) {
          paternalLineIds.add(toId);
        } else if (def.lineage === 'MATERNAL' || def.code.includes('MATERNAL_')) {
          maternalLineIds.add(toId);
        }
      }
    });

    secondDegreeIds.delete(pId);
    firstDegreeIds.forEach(id => secondDegreeIds.delete(id));
  }

  // 4. Lineage Breakdown for Proband
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

  // 5. Consanguinity Analysis
  let consanguinityDetected = false;
  const couples = [];

  relationships.forEach(rel => {
    const fId = (rel.fromMemberId?._id || rel.fromMemberId)?.toString();
    const tId = (rel.toMemberId?._id || rel.toMemberId)?.toString();
    if (!fId || !tId) return;
    const def = getRelationshipDefinition(rel.type);
    const baseType = rel.metadata?.baseType || def.baseType;
    if (baseType === 'SPOUSE' || baseType === 'PARTNER') {
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
    for (const a of ancestors1) {
      if (ancestors2.has(a)) {
        consanguinityDetected = true;
        break;
      }
    }
  });

  facts.consanguinity_detected = consanguinityDetected;

  // 6. Conditions and Clinical Status Analysis
  const affectedMemberIds = new Set();
  const carrierMemberIds = new Set();
  const conditionsByMember = {};
  const membersByConditionCode = {};
  const categoriesPresent = new Set();

  let earlyOnsetDetected = false;
  let probandAffected = false;
  let probandCarrier = false;
  let firstDegreeAffected = false;
  let secondDegreeAffected = false;
  let maternalLineAffected = false;
  let paternalLineAffected = false;

  let affectedParent = false;
  let affectedSibling = false;
  let affectedGrandparent = false;
  let affectedAuntUncle = false;
  let affectedChild = false;

  const affectedGenerationsSet = new Set();

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

      if (genLevel[mId] !== undefined) {
        affectedGenerationsSet.add(genLevel[mId]);
      }

      if (proband && mId === proband._id.toString()) probandAffected = true;
      if (firstDegreeIds.has(mId)) firstDegreeAffected = true;
      if (secondDegreeIds.has(mId)) secondDegreeAffected = true;
      if (maternalLineIds.has(mId)) maternalLineAffected = true;
      if (paternalLineIds.has(mId)) paternalLineAffected = true;

      if (parentIds.has(mId)) affectedParent = true;
      if (siblingIds.has(mId)) affectedSibling = true;
      if (grandparentIds.has(mId)) affectedGrandparent = true;
      if (auntUncleIds.has(mId)) affectedAuntUncle = true;
      if (childIds.has(mId)) affectedChild = true;

      if (c.ageAtOnset !== null && c.ageAtOnset !== undefined && c.ageAtOnset < 50) {
        earlyOnsetDetected = true;
      }
    } else if (c.status === 'CARRIER') {
      carrierMemberIds.add(mId);
      membersByConditionCode[code].carrier.push(mId);

      if (proband && mId === proband._id.toString()) probandCarrier = true;
    }
  });

  // 7. Multi-generational Transmission Check
  let multiGenerationalTransmission = false;
  members.forEach(child => {
    const cId = child._id.toString();
    (parentsOf[cId] || []).forEach(pId => {
      if (affectedMemberIds.has(pId) && affectedMemberIds.has(cId)) {
        multiGenerationalTransmission = true;
      }
    });
  });

  // Calculate affected generation span
  let affectedGenerations = affectedGenerationsSet.size;
  if (affectedGenerations === 0 && affectedMemberIds.size > 0) {
    affectedGenerations = 1;
  }
  if (multiGenerationalTransmission && affectedGenerations < 2) {
    affectedGenerations = 2;
  }

  // Calculate distinct relationship categories affected
  const affectedCategories = new Set();
  if (probandAffected) affectedCategories.add('SELF');
  if (affectedParent) affectedCategories.add('PARENT');
  if (affectedSibling) affectedCategories.add('SIBLING');
  if (affectedChild) affectedCategories.add('CHILD');
  if (affectedGrandparent) affectedCategories.add('GRANDPARENT');
  if (affectedAuntUncle) affectedCategories.add('AUNT_UNCLE');
  if (secondDegreeAffected && !affectedGrandparent && !affectedAuntUncle) {
    affectedCategories.add('EXTENDED_SECOND_DEGREE');
  }
  const relationshipCategoriesCount = affectedCategories.size;

  // 8. Assign Fact Dictionary
  facts.affected_members = affectedMemberIds.size;
  facts.affected_member_count = affectedMemberIds.size;
  facts.carrier_members = carrierMemberIds.size;
  facts.carrier_member_count = carrierMemberIds.size;
  facts.carrier_count = carrierMemberIds.size;
  facts.affected_generations = affectedGenerations;
  facts.consanguinity_reported = facts.consanguinity_detected;

  facts.family_history_present = affectedMemberIds.size > 0 || carrierMemberIds.size > 0;
  facts.condition_present = affectedMemberIds.size > 0 || carrierMemberIds.size > 0;
  facts.condition_present_in_proband = probandAffected;
  facts.proband_is_carrier = probandCarrier;
  facts.first_degree_relative_affected = firstDegreeAffected;
  facts.first_degree_affected = firstDegreeAffected;
  facts.second_degree_relative_affected = secondDegreeAffected;
  facts.second_degree_affected = secondDegreeAffected;

  facts.multiple_affected_members = affectedMemberIds.size >= 2;
  facts.multiple_affected_relatives = affectedMemberIds.size >= 2;
  facts.multi_generational_pattern = affectedGenerations >= 2 || multiGenerationalTransmission;
  facts.multi_generational_transmission = multiGenerationalTransmission;

  facts.affected_parent = affectedParent;
  facts.parent_history_present = affectedParent;
  facts.affected_sibling = affectedSibling;
  facts.sibling_history_present = affectedSibling;
  facts.affected_grandparent = affectedGrandparent;
  facts.affected_aunt_uncle = affectedAuntUncle;
  facts.affected_child = affectedChild;

  facts.relationship_categories_count = relationshipCategoriesCount;
  facts.broader_family_history = relationshipCategoriesCount >= 2;

  facts.early_onset_detected = earlyOnsetDetected;
  facts.maternal_line_affected = maternalLineAffected;
  facts.paternal_line_affected = paternalLineAffected;

  // 9. Dual-Carrier Recessive Risk
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

  // 9b. X-Linked Recessive Transmission Pattern
  let xLinkedConditionPresent = false;
  let xLinkedCarrierMother = false;
  let xLinkedAffectedGrandfather = false;
  let xLinkedAffectedRelative = false;
  let xLinkedRecessivePattern = false;

  const xLinkedCodes = new Set();
  conditions.forEach(c => {
    const cond = c.conditionId || {};
    const cat = cond.category || '';
    const code = cond.code || '';
    const name = (cond.name || '').toLowerCase();
    if (cat === 'X_LINKED' || code === 'HEMA-F8' || name.includes('hemophilia') || name.includes('duchenne')) {
      xLinkedCodes.add(code);
      xLinkedConditionPresent = true;
    }
  });

  if (xLinkedConditionPresent) {
    if (maternalParentId && (carrierMemberIds.has(maternalParentId) || affectedMemberIds.has(maternalParentId))) {
      xLinkedCarrierMother = true;
    }

    if (maternalParentId) {
      (parentsOf[maternalParentId] || []).forEach(gpId => {
        const gp = members.find(m => m._id.toString() === gpId);
        if (gp && gp.sex === 'MALE' && affectedMemberIds.has(gpId)) {
          xLinkedAffectedGrandfather = true;
        }
      });
    }

    extendedDirectRels.forEach(({ def, fromId, toId, baseType }) => {
      const isGrandparent = baseType === 'GRANDPARENT' || def?.code?.includes('GRANDFATHER');
      const isMaternal = def?.lineage === 'MATERNAL' || def?.code?.includes('MATERNAL');
      if (isGrandparent && isMaternal) {
        const gpId = def.direction === 'CHILD_TO_PARENT' ? toId : fromId;
        const gp = members.find(m => m._id.toString() === gpId);
        if (gp && gp.sex === 'MALE' && affectedMemberIds.has(gpId)) {
          xLinkedAffectedGrandfather = true;
        }
      }
    });

    maternalLineIds.forEach(relId => {
      const rel = members.find(m => m._id.toString() === relId);
      if (rel && rel.sex === 'MALE' && affectedMemberIds.has(relId)) {
        xLinkedAffectedRelative = true;
      }
    });

    if (
      (xLinkedCarrierMother && (xLinkedAffectedGrandfather || xLinkedAffectedRelative)) ||
      (xLinkedCarrierMother && proband && proband.sex === 'MALE') ||
      (xLinkedAffectedGrandfather && xLinkedCarrierMother) ||
      (xLinkedAffectedGrandfather && proband && proband.sex === 'MALE') ||
      (proband && proband.sex === 'MALE' && affectedMemberIds.has(proband._id.toString())) ||
      (carrierMemberIds.size > 0 && affectedMemberIds.size > 0)
    ) {
      xLinkedRecessivePattern = true;
    }
  }

  facts.x_linked_condition_present = xLinkedConditionPresent;
  facts.x_linked_carrier_mother = xLinkedCarrierMother;
  facts.x_linked_affected_grandfather = xLinkedAffectedGrandfather;
  facts.x_linked_affected_relative = xLinkedAffectedRelative;
  facts.x_linked_recessive_pattern = xLinkedRecessivePattern;

  // 10. Parental Age & Aneuploidy Indicators
  function calculateAge(dob) {
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
      age--;
    }
    return age;
  }

  let maternalAgeOver35 = false;
  let paternalAgeOver40 = false;
  let maternalAge = null;
  let paternalAge = null;

  if (proband) {
    const pId = proband._id.toString();
    const probandAge = calculateAge(proband.dateOfBirth);
    const pSpouseIds = spousesOf[pId] || [];
    const partner = members.find(m => pSpouseIds.includes(m._id.toString()));
    const partnerAge = partner ? calculateAge(partner.dateOfBirth) : null;

    if (proband.sex === 'FEMALE') {
      maternalAge = probandAge;
      if (partner && partner.sex === 'MALE') paternalAge = partnerAge;
    } else if (proband.sex === 'MALE') {
      paternalAge = probandAge;
      if (partner && partner.sex === 'FEMALE') maternalAge = partnerAge;
    }
  }

  if (maternalAge !== null && maternalAge >= 35) {
    maternalAgeOver35 = true;
  }
  if (paternalAge !== null && paternalAge >= 40) {
    paternalAgeOver40 = true;
  }

  // Also inspect any defined couples if proband couple did not set both
  couples.forEach(([m1Id, m2Id]) => {
    const m1 = members.find(m => m._id.toString() === m1Id);
    const m2 = members.find(m => m._id.toString() === m2Id);
    [m1, m2].forEach(m => {
      if (m && m.dateOfBirth) {
        const age = calculateAge(m.dateOfBirth);
        if (age !== null) {
          if (m.sex === 'FEMALE' && age >= 35) maternalAgeOver35 = true;
          if (m.sex === 'MALE' && age >= 40) paternalAgeOver40 = true;
        }
      }
    });
  });

  facts.maternal_age = maternalAge;
  facts.paternal_age = paternalAge;
  facts.maternal_age_over_35 = maternalAgeOver35;
  facts.advanced_maternal_age = maternalAgeOver35;
  facts.paternal_age_over_40 = paternalAgeOver40;
  facts.advanced_paternal_age = paternalAgeOver40;

  // 11. Obstetric History & Recurrent Pregnancy Loss
  const allNotes = [
    family?.description || '',
    ...members.map(m => m.notes || ''),
    ...conditions.map(c => c.notes || '')
  ].join(' ').toLowerCase();

  const rplDetected = (
    allNotes.includes('pregnancy loss') ||
    allNotes.includes('miscarriage') ||
    allNotes.includes('recurrent loss') ||
    allNotes.includes('habitual abortion')
  );
  facts.recurrent_pregnancy_loss = rplDetected;

  // 12. Pedigree Completeness
  const isComplete = members.length >= 3 && Boolean(proband) && (facts.has_both_parents_recorded || couples.length > 0);
  facts.family_history_complete = isComplete;
  facts.required_family_information_missing = !isComplete;

  return facts;
}

module.exports = {
  buildFacts
};
