# Solidity API

## AITimeCoin

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

### TokenURIUpdated

```solidity
event TokenURIUpdated(string uri)
```

_Emitted when tokenURI is set._

### ETHWithdrawn

```solidity
event ETHWithdrawn(address recipient, uint256 withdraw_amount)
```

_Emitted when ETH is withdrawn from the contract._

### AnnualIssuanceRecordsUpdated

```solidity
event AnnualIssuanceRecordsUpdated(uint256 minted_this_year, uint256 rounds_this_year, uint256 cap_left_this_year)
```

_Emitted when annual issuance records are updated._

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

_Supply capped at the number of sections in 99 years times 25, to be
issued over no less than 99 years._

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

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | the max amount of mintable AIT for the current year. |

### getAnnualRoundsQuota

```solidity
function getAnnualRoundsQuota() external view returns (uint256)
```

_How many rounds of minting left this year._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | the max number of rounds of minting left for the current year. |

### mint

```solidity
function mint(uint256 amount) external
```

_The owner has the sole authority to mint._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The mint amount |

### pause

```solidity
function pause() external
```

_The owner has the authority to pause all mint and transfers for, e.g.,
legal and regulatory compliance reasons._

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

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address payable | Address to withdraw to |
| amount | uint256 | Amount of ether to withdraw |

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

