import {
    AvalancheFuji,
    Chain,
    ArbitrumSepolia,
    BaseSepoliaTestnet,
    OpSepoliaTestnet,
    Optimism,
    Arbitrum,
    Sepolia,
    Ethereum,
} from "@thirdweb-dev/chains";

export type NetworkType = {
    name: string;
    network: Chain;
    src: string;
    domain: number;
    tokenMessengerContract: string;
    messageTransmitterContract: string;
    usdcContract: string;
    tokenMinterContract: string;
    api: string;
};

export const SepoliaTestnet: NetworkType = {
    name: Sepolia.name,
    network: Sepolia,
    src: Ethereum.icon.url,
    domain: 0,
    tokenMessengerContract: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    messageTransmitterContract: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD",
    usdcContract: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    tokenMinterContract: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    api: "https://iris-api-sandbox.circle.com/attestations",
};

export const AvalancheFujiTestnet: NetworkType = {
    name: AvalancheFuji.name,
    network: AvalancheFuji,
    src: AvalancheFuji.icon.url,
    domain: 1,
    tokenMessengerContract: "0xeb08f243e5d3fcff26a9e38ae5520a669f4019d0",
    messageTransmitterContract: "0xa9fb1b3009dcb79e2fe346c16a604b8fa8ae0a79",
    usdcContract: "0x5425890298aed601595a70AB815c96711a31Bc65",
    tokenMinterContract: "0x4ed8867f9947a5fe140c9dc1c6f207f3489f501e",
    api: "https://iris-api-sandbox.circle.com/attestations",
};

export const ArbitrumTestnet: NetworkType = {
    name: ArbitrumSepolia.name,
    network: ArbitrumSepolia,
    src: Arbitrum.icon.url,
    domain: 3,
    tokenMessengerContract: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    messageTransmitterContract: "0xaCF1ceeF35caAc005e15888dDb8A3515C41B4872",
    usdcContract: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    tokenMinterContract: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    api: "https://iris-api-sandbox.circle.com/attestations",
};

export const BaseSepolia: NetworkType = {
    name: BaseSepoliaTestnet.name,
    network: BaseSepoliaTestnet,
    src: BaseSepoliaTestnet.icon.url,
    domain: 6,
    tokenMessengerContract: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    messageTransmitterContract: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD",
    usdcContract: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    tokenMinterContract: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    api: "https://iris-api-sandbox.circle.com/attestations",
};

export const OPSepolia: NetworkType = {
    name: OpSepoliaTestnet.name,
    network: OpSepoliaTestnet,
    src: Optimism.icon.url,
    domain: 2,
    tokenMessengerContract: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    messageTransmitterContract: "0xaCF1ceeF35caAc005e15888dDb8A3515C41B4872",
    usdcContract: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
    tokenMinterContract: "0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A",
    api: "https://iris-api-sandbox.circle.com/attestations",
};

export const Networks: Record<string, NetworkType> = {
    [Sepolia.slug]: SepoliaTestnet,
    [AvalancheFuji.slug]: AvalancheFujiTestnet,
    [ArbitrumSepolia.slug]: ArbitrumTestnet,
    [OpSepoliaTestnet.slug]: OPSepolia,
    [BaseSepoliaTestnet.slug]: BaseSepolia,
};

export const NetworkList: NetworkType[] = Object.values(Networks);

const NetworkSlugs = Object.keys(Networks);

export type NetworkSlug = typeof NetworkSlugs[number];