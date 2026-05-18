// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TicketToken is ERC20 {
    address public owner;
    uint256 public ticketPrice;

    constructor(uint256 initialSupply, uint256 priceInWei) ERC20("TicketToken", "TKT") {
        owner = msg.sender;
        ticketPrice = priceInWei;
        _mint(msg.sender, initialSupply);
    }

    // Buy a ticket by sending SETH
    function buyTicket() external payable {
        require(msg.value == ticketPrice, "Incorrect ETH amount sent");
        require(balanceOf(owner) >= 1 * 10**18, "No tickets left");
        _transfer(owner, msg.sender, 1 * 10**18);
    }

    // Return a ticket back to the vendor
    function returnTicket() external {
        require(balanceOf(msg.sender) >= 1 * 10**18, "You don't have a ticket");
        _transfer(msg.sender, owner, 1 * 10**18);
    }

    // Withdraw SETH collected from ticket sales
    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }
}