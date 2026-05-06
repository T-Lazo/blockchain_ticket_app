// Handles wallet creation using Web3.js.
// Generates a new Ethereum keypair, encrypts the private key
// with a user-provided password to produce a keystore file,
// and allows the user to download it securely.

function createWallet() {
    const password = document.getElementById("password").value;

    if (!password) {
        setStatus("Please enter a password to encrypt your wallet.", "error");
        return;
    }

    // Generate a new Ethereum account (public/private keypair)
    const wallet = web3ReadOnly.eth.accounts.create();

    // Encrypt the private key with the user's password
    // This produces a keystore object (V3 standard) safe to store
    const keystore = web3ReadOnly.eth.accounts.encrypt(wallet.privateKey, password);

    document.getElementById("walletAddress").value = wallet.address;
    document.getElementById("privateKey").value = wallet.privateKey;
    document.getElementById("keystore").value = JSON.stringify(keystore, null, 2);
    document.getElementById("walletDetails").style.display = "block";

    setStatus("Wallet created successfully! Download your keystore and keep it safe.", "success");
}

function downloadKeystore() {
    const keystore = document.getElementById("keystore").value;
    if (!keystore) {
        setStatus("No keystore to download. Create a wallet first.", "error");
        return;
    }

    // Create a downloadable JSON file from the keystore string
    const blob = new Blob([keystore], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "keystore.json";
    a.click();
    URL.revokeObjectURL(url);
}

// Shared helper used by all pages to display status messages
function setStatus(message, type) {
    const el = document.getElementById("status");
    if (!el) return;
    el.textContent = message;
    el.className = type;
}
