import { expect } from 'chai';

// we should probably add more assertios or use chai types instead of string
type AssertionType = 'equal' | 'include' | 'greaterThan' | 'lessThan' | 'deepEqual' | 'notEqual' | 'isNull' | 'isNotNull' | 'isTrue' | 'isFalse';

type Assertion = {
  type: AssertionType;
  expected?: any;
};

export function performAssertion(assertion: Assertion, actualValue: any) {
  switch (assertion.type) {
    case 'equal':
      expect(actualValue).to.equal(assertion.expected);
      break;
    case 'include':
      if (typeof actualValue === 'string' || Array.isArray(actualValue)) {
        expect(actualValue).to.include(assertion.expected);
      } else {
        expect(actualValue).to.have.property(assertion.expected);
      }
      break;
    case 'greaterThan':
      expect(actualValue).to.be.greaterThan(assertion.expected);
      break;
    case 'lessThan':
      expect(actualValue).to.be.lessThan(assertion.expected);
      break;
    case 'deepEqual':
      expect(actualValue).to.deep.equal(assertion.expected);
      break;
    case 'notEqual':
      expect(actualValue).to.not.equal(assertion.expected);
      break;
    case 'isNull':
      expect(actualValue).to.be.null;
      break;
    case 'isNotNull':
      expect(actualValue).to.not.be.null;
      break;
    case 'isTrue':
      expect(actualValue).to.be.true;
      break;
    case 'isFalse':
      expect(actualValue).to.be.false;
      break;
        // add more cases as needed
    default:
      throw new Error(`Unsupported assertion method: ${assertion.type}`);
  }
}
