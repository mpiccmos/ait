// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/finance/VestingWallet.sol";

/**
 * @dev A treasury for holding private investors' allocation behind a timelock,
 * the lock lasts for 366 days after deployment.
 */
contract Treasury is VestingWallet {
    address immutable ait;

    /**
     * @dev Use as timelock by setting duration to 0
     */
    constructor(address beneficiaryAddress, address aITimeCoinAddress) VestingWallet(
        beneficiaryAddress, uint64(block.timestamp + (366 days)), uint64(0)) payable {
        require(beneficiaryAddress != address(0), "Beneficiary address should not be a zero address");
        require(aITimeCoinAddress != address(0), "AIT address should not be a zero address");
        ait = aITimeCoinAddress;
    }

    /**
     * @dev Convenient function to check vested AIT
     */
    function releasableAIT() public view returns (uint256) {
        return releasable(ait);
    }

    /**
     * @dev Convenient function to release vested AIT
     */
    function releaseAIT() public {
        release(ait);
    }
}
