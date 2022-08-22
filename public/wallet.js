/** @format */
import { abi } from "/abi.js";
import { config } from "/config.js";
import { landsIdToCoord } from "./landsIdToCoord.js";
import { save } from "./api.js";
const Web3Modal = window.Web3Modal.default;

Notiflix.Notify.init({
  position: "right-top",
});

let web3, provider, selectedAccount, accountData, contract;
let supplyInterval, supplyElement;

const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider.default,
  },
};

const web3Modal = new Web3Modal({
  network: "ethereum", // optional
  cacheProvider: false, // optional
  providerOptions,
  disableInjectedProvider: false,
});

let getAccountData = async () => {
  const chainId = await web3.eth.getChainId();
  const chainData = evmChains.getChain(chainId);
  const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];
  const bal = await web3.eth.getBalance(selectedAccount);
  const eth_bal = web3.utils.fromWei(bal, "ether");
  const human_bal = parseFloat(eth_bal).toFixed(4);
  return {
    account: selectedAccount,
    balance: bal,
    eth_balance: eth_bal,
    human_balance: human_bal,
    chain_id: chainId,
  };
};

let verifySetup = async () => {
  if (accountData.chain_id != config.requirements.chain_id) {
    Notiflix.Notify.failure("Wrong Chain ID! Switch to Ethereum Mainnet.");
  }
};

let total_amt;
let getTotalSupplyInterval = async () => {
  if (!contract) return;
  let res;
  try {
    res = await contract.methods.totalSupply().call();
  } catch (e) {
    return;
  }
  if (res) {
    console.log("total supply", res);
    if (supplyElement) {
      if (total_amt) {
        supplyElement.innerText = `${res} / 10000 Minted`;
      } else {
        supplyElement.innerText = `${res} Minted`;
      }
    }
  }
};

let connectWallet = async () => {
  try {
    provider = await web3Modal.connect();
    web3 = new Web3(provider);
    contract = new web3.eth.Contract(abi, config.contract.contract_address);
    getTotalSupplyInterval();
    supplyInterval = setInterval(getTotalSupplyInterval, 10000);
  } catch (e) {
    console.log(e);
    if (e) Notiflix.Notify.failure(e);
    return;
  }
  accountData = await getAccountData();
  await verifySetup();
  window.accountData = accountData;
  provider.on("accountsChanged", async (accounts) => {
    if (accounts.length == 0) return;
    accountData = await getAccountData();
    await verifySetup();
    console.log(accountData);
  });
  provider.on("chainChanged", async (accounts) => {
    if (accounts.length == 0) return;
    accountData = await getAccountData();
    await verifySetup();
    console.log(accountData);
  });
  Notiflix.Notify.success("Connected Wallet");
  window.location.replace("/client");
};

const contractAddress = "0xAddressOfNFTContract";

const initialize = () => {
  const connectButton = document.getElementById("connect-button");

  const isMetaMaskInstalled = () => {
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
  };

  const MetaMaskClientCheck = async () => {
    if (!isMetaMaskInstalled()) {
      connectButton.innerText = "Install Metamask to claim lands.";
      connectButton.disabled = true;
    } else {
      // let accounts = await ethereum.request({ method: "eth_accounts" });
      // if (accounts.length != 0) {
      //   connectButton.innerText = "Connected";
      //   connectButton.disabled = false;
      // } else {
      // connectButton.innerText = "Connect";
      connectButton.onclick = connectWallet;
      connectButton.disabled = false;
      // }
    }
  };
  MetaMaskClientCheck();
};

export async function verifyWalletConnection() {
  try {
    provider = await web3Modal.connect();
    web3 = new Web3(provider);
    contract = new web3.eth.Contract(abi, config.contract.contract_address);
    getTotalSupplyInterval();
    supplyInterval = setInterval(getTotalSupplyInterval, 10000);
  } catch (e) {
    console.log(e);
    if (e) Notiflix.Notify.failure(e);
    return;
  }
  accountData = await getAccountData();
  await verifySetup();
  window.accountData = accountData;
  provider.on("accountsChanged", async (accounts) => {
    if (accounts.length == 0) return;
    accountData = await getAccountData();
    await verifySetup();
    console.log(accountData);
  });
  provider.on("chainChanged", async (accounts) => {
    if (accounts.length == 0) return;
    accountData = await getAccountData();
    await verifySetup();
    console.log(accountData);
  });
  Notiflix.Notify.success("Wallet verified");
  return accountData;
}

async function getNFTs(address) {
  const res = await fetch(`/api/getNFTs?address=${address}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json; charset=utf-8;",
    },
  });

  let data = await res.json();

  if (data.success) {
    let lands = [];
    const nfts = data.data.result;
    nfts.map((landOwned) => {
      lands.push(landsIdToCoord[landOwned.token_id].split(","));
    });
    return lands;
  } else {
    console.log("Moralis error");
  }
}

let getIsMintActive = async () => {
  if (!contract) return;
  let res;
  try {
    res = await contract.methods.paused().call();
    return res;
  } catch (e) {
    console.log(e);
  }
};

export let mint = async (element, landOwned, amt_element) => {
  element.addEventListener("click", async () => {
    let isMintActive = await getIsMintActive();
    let price;
    if (isMintActive) {
      //console.log(isMintActive)
      Notiflix.Notify.failure("Mint is not active yet!");
      return;
    } else {
      if (landOwned.token_id <= 9210) {
        price = config.contract.one_mint_price;
      } else if (landOwned.token_id <= 9238) {
        price = config.contract.six_mint_price;
      } else if (landOwned.token_id <= 9252) {
        price = config.contract.twelve_mint_price;
      } else {
        price = config.contract.twentyfour_mint_price;
      }
      await contract.methods[config.contract.mint_function](
        accountData.account,
        landOwned.token_id
      )
        .send({
          from: accountData.account,
          value: price,
        })
        .on("transactionHash", (hash) => {
          Notiflix.Notify.success("Transaction Sent!");
        })
        .on("confirmation", async (receipt) => {
          console.log("confirmed !!");
          await contract.methods
            .ownerOf(landOwned.token_id)
            .call()
            .then((res) => {
              console.log("that's res:", res);
              save(landOwned.coordinates).then(() => {
                Notiflix.Notify.success(
                  "Transaction Confirmed! Check your OpenSea profile!"
                );
                window.location.reload();
              });
            })
            .catch((e) => {
              console.log(e);
            });
        })
        .on("error", (error, receipt) => {
          Notiflix.Notify.failure(error.message);
        });
    }
  });
};

export async function verifyWalletLands() {
  let landsById;
  let lands;

  try {
    provider = await web3Modal.connect();
    web3 = new Web3(provider);
    contract = new web3.eth.Contract(abi, config.contract.contract_address);
    getTotalSupplyInterval();
    supplyInterval = setInterval(getTotalSupplyInterval, 10000);
  } catch (e) {
    console.log(e);
    if (e) Notiflix.Notify.failure(e);
    return;
  }
  accountData = await getAccountData();

  // const landsCount = await contract.methods
  //   .balanceOf(accountData.account)
  //   .call();
  // console.log(landsCount);

  await verifySetup();
  window.accountData = accountData;

  provider.on("accountsChanged", async (accounts) => {
    if (accounts.length == 0) return;
    accountData = await getAccountData();
    await verifySetup();
    console.log(accountData);
  });
  provider.on("chainChanged", async (accounts) => {
    if (accounts.length == 0) return;
    accountData = await getAccountData();
    await verifySetup();
    console.log(accountData);
  });

  Notiflix.Notify.success("Wallet verified");
  lands = await getNFTs(accountData.account);

  return { accountData, lands };
}

initialize();
