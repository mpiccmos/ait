# AIT

![UnitTests](https://github.com/mpiccmos/ait/actions/workflows/tests.yml/badge.svg)
![CodeSpell](https://github.com/mpiccmos/ait/actions/workflows/codespell.yml/badge.svg)

[Unit test coverage report](https://mpiccmos.github.io/ait/)

**IMPORTANT**: AIT is an experimental utility token used to measure time value of its community members.
Its power of control is highly centralized. The issuer has the sole authority to mint, pause/unpause, and upgrade contracts at any time.
This is a deliberate design based on regulatory and legal considerations. Albeit being centrally issued and managed, AIT can
be circulated and traded freely, and all the activities are transparent on-chain. There is plan to gradually move towards decentralization,
but until then, the user has to trust the issuer to do the right thing. Please refer to the whitepaper after launch for more details.

## Setup

1. Use specified `npm` version
   ```
   nvm use
   ```
1. Install dependencies
   ```
   npm install
   ```
1. Checkout commands below

## Cheatsheet

Test:
```
npx hardhat test
```

Test with coverage report:
```
npx hardhat coverage
```

Deploy:
```
npx hardhat run scripts/deploy.ts --network sepolia
```

Verify:
```
npx hardhat verify --network sepolia <address> <arguments passed to the constructor>
```

Spellcheck:
```
codespell
```

Slither:
```
slither .
```

## TODOs
- [x] Initial ERC20 contract: change supply to 8 billion years, define units (measured in seconds) [deployed contract](https://sepolia.etherscan.io/token/0x2c552c581b5c3cb21766e5f1b759713c0391b358#writeContract)

## Audit Readiness Checklists

### Project Specification Checklist

- [ ] Summarize what your project is intended to do and what features it has (e.g., token,
  staking). Include appropriate references, files, and documents (e.g., unit tests,
  requirements, specification, white paper).
- [ ] State any assumptions, design decisions, and non-standard practices. For example,
  indicate that there is a trusted owner or you trust external oracles.
- [ ] If the system is NOT intended to be completely trustless, document who the trusted
  actors are and what they should be trusted with. What are the expectations of parties?
  What are the actions that each party can perform?
- [ ] Document who the main users and stakeholders are. What kind of applications and
  users will be interacting with the project?
- [ ] List all outside libraries or resources that your project relies on. State any assumptions
  for the external contracts or configuration, e.g., “only integrating with ERC20 tokens
  without the callback functionality (no ERC777)”, or “only integrating with ERC20 tokens
  with 18 decimals”.

### General Code Checklist

- [x] Use the latest major compiler version.
- [x] Use established and well-tested libraries whenever possible (e.g., OpenZeppelin for
  Solidity smart contracts) to avoid code clones.
- [x] Ensure that the code compiles without any warnings and errors. Provide the exact
  instructions for building the project and include any implicit dependencies and their
  versions (e.g., the npm version).
- [x] Document all functions inline. Use NatSpec documentation for public and external
  functions.
- [x] Ensure that both code and documentation are in English.
- [x] Run the code through a spellchecker.
- [x] Follow the Checks-Effects-Interactions pattern (possibly with a combination of
  reentrancy guards) to avoid reentrancies. Treat all asset transfers as “interactions”.
- [x] Run a static analyzer (e.g., Slither for Solidity) and review its output. Although these
  tools often raise flags for non-issues, they can sometimes catch a low-hanging fruit (e.g.,
  ignored return value).
- [ ] Ask a friend, an experienced code reviewer, (preferably external to your project) to sanity
  check your code and to get an early feedback.

### Solidity-specific Checklist

- [x] Any public function that can be made external should be made external. This is
  both to save the gas and to reduce the possibility of bugs since external functions cannot
  be accessed internally.
- [x] Avoid using assembly code unless absolutely necessary. The use of assembly increases
  audit times as it removes Solidity's guardrails and must be checked much more carefully.
- [x] Document the use of unchecked. Describe why it is safe to skip arithmetic checks on
  each code block. Preferably for each operation.

### Test Checklist

- [x] Ensure that the code comes with an extensive test suite. Tests help to express your
intent and to assure code quality.
- [x] Provide step-by-step instructions for running the test suite. Include any necessary
  information related to the setup and environment.
- [x] Have tests for all "happy path" user stories. All tests should be passing.
- [x] Test access controls and paths for all the roles, such as owners and non-owners.
- [x] Write negative tests. E.g., if users should NOT be able to withdraw within 100 blocks of
  depositing, then write a test where a user tries to withdraw early and make sure the
  user's attempt fails.
- [x] Measure test coverage (e.g., with solidity-coverage for Solidity). A good rule of thumb is
  to ensure at least 80% coverage in each category (statements, functions, branches).
  Note, however, that optimizing for 100% coverage does not automatically imply a high
  quality test suite.
- [x] If you rely on external protocols, implement tests with a mainnet fork so that the
integration points are tested.

### Audit Scoping Checklist

- [ ] Identify the target date of audit completion and any reasons for such timing (e.g.,
  commitment to investors).
- [x] Provide the location of your source code (e.g., GitHub) with the commit hash to be
  audited and make sure they are accessible to the auditors.
- [ ] Indicate if the code is currently deemed production-ready by the company. Have all
  previous reviews been considered and fixes implemented?
- [ ] Indicate if you need the finalized audit report to be released under your company name,
  subject to confidentiality terms, or any other special requirements.
