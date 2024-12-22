// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DonationContract {
    ERC20 public token;

    struct Donation {
        string description;
        address recipient;
        uint256 totalDonations;
    }

    Donation[] public donations;

    event DonationCreated(uint256 indexed donationId, string description, address indexed recipient);
    event Donated(uint256 indexed donationId, address indexed donor, uint256 amount);

    constructor(address _token) {
        token = ERC20(_token);
    }

    function createDonation(string memory description, address recipient) public {
        require(recipient != address(0), "Recipient address cannot be zero");
        donations.push(Donation({description: description, recipient: recipient, totalDonations: 0}));
        emit DonationCreated(donations.length - 1, description, recipient);
    }

function donate(uint256 donationId, uint256 amount) public {
    require(donationId < donations.length, "Invalid donation ID");
    require(amount > 0, "Donation amount must be greater than zero");

    Donation storage donation = donations[donationId];

    // Проверка баланса пользователя перед донатом (дополнительно)
    require(token.balanceOf(msg.sender) >= amount, "Insufficient token balance");

    // Обновляем пожертвование
    donation.totalDonations += amount;

    emit Donated(donationId, msg.sender, amount);
}



    function getDonationsCount() public view returns (uint256) {
        return donations.length;
    }
}
