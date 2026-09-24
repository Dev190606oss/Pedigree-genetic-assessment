const { RULE_OPERATORS } = require('../constants');

/**
 * Deterministic operator evaluator
 * @param {any} factValue - The actual value of the fact extracted from family data
 * @param {string} operator - The rule operator
 * @param {any} targetValue - The target value defined in the rule condition
 * @returns {boolean}
 */
function evaluateCondition(factValue, operator, targetValue) {
  switch (operator) {
    case RULE_OPERATORS.EXISTS:
      return factValue !== undefined && factValue !== null && factValue !== false && factValue !== '';

    case RULE_OPERATORS.NOT_EXISTS:
      return factValue === undefined || factValue === null || factValue === false || factValue === '';

    case RULE_OPERATORS.EQUALS:
      if (typeof factValue === 'boolean' || typeof targetValue === 'boolean') {
        return Boolean(factValue) === Boolean(targetValue);
      }
      return factValue === targetValue;

    case RULE_OPERATORS.NOT_EQUALS:
      if (typeof factValue === 'boolean' || typeof targetValue === 'boolean') {
        return Boolean(factValue) !== Boolean(targetValue);
      }
      return factValue !== targetValue;

    case RULE_OPERATORS.GREATER_THAN:
      return Number(factValue) > Number(targetValue);

    case RULE_OPERATORS.LESS_THAN:
      return Number(factValue) < Number(targetValue);

    case RULE_OPERATORS.GREATER_OR_EQUAL:
      return Number(factValue) >= Number(targetValue);

    case RULE_OPERATORS.LESS_OR_EQUAL:
      return Number(factValue) <= Number(targetValue);

    case RULE_OPERATORS.IN:
      if (!Array.isArray(targetValue)) return false;
      return targetValue.includes(factValue);

    case RULE_OPERATORS.CONTAINS:
      if (Array.isArray(factValue)) {
        return factValue.includes(targetValue);
      }
      if (typeof factValue === 'string') {
        return factValue.toLowerCase().includes(String(targetValue).toLowerCase());
      }
      return false;

    default:
      console.warn(`[RuleEngine] Unsupported operator: ${operator}`);
      return false;
  }
}

module.exports = {
  evaluateCondition
};
