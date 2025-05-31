import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleRequestCredential = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!);
    const scope = encodeURIComponent("https://www.googleapis.com/auth/gmail.readonly");
    const state = uuidv4();
  
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=online&prompt=consent&state=${state}`;
  
    window.location.href = oauthUrl;
  };

export const evmNetworks = [
  {
    blockExplorerUrls: ['https://rootstock.blockscout.com/'],
    chainId: 30,
    chainName: 'Rootstock Mainnet',
    iconUrls: ['http://localhost:3000/rootstock_logo.png'],
    name: 'Rootstock',
    nativeCurrency: {
      decimals: 18,
      name: 'Rootstock Bitcoin',
      symbol: 'RBTC',
      iconUrl: 'http://localhost:3000/rbtc_logo.png',
    },
    networkId: 30,
    rpcUrls: ['https://public-node.rsk.co'],
    vanityName: 'Rootstock',
  },
  {
    blockExplorerUrls: ['https://rootstock-testnet.blockscout.com/'],
    chainId: 31,
    chainName: 'Rootstock Testnet',
    iconUrls: ['http://localhost:3000/rootstock_logo.png'],
    name: 'Rootstock Testnet',
    nativeCurrency: {
      decimals: 18,
      name: 'Test RBTC',
      symbol: 'tRBTC',
      iconUrl: 'http://localhost:3000/rbtc_logo.png',
    },
    networkId: 31,
    rpcUrls: ['https://public-node.testnet.rsk.co'],
    vanityName: 'Rootstock Testnet',
  }
];

export const tokensToCheckTeleporter = [
  {
    addr: "0xE69711C55f6E87F4c39321D3aDeCc4C2CAddc471",
    chainId: 11155111,
    blockNumber: 8442172,
    balance: 0,
  },/*
  {
    addr: "0x92A08a34488Fcc8772Af2269186e015Eca494Baa",
    chainId: 11155420,
    blockNumber: 28421349,
    balance: 0,
  },
  {
    addr: "0x7B4707070b8851F82B5339aaC7F6759d8e737E88",
    chainId: 84532,
    blockNumber: 26438476,
    balance: 0,
  },*/
];
