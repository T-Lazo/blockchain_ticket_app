// Handles returning a ticket back to the venue/owner.
// Calls the returnTicket() function on the smart contract
// which transfers 1 TKT token from the attendee back to
// the contract owner (venue).

let userAccount = null;

async function connectWallet() {
    if (typeof window.ethereum === "undefined") {
        setStatus("MetaMask not detected. Please install MetaMask to continue.", "error");
        return;
    }

    try {
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        });
        userAccount = accounts[0];

        document.getElementById("connectedAccount").textContent =
            "Connected: " + userAccount;

        setStatus("Wallet connected successfully!", "success");
        await getAttendeeBalance();

    } catch (err) {
        if (err.code === 4001) {
            setStatus("Connection rejected. Please approve MetaMask to continue.", "error");
        } else {
            setStatus("Failed to connect wallet: " + err.message, "error");
        }
    }
}

async function returnTicket() {
    if (!userAccount) {
        setStatus("Please connect MetaMask before returning your ticket.", "error");
        return;
    }

    try {
        const web3mm = new Web3(window.ethereum);
        const contract = new web3mm.eth.Contract(ABI, CONTRACT_ADDRESS);

        // Check the user actually has a ticket before attempting
        const balance = await contract.methods.balanceOf(userAccount).call();
        if (balance < 1e18) {
            setStatus("You don't have a ticket to return.", "error");
            return;
        }

        setStatus("Confirm the transaction in MetaMask...", "");

        await contract.methods.returnTicket().send({ from: userAccount });

        setStatus("Ticket returned to venue successfully!", "success");
        await getAttendeeBalance();

    } catch (err) {
        if (err.code === 4001) {
            setStatus("Transaction cancelled by user.", "error");
        } else if (err.message.includes("You don't have a ticket")) {
            setStatus("You don't have a ticket to return.", "error");
        } else {
            setStatus("Transaction failed: " + err.message, "error");
        }
    }
}

async function getAttendeeBalance() {
    if (!userAccount) return;

    try {
        const web3mm = new Web3(window.ethereum);
        const contract = new web3mm.eth.Contract(ABI, CONTRACT_ADDRESS);
        const balance = await contract.methods.balanceOf(userAccount).call();
        const tokens = balance / 1e18;

        document.getElementById("tokenBalance").textContent =
            "Your ticket balance: " + tokens + " TKT";
    } catch (err) {
        console.error("Failed to fetch balance:", err);
    }
}