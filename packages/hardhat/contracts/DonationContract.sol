// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DonationContract is Ownable {
    IERC20 public token;

    event DonationReceived(address indexed donor, address indexed recipient, uint256 amount);

    constructor(address _token, address initialOwner) Ownable(initialOwner) {
        token = IERC20(_token);
    }

    /**
     * @dev Функция для пожертвования токенов.
     * @param _recipient Адрес получателя пожертвования.
     * @param _amount Количество пожертвованных токенов (в минимальных единицах).
     */
    function donate(address _recipient, uint256 _amount) external {
        require(_recipient != address(0), "Invalid recipient address");
        require(_amount > 0, "Donation amount must be greater than zero");

        // Перевод токенов от отправителя к получателю
        bool success = token.transferFrom(msg.sender, _recipient, _amount);
        require(success, "Token transfer failed");

        emit DonationReceived(msg.sender, _recipient, _amount);
    }

    /**
     * @dev Функция для обновления адреса токена, если необходимо.
     * Только владелец может вызвать эту функцию.
     * @param _newToken Новый адрес ERC20 токена.
     */
    function setToken(address _newToken) external onlyOwner {
        require(_newToken != address(0), "Invalid token address");
        token = IERC20(_newToken);
    }
}
