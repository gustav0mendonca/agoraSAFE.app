window.APP_CONFIG = {
  steps: 6,
  assets: {
    bitcoin: { label: 'Bitcoin', colorClass: 'card-btc' },
    usdt: { label: 'USDT', colorClass: 'card-usdt' },
    depix: { label: 'DePIX', colorClass: 'card-depix' },
  },
  networksByAsset: {
    bitcoin: ['onchain', 'liquid', 'lightning'],
    usdt: ['liquid', 'lightning', 'ethereum', 'bsc', 'avalanche', 'tron', 'solana'],
    depix: ['liquid'],
  },
  networkLabels: {
    onchain: 'Bitcoin Onchain',
    liquid: 'Liquid',
    lightning: 'Lightning',
    ethereum: 'Ethereum (ERC-20)',
    bsc: 'BSC (BEP-20)',
    avalanche: 'Avalanche C-Chain',
    tron: 'TRON (TRC-20)',
    solana: 'Solana (SPL)',
  },
  derivation: {
    bitcoin: "m/84'/0'/0'/0/0",
    liquid: "m/84'/1777'/0'/0/0",
    evm: "m/44'/60'/0'/0/0",
    tron: "m/44'/195'/0'/0/0",
    solana: "m/44'/501'/0'/0'",
  },
  wordSizes: [12, 18, 24],
};
