// Handles MetaMask wallet connection and ticket purchase.
// Connects to the user's MetaMask account and calls the
// payable buyTicket() function on the smart contract,
// sending the exact ticket price in SETH.

let userAccount = null;

async function connectWallet() {
    // Check MetaMask is installed
    if (typeof window.ethereum === "undefined") {
        setStatus("MetaMask not detected. Please install MetaMask to continue.", "error");
        return;
    }

    try {
        // Request account access from MetaMask
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        });
        userAccount = accounts[0];

        document.getElementById("connectedAccount").textContent =
            "Connected: " + userAccount;

        setStatus("Wallet connected successfully!", "success");

        // Load token balance after connecting
        await getAttendeeBalance();

    } catch (err) {
        if (err.code === 4001) {
            // User rejected the connection request
            setStatus("Connection rejected. Please approve MetaMask to continue.", "error");
        } else {
            setStatus("Failed to connect wallet: " + err.message, "error");
        }
    }
}


// handles the full buy flow - pending, confirmed, rejected etc
// sepolia takes like 12 seconds per block
// also separating metamask rejection from a contract revert because
// spent way too long showing raw errors to the user before fixing this
async function buyTicket() {
    if (!userAccount) {
        setStatus("Please connect MetaMask before buying a ticket.", "error");
        return;
    }

    try {
        // Use MetaMask's provider for transactions (not read-only)
        const web3mm = new Web3(window.ethereum);
        const contract = new web3mm.eth.Contract(ABI, CONTRACT_ADDRESS);

        // Fetch the ticket price from the contract
        const price = await contract.methods.ticketPrice().call();

        setStatus("Confirm the transaction in MetaMask...", "");

        // Send transaction with exact ticket price as value
        await contract.methods.buyTicket().send({
            from: userAccount,
            value: price
        });

        setStatus("Ticket purchased successfully!", "success");
        await getAttendeeBalance();

    } catch (err) {
        if (err.code === 4001) {
            setStatus("Transaction cancelled by user.", "error");
        } else if (err.message.includes("Incorrect ETH amount")) {
            setStatus("Payment amount is incorrect. Please try again.", "error");
        } else if (err.message.includes("No tickets left")) {
            setStatus("Sorry, no tickets remaining.", "error");
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

function setStatus(message, type) {
    const el = document.getElementById("status");
    if (!el) return;
    el.textContent = message;
    el.className = type;
}