// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract AITimeToken is Initializable, ERC20CappedUpgradeable, PausableUpgradeable, OwnableUpgradeable {

    uint256 private constant _secondsInMinute  = 60;
    uint256 private constant _minutesInHour    = 60;
    uint256 private constant _hoursInDay       = 24;
    uint256 private constant _daysInYear       = 365;
    uint256 private constant _yearsInDecade    = 10;
    uint256 private constant _decadesInCentury = 10;

    uint256 public annualRoundsCap;
    uint256 public annualCap;
    uint256 private _thisYear;
    uint256 private _mintedThisYear;
    uint256 private _roundsThisYear;

    string private _tokenURI;

    /**
    * @dev Trying to mint over this year's annual issuance cap.
    */
    error ERC20ExceededAnnualCap(uint256 amount, uint256 mintedThisYear, uint256 annualCap);
    error ERC20ExceededAnnualRoundsCap(uint256 amount, uint256 rounds);

    /**
    * @dev Emitted when a new financial year starts, resetting annual issuance cap.
    */
    event NewYearStarted(uint256 year, uint256 cap);

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Private methods

    /**
    * @dev Get current year. Note that the conversion rate is different from
    * `_secondsInMinute * _minutesInHour * _hoursInDay * _daysInYear` because we use 365.25 days
    * in a year for this conversion.
    */
    function _getThisYear() private view returns (uint256) {
        return (block.timestamp / 31557600) + 1970;
    }

    /**
    * @dev Update annual issuance records. We record every mint instead of overriding cap()
    * because the latter allows minting more by burning some.
    */
    function _updateAnnualIssuanceRecords(uint256 amount) private {
        uint256 new_year = _getThisYear();
        if (new_year > _thisYear) {
            _thisYear = new_year;
            _mintedThisYear = 0;
            _roundsThisYear = 0;
            emit NewYearStarted(new_year, annualCap);
        }
        if (amount + _mintedThisYear > annualCap) {
            revert ERC20ExceededAnnualCap(amount, _mintedThisYear, annualCap);
        }
        if (1 + _roundsThisYear > annualRoundsCap) {
            revert ERC20ExceededAnnualRoundsCap(amount, _roundsThisYear);
        }
        _mintedThisYear += amount;
        _roundsThisYear += 1;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal whenNotPaused override {
        super._beforeTokenTransfer(from, to, amount);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Public & external methods

    /**
    * @dev Functions to convert seconds to/from other units, non-integral parts are discarded
    */
    function fromMinutes(uint256 amount) public pure returns (uint256) {
        return amount * _secondsInMinute;
    }

    function toMinutes(uint256 amount) public pure returns (uint256) {
        return amount / _secondsInMinute;
    }

    function fromHours(uint256 amount) public pure returns (uint256) {
        return amount * (_secondsInMinute * _minutesInHour);
    }

    function toHours(uint256 amount) public pure returns (uint256) {
        return amount / (_secondsInMinute * _minutesInHour);
    }

    function fromDays(uint256 amount) public pure returns (uint256) {
        return amount * (_secondsInMinute * _minutesInHour * _hoursInDay);
    }

    function toDays(uint256 amount) public pure returns (uint256) {
        return amount / (_secondsInMinute * _minutesInHour * _hoursInDay);
    }

    function fromYears(uint256 amount) public pure returns (uint256) {
        return amount * (_secondsInMinute * _minutesInHour * _hoursInDay * _daysInYear);
    }

    function toYears(uint256 amount) public pure returns (uint256) {
        return amount / (_secondsInMinute * _minutesInHour * _hoursInDay * _daysInYear);
    }

    function fromDecades(uint256 amount) public pure returns (uint256) {
        return amount * (_secondsInMinute * _minutesInHour * _hoursInDay * _daysInYear * _yearsInDecade);
    }

    function toDecades(uint256 amount) public pure returns (uint256) {
        return amount / (_secondsInMinute * _minutesInHour * _hoursInDay * _daysInYear * _yearsInDecade);
    }

    function fromCenturies(uint256 amount) public pure returns (uint256) {
        return amount * (_secondsInMinute * _minutesInHour * _hoursInDay * _daysInYear * _yearsInDecade * _decadesInCentury);
    }

    function toCenturies(uint256 amount) public pure returns (uint256) {
        return amount / (_secondsInMinute * _minutesInHour * _hoursInDay * _daysInYear * _yearsInDecade * _decadesInCentury);
    }

    /**
    * @custom:oz-upgrades-unsafe-allow constructor
    */
    constructor() {
        _disableInitializers();
    }

    /**
    * @dev Supply capped at 800 billion people-years: 8 billion people * 100 years
    */
    function initialize() public initializer {
        __ERC20_init("AI Time Token", "AIT");
        __ERC20Capped_init(fromYears(100) * 80 * 10**decimals());
        __Pausable_init();
        __Ownable_init();
        annualCap = fromYears(1) * 80 * 10**decimals();
        annualRoundsCap = 4;
        _thisYear = _getThisYear();
        _mintedThisYear = 0;
    }

    /**
    * @dev decimals 
    */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    /**
    * @dev ERC-1046's ERC-20 Token Metadata Schema.
    */
    function tokenURI() external view returns (string memory) {
        return _tokenURI;
    }

    /**
    * @dev Update metadata (ERC-1046 for cosmetics). The resolved data MUST be
    * in JSON format and support ERC-1046's ERC-20 Token Metadata Schema.
    */
    function setTokenURI(string memory uri) external onlyOwner {
        _tokenURI = uri;
    }

    /**
    * @dev How many mintable seconds left this year.
    */
    function getAnnualMintQuota() external view returns (uint256) {
        uint256 left = annualCap - _mintedThisYear;
        return (left <= cap()) ? left : cap();
    }

    /**
    * @dev How many rounds of minting left this year.
    */
    function getAnnualRoundsQuota() external view returns (uint256) {
        return annualRoundsCap - _roundsThisYear;
    }

    /**
    * @dev Besides
    * mint logic is TBD
    */
    function mint(uint256 amount) external onlyOwner whenNotPaused {
        _updateAnnualIssuanceRecords(amount);
        _mint(msg.sender, amount);
    }

    /**
    * @dev Function to pause all mint and transfers
    */
    function pause() external onlyOwner {
        _pause();
    }

    /**
    * @dev Function to unpause
    */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
    * @dev Function to withdraw ether
    */
    function withdraw(address payable recipient, uint256 amount) external onlyOwner {
        (bool succeed, ) = recipient.call{value: amount}("");
        require(succeed, "Failed to withdraw Ether");
    }

    /**
    * @dev Function to receive Ether. msg.data must be empty
    */
    receive() external payable {}

    /**
    * @dev Fallback function is called when msg.data is not empty
    */
    fallback() external payable {}
}
