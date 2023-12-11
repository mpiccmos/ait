# Solidity API

## Treasury

_A treasury for holding private investors' allocation behind a timelock,
the lock lasts for 366 days after deployment._

### ait

```solidity
address ait
```

### constructor

```solidity
constructor(address beneficiaryAddress, address aITimeCoinAddress) public payable
```

_Use as timelock by setting duration to 0_

### releasableAIT

```solidity
function releasableAIT() public view returns (uint256)
```

_Convenient function to check vested AIT_

### releaseAIT

```solidity
function releaseAIT() public
```

_Convenient function to release vested AIT_

