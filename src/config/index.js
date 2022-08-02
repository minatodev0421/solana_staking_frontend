import poolContent from './pool.json';


const COMMITMENT = 'confirmed';
const TWITTER_URL = 'https://www.twitter.com/';
const DISCORD_URL = 'https://www.discord.gg/';
const SERM_URL = 'https://raydium.io/swap/?ammId=8uK7Ho3oA44SNtKm86jHUYzBiJrXzeBMeJHGYdHKXGyS';
const VAULT_PDA_SEEDS = 'NFT STAKING VAULT';
const POOL_SEEDS = 'NFT STAKING POOL';
const POOL_SIGNER_SEEDS = 'NFT STAKING POOL SIGNER';
const POOL_DATA_SEEDS = 'NFT STAKING DATA';
const DECIMAL = 1000000000;
const env = process.env.REACT_APP_ENVIRONMENT;

const CLUSTER = env;
const CLUSTER_API = env === "devnet"?  "https://api.devnet.solana.com": "https://fragrant-billowing-haze.solana-mainnet.quiknode.pro/";
const CONFIG = env === "devnet" ? poolContent.dev: poolContent.main;
export {
    CLUSTER_API,
    CLUSTER,
    COMMITMENT,
    TWITTER_URL,
    DISCORD_URL,
    VAULT_PDA_SEEDS,
    POOL_SEEDS,
    POOL_SIGNER_SEEDS,
    DECIMAL,
    POOL_DATA_SEEDS,
    SERM_URL,
    CONFIG
}
