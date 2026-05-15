// balance checking - 3 separate functions instead of one big one
// doorman doesnt need metamask connected (just checks any address),
// attendee does need metamask, venue needs contract address specifically
// tried combining them at first and it got messy fast, easier to just
// keep them split so each one is doing exactly one thing

async function checkAttendeeBalance() {
    const address = document.getElementById("attendeeAddress").value.trim();

    if (!address) {
        setStatus("Please enter a wallet address.", "error");
        return;
    }

    if (!web3ReadOnly.utils.isAddress(address)) {
        setStatus("Invalid Ethereum address. Please check and try again.", "error");
        return;
    }

    try {
        const contract = new web3ReadOnly.eth.Contract(ABI, CONTRACT_ADDRESS);
        const balance = await contract.methods.balanceOf(address).call();
        const tokens = balance / 1e18;

        document.getElementById("attendeeResult").textContent =
            "Ticket balance: " + tokens + " TKT";

    } catch (err) {
        setStatus("Failed to check balance: " + err.message, "error");
    }
}

// Doorman uses this to verify if a wallet holds a valid ticket
async function checkDoormanBalance() {
    const address = document.getElementById("doormanAddress").value.trim();

    if (!address) {
        setStatus("Please enter the attendee's wallet address.", "error");
        return;
    }

    if (!web3ReadOnly.utils.isAddress(address)) {
        setStatus("Invalid Ethereum address. Please check and try again.", "error");
        return;
    }

    try {
        const contract = new web3ReadOnly.eth.Contract(ABI, CONTRACT_ADDRESS);
        const balance = await contract.methods.balanceOf(address).call();
        const hasTicket = balance >= 1e18;

        const resultEl = document.getElementById("doormanResult");
        if (hasTicket) {
            resultEl.textContent = "✅ Valid ticket — entry permitted.";
            resultEl.className = "success";
        } else {
            resultEl.textContent = "❌ No ticket found — entry denied.";
            resultEl.className = "error";
        }

    } catch (err) {
        setStatus("Failed to verify ticket: " + err.message, "error");
    }
}

// Venue uses this to check total supply and SETH collected
async function checkVenueStats() {
    try {
        const contract = new web3ReadOnly.eth.Contract(ABI, CONTRACT_ADDRESS);

        // Total tickets ever minted
        const totalSupply = await contract.methods.totalSupply().call();
        const totalTokens = totalSupply / 1e18;

        // Tickets remaining with the owner (unsold)
        const ownerBalance = await contract.methods.balanceOf(
            await contract.methods.owner().call()
        ).call();
        const unsold = ownerBalance / 1e18;
        const sold = totalTokens - unsold;

        // SETH collected by the contract
        const sethBalance = await web3ReadOnly.eth.getBalance(CONTRACT_ADDRESS);
        const seth = web3ReadOnly.utils.fromWei(sethBalance, "ether");

        document.getElementById("totalSupply").textContent =
            "Total ticket supply: " + totalTokens;
        document.getElementById("ticketsSold").textContent =
            "Tickets sold: " + sold;
        document.getElementById("sethCollected").textContent =
            "SETH collected: " + seth + " SETH";

    } catch (err) {
        setStatus("Failed to load venue stats: " + err.message, "error");
    }
}

function setStatus(message, type) {
    const el = document.getElementById("status");
    if (!el) return;
    el.textContent = message;
    el.className = type;
}