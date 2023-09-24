# Solidity API

## AITimeToken

### annualRoundsCap

```solidity
uint256 annualRoundsCap
```

### annualCap

```solidity
uint256 annualCap
```

### ERC20ExceededAnnualCap

```solidity
error ERC20ExceededAnnualCap(uint256 amount, uint256 mintedThisYear, uint256 annualCap)
```

_Trying to mint over this year's annual issuance cap._

### ERC20ExceededAnnualRoundsCap

```solidity
error ERC20ExceededAnnualRoundsCap(uint256 amount, uint256 rounds)
```

### NewYearStarted

```solidity
event NewYearStarted(uint256 year, uint256 cap)
```

_Emitted when a new financial year starts, resetting annual issuance cap._

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 amount) internal
```

_Hook that is called before any transfer of tokens. This includes
minting and burning.

Calling conditions:

- when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
will be transferred to `to`.
- when `from` is zero, `amount` tokens will be minted for `to`.
- when `to` is zero, `amount` of ``from``'s tokens will be burned.
- `from` and `to` are never both zero.

To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

### fromMinutes

```solidity
function fromMinutes(uint256 amount) public pure returns (uint256)
```

_Functions to convert seconds to/from other units, non-integral parts are discarded_

### toMinutes

```solidity
function toMinutes(uint256 amount) public pure returns (uint256)
```

### fromHours

```solidity
function fromHours(uint256 amount) public pure returns (uint256)
```

### toHours

```solidity
function toHours(uint256 amount) public pure returns (uint256)
```

### fromDays

```solidity
function fromDays(uint256 amount) public pure returns (uint256)
```

### toDays

```solidity
function toDays(uint256 amount) public pure returns (uint256)
```

### fromYears

```solidity
function fromYears(uint256 amount) public pure returns (uint256)
```

### toYears

```solidity
function toYears(uint256 amount) public pure returns (uint256)
```

### fromDecades

```solidity
function fromDecades(uint256 amount) public pure returns (uint256)
```

### toDecades

```solidity
function toDecades(uint256 amount) public pure returns (uint256)
```

### fromCenturies

```solidity
function fromCenturies(uint256 amount) public pure returns (uint256)
```

### toCenturies

```solidity
function toCenturies(uint256 amount) public pure returns (uint256)
```

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize() public
```

_Supply capped at 800 billion people-years: 8 billion people * 100 years_

### decimals

```solidity
function decimals() public view virtual returns (uint8)
```

_decimals_

### tokenURI

```solidity
function tokenURI() external view returns (string)
```

_ERC-1046's ERC-20 Token Metadata Schema._

### setTokenURI

```solidity
function setTokenURI(string uri) external
```

_Update metadata (ERC-1046 for cosmetics). The resolved data MUST be
in JSON format and support ERC-1046's ERC-20 Token Metadata Schema._

### getAnnualMintQuota

```solidity
function getAnnualMintQuota() external view returns (uint256)
```

_How many mintable seconds left this year._

### getAnnualRoundsQuota

```solidity
function getAnnualRoundsQuota() external view returns (uint256)
```

_How many rounds of minting left this year._

### mint

```solidity
function mint(uint256 amount) external
```

_Besides
mint logic is TBD_

### pause

```solidity
function pause() external
```

_Function to pause all mint and transfers_

### unpause

```solidity
function unpause() external
```

_Function to unpause_

### withdraw

```solidity
function withdraw(address payable recipient, uint256 amount) external
```

_Function to withdraw ether_

### receive

```solidity
receive() external payable
```

_Function to receive Ether. msg.data must be empty_

### fallback

```solidity
fallback() external payable
```

_Fallback function is called when msg.data is not empty_

