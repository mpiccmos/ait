// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract AITimeCoin is Initializable, ERC20CappedUpgradeable, PausableUpgradeable, OwnableUpgradeable {

    uint256 private constant _secondsInMinute  = 60;
    uint256 private constant _minutesInHour    = 60;
    uint256 private constant _hoursInDay       = 24;
    uint256 private constant _daysInYear       = 365;
    uint256 private constant _yearsInDecade    = 10;
    uint256 private constant _decadesInCentury = 10;

    uint256 public annualRoundsCap;
    uint256 public annualCap;
    uint256 private _annualBaseCap;
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

    /**
    * @dev Emitted when tokenURI is set.
    */
    event TokenURIUpdated(string uri);

    /**
    * @dev Emitted when ETH is withdrawn from the contract.
    */
    event ETHWithdrawn(address recipient, uint256 withdraw_amount);

    /**
    * @dev Emitted when annual issuance records are updated.
    */
    event AnnualIssuanceRecordsUpdated(
        uint256 minted_this_year, uint256 rounds_this_year, uint256 cap_left_this_year);

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
    * @dev Check whether a new year has started
    */
    function _newYearStarted() private view returns (bool) {
        uint256 new_year = _getThisYear();
        return (new_year > _thisYear);
    }

    /**
    * @dev Update annual issuance records. We record every mint instead of overriding cap()
    * because the latter allows minting more by burning some.
    */
    function _updateAnnualIssuanceRecords(uint256 amount) private {
        if (_newYearStarted()) {
            uint256 new_year = _getThisYear();
            annualCap += _annualBaseCap * (new_year - _thisYear);  // rollover previous years' unused cap
            annualCap -= _mintedThisYear;
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
        emit AnnualIssuanceRecordsUpdated(_mintedThisYear, _roundsThisYear, annualCap);
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
    * @dev Supply capped at the number of sections in 99 years times 25, to be
    * issued over no less than 99 years.
    */
    function initialize() public initializer {
        __ERC20_init("AI Time Coin", "AIT");
        __ERC20Capped_init(fromYears(99) * 25 * 10**decimals());
        __Pausable_init();
        __Ownable_init();
        annualRoundsCap = 4;
        _annualBaseCap = fromYears(1) * 25 * 10**decimals();
        annualCap = _annualBaseCap;
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
        emit TokenURIUpdated(_tokenURI);
    }

    /**
    * @dev How many mintable seconds left this year.
    * @return the max amount of mintable AIT for the current year.
    */
    function getAnnualMintQuota() external view returns (uint256) {
        uint256 left = annualCap - _mintedThisYear;
        if (_newYearStarted()) {
            // accounts for the case where the records are outdated for multiple years
            left += _annualBaseCap * (_getThisYear() - _thisYear);
        }
        return (left <= cap()) ? left : cap();
    }

    /**
    * @dev How many rounds of minting left this year.
    * @return the max number of rounds of minting left for the current year.
    */
    function getAnnualRoundsQuota() external view returns (uint256) {
        if (_newYearStarted()) {
            return annualRoundsCap;
        }
        else {
            return annualRoundsCap - _roundsThisYear;
        }
    }

    /**
    * @dev The owner has the sole authority to mint.
    * @param amount The mint amount
    */
    function mint(uint256 amount) external onlyOwner {
        require(amount > 0, "Mind amount should be positive");
        _updateAnnualIssuanceRecords(amount);
        _mint(msg.sender, amount);
    }

    /**
    * @dev The owner has the authority to pause all mint and transfers for, e.g.,
    * legal and regulatory compliance reasons.
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
    * @param recipient Address to withdraw to
    * @param amount Amount of ether to withdraw
    */
    function withdraw(address payable recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Recipient address should not be a zero address");
        require(amount > 0, "Withdraw amount should be positive");
        (bool succeed, ) = recipient.call{value: amount}("");
        require(succeed, "Failed to withdraw Ether");
        emit ETHWithdrawn(recipient, amount);
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
