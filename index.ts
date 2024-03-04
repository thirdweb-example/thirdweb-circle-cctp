import { config } from "dotenv";
import { ThirdwebSDK, SmartContract } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
import { Networks } from "./const/chains";
config();

// Private key of the account that will be used to sign transactions
const privateKey = process.env.PRIVATE_KEY as string;
// Amount to transfer in USDC
const amountToTransfer = 0.1;
// Source chain and destination chain, options are "sepolia", "avalanche-fuji", "arbitrum-sepolia", "op-sepolia-testnet" and "base-sepolia-testnet".
const sourceChain = "avalanche-fuji";
const destinationChain = "sepolia";

const main = async () => {
  const sourceChainObject = Networks[sourceChain];
  const destinationChainObject = Networks[destinationChain];
  const sourceChainSDK = ThirdwebSDK.fromPrivateKey(privateKey, sourceChainObject.network, {
    secretKey: process.env.SECRET_KEY as string,
  });
  const destinationChainSdk = ThirdwebSDK.fromPrivateKey(privateKey, destinationChainObject.network, {
    secretKey: process.env.SECRET_KEY as string,
  });
  const destinationAddress = await destinationChainSdk.wallet.getAddress();

  console.log(
    "Transfering",
    amountToTransfer,
    "USDC from",
    sourceChainObject.name,
    "to",
    destinationChainObject.name
  );
  console.log("Wallet Address:", destinationAddress);

  // Testnet Contract Addresses
  const TOKEN_MESSENGER_CONTRACT_ADDRESS = sourceChainObject.tokenMessengerContract;
  const USDC_CONTRACT_ADDRESS = sourceChainObject.usdcContract;
  const MESSAGE_TRANSMITTER_CONTRACT_ADDRESS = destinationChainObject.messageTransmitterContract;
  const DESTINATION_DOMAIN = destinationChainObject.domain;

  // initialize contracts
  const ethTokenMessengerContract = await sourceChainSDK.getContract(
    TOKEN_MESSENGER_CONTRACT_ADDRESS
  );
  const usdcEthContract = await sourceChainSDK.getContract(
    USDC_CONTRACT_ADDRESS
  );
  const messageTransmitterContract =
    await destinationChainSdk.getContract(MESSAGE_TRANSMITTER_CONTRACT_ADDRESS);


  // AVAX destination address
  const destinationAddressInBytes32 = ethers.utils.defaultAbiCoder.encode(
    ["address"],
    [destinationAddress]
  );

  // Amount that will be transferred
  const amount = amountToTransfer * 10 ** 6;

  // STEP 1: Approve messenger contract to withdraw from our active eth address
  console.log(`Approving USDC transfer on ${sourceChainObject.name}...`);
  const approveMessengerWithdraw = await usdcEthContract.call("approve", [
    TOKEN_MESSENGER_CONTRACT_ADDRESS,
    amount,
  ]);
  console.log(
    "Approved - txHash:",
    approveMessengerWithdraw.receipt.transactionHash
  );

  // STEP 2: Burn USDC
  console.log(`Depositing USDC to Token Messenger contract on ${sourceChainObject.name}...`);
  const burnUSDC = await ethTokenMessengerContract.call("depositForBurn", [
    amount,
    DESTINATION_DOMAIN,
    destinationAddressInBytes32,
    USDC_CONTRACT_ADDRESS,
  ]);
  console.log("Deposited - txHash:", burnUSDC.receipt.transactionHash);

  // STEP 3: Retrieve message bytes from logs
  const transactionReceipt = burnUSDC.receipt;
  const eventTopic = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("MessageSent(bytes)")
  );
  const log = transactionReceipt.logs.find(
    (l: any) => l.topics[0] === eventTopic
  );
  const messageBytes = ethers.utils.defaultAbiCoder.decode(
    ["bytes"],
    log.data
  )[0];
  const messageHash = ethers.utils.keccak256(messageBytes);

  // STEP 4: Fetch attestation signature
  console.log("Fetching attestation signature...");
  let attestationResponse: AttestationResponse = { status: "pending" };
  while (attestationResponse.status !== "complete") {
    const response = await fetch(
      `https://iris-api-sandbox.circle.com/attestations/${messageHash}`
    );
    attestationResponse = await response.json();
    console.log("Attestation Status:", attestationResponse.status || "sent");
    await new Promise((r) => setTimeout(r, 2000));
  }

  const attestationSignature = attestationResponse.attestation;
  console.log(`Obtained Signature: ${attestationSignature}`);

  // STEP 5: Using the message bytes and signature recieve the funds on destination chain and address
  console.log(`Receiving funds on ${destinationChainObject.name}...`);
  const receiveTx = await messageTransmitterContract.call(
    "receiveMessage",
    [messageBytes, attestationSignature]
  );
  console.log(
    "Received funds successfully - txHash:",
    receiveTx.receipt.transactionHash
  );
};

interface AttestationResponse {
  status: string;
  attestation?: string;
}

// suppress warnings for this demo
console.warn = function () { };

main();
