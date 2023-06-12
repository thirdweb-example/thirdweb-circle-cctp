import { config } from "dotenv";
import { ThirdwebSDK, SmartContract } from "@thirdweb-dev/sdk";
import { AvalancheFuji } from "@thirdweb-dev/chains";
import { ethers } from "ethers";
config();

interface AttestationResponse {
  status: string;
  attestation?: string;
}

const main = async () => {
  const ethPrivateKey = process.env.ETH_PRIVATE_KEY as string;
  const avaxPrivateKey = process.env.AVAX_PRIVATE_KEY as string;
  const sdkETH = ThirdwebSDK.fromPrivateKey(ethPrivateKey, "goerli");
  const sdkAVAX = ThirdwebSDK.fromPrivateKey(avaxPrivateKey, "avalanche-fuji");


  // Testnet Contract Addresses
  const ETH_TOKEN_MESSENGER_CONTRACT_ADDRESS: string = "0xd0c3da58f55358142b8d3e06c1c30c5c6114efe8";
  const USDC_ETH_CONTRACT_ADDRESS: string = "0x07865c6e87b9f70255377e024ace6630c1eaa37f";
  const ETH_MESSAGE_CONTRACT_ADDRESS: string = "0x1a9695e9dbdb443f4b20e3e4ce87c8d963fda34f"
  const AVAX_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS: string = '0xa9fb1b3009dcb79e2fe346c16a604b8fa8ae0a79';

  // initialize contracts
  const ethTokenMessengerContract: SmartContract = await sdkETH.getContract(ETH_TOKEN_MESSENGER_CONTRACT_ADDRESS);
  const usdcEthContract: SmartContract = await sdkETH.getContract(USDC_ETH_CONTRACT_ADDRESS);
  const ethMessageContract: SmartContract = await sdkETH.getContract(ETH_MESSAGE_CONTRACT_ADDRESS);
  const avaxMessageTransmitterContract: SmartContract = await sdkAVAX.getContract(AVAX_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS);

  // AVAX destination address
  const mintRecipient = process.env.RECIPIENT_ADDRESS;
  const destinationAddressInBytes32 = await ethMessageContract.call("addressToBytes32", [mintRecipient]);
  const AVAX_DESTINATION_DOMAIN = 1;

  // Amount that will be transferred
  const amount = process.env.AMOUNT as string;

  // STEP 1: Approve messenger contract to withdraw from our active eth address
  const approveMessengerWithdraw = await usdcEthContract.call("approve", [ETH_TOKEN_MESSENGER_CONTRACT_ADDRESS, amount])
  console.log(approveMessengerWithdraw, 'approveMessengerWithdraw data');

  // STEP 2: Burn USDC
  const burnUSDC = await ethTokenMessengerContract.call("depositForBurn", [amount, AVAX_DESTINATION_DOMAIN, destinationAddressInBytes32, USDC_ETH_CONTRACT_ADDRESS]);
  console.log(burnUSDC, 'burnUSDC data');
  console.log(burnUSDC.receipt.logs, 'burnUSDC logs')
  // console.log(typeof (burnUSDC.receipt.logs), 'burnUSDC logs')

  // STEP 3: Retrieve message bytes from logs
  const transactionReceipt = burnUSDC.receipt;
  const eventTopic = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MessageSent(bytes)'));
  const log = transactionReceipt.logs.find((l: any) => l.topics[0] === eventTopic)
  const messageBytes = ethers.utils.defaultAbiCoder.decode(['bytes'], log.data)[0]
  const messageHash = ethers.utils.keccak256(messageBytes);

  console.log(`MessageBytes: ${messageBytes}`)
  console.log(`MessageHash: ${messageHash}`)

  // STEP 4: Fetch attestation signature
  let attestationResponse: AttestationResponse = { status: 'pending' };
  while (attestationResponse.status !== 'complete') {
    const response = await fetch(`https://iris-api-sandbox.circle.com/attestations/${messageHash}`);
    attestationResponse = await response.json()
    await new Promise(r => setTimeout(r, 2000));
  }

  const attestationSignature = attestationResponse.attestation;
  console.log(`Signature: ${attestationSignature}`)

  // STEP 5: Using the message bytes and signature recieve the funds on destination chain and address
  const receiveTx = await avaxMessageTransmitterContract.call("receiveMessage", [messageBytes, attestationSignature]);
  console.log('ReceiveTx: ', receiveTx)
};

main()