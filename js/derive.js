window.Derive = {
  _ensure() {
    if (!window.bip39 || !window.ethers) throw new Error('Bibliotecas essenciais não carregadas.');
  },
  getHDNode(mnemonic, passphrase, path) {
    this._ensure();
    const phrase = Utils.sanitizeMnemonic(mnemonic);
    return ethers.HDNodeWallet.fromPhrase(phrase, passphrase || '', path);
  },
  deriveBitcoinLike(mnemonic, passphrase, networkKey = 'bitcoin') {
    const network = networkKey === 'bitcoin'
      ? bitcoinjs.networks.bitcoin
      : (window.liquidjs?.networks?.liquid || window.liquidjs?.networks?.regtest);
    const path = networkKey === 'bitcoin' ? APP_CONFIG.derivation.bitcoin : APP_CONFIG.derivation.liquid;
    const hd = this.getHDNode(mnemonic, passphrase, path);
    const pubkey = ethers.getBytes(hd.signingKey.compressedPublicKey);
    const lib = networkKey === 'bitcoin' ? bitcoinjs : (window.liquidjs || bitcoinjs);
    const payment = lib.payments.p2wpkh({ pubkey, network });

    return {
      path,
      address: payment.address,
      publicKey: hd.signingKey.compressedPublicKey,
      privateKey: hd.privateKey,
      xpub: hd.neuter().extendedKey,
      extra: { account: 0, change: 0, addressIndex: 0 },
    };
  },
  deriveEVM(mnemonic, passphrase) {
    const path = APP_CONFIG.derivation.evm;
    const hd = this.getHDNode(mnemonic, passphrase, path);
    return {
      path,
      address: hd.address,
      publicKey: hd.signingKey.compressedPublicKey,
      privateKey: hd.privateKey,
      xpub: hd.neuter().extendedKey,
      extra: { account: 0, change: 0, addressIndex: 0 },
    };
  },
  deriveTron(mnemonic, passphrase) {
    if (!window.TronWeb) throw new Error('TronWeb não carregado.');
    const path = APP_CONFIG.derivation.tron;
    const hd = this.getHDNode(mnemonic, passphrase, path);
    const privHex = hd.privateKey.replace(/^0x/, '');
    const address = TronWeb.address.fromPrivateKey(privHex);
    return {
      path,
      address,
      publicKey: hd.signingKey.compressedPublicKey,
      privateKey: hd.privateKey,
      xpub: hd.neuter().extendedKey,
      extra: { account: 0, change: 0, addressIndex: 0 },
    };
  },
  deriveSolana(mnemonic, passphrase) {
    if (!window.ed25519HdKey || !window.solanaWeb3) throw new Error('Bibliotecas Solana não carregadas.');
    const seed = bip39.mnemonicToSeedSync(Utils.sanitizeMnemonic(mnemonic), passphrase || '');
    const path = APP_CONFIG.derivation.solana;
    const d = ed25519HdKey.derivePath(path, ethers.hexlify(seed).replace(/^0x/, ''));
    const kp = solanaWeb3.Keypair.fromSeed(d.key.slice(0, 32));
    return {
      path,
      address: kp.publicKey.toBase58(),
      publicKey: kp.publicKey.toBase58(),
      privateKey: ethers.hexlify(kp.secretKey).replace(/^0x/, ''),
      xpub: null,
      extra: { account: 0, change: 0, addressIndex: 0 },
    };
  },
  deriveLightningExplanation(asset) {
    const isUSDT = asset === 'usdt';
    return {
      path: APP_CONFIG.derivation.bitcoin,
      address: 'N/A',
      publicKey: 'N/A',
      privateKey: 'N/A',
      xpub: null,
      extra: {
        note: isUSDT
          ? 'USDT em Lightning depende de infraestrutura de pagamento e canais; este app deriva a base criptográfica, mas não abre canais localmente.'
          : 'Lightning herda a seed do Bitcoin. Este app não cria nó/canal Lightning localmente.',
      },
    };
  },
  deriveBySelection({ asset, network, mnemonic, passphrase }) {
    if (!bip39.validateMnemonic(Utils.sanitizeMnemonic(mnemonic))) {
      throw new Error('Seed inválida. Verifique palavras e ordem.');
    }
    if (network === 'onchain') return this.deriveBitcoinLike(mnemonic, passphrase, 'bitcoin');
    if (network === 'liquid') return this.deriveBitcoinLike(mnemonic, passphrase, 'liquid');
    if (['ethereum', 'bsc', 'avalanche'].includes(network)) return this.deriveEVM(mnemonic, passphrase);
    if (network === 'tron') return this.deriveTron(mnemonic, passphrase);
    if (network === 'solana') return this.deriveSolana(mnemonic, passphrase);
    if (network === 'lightning') return this.deriveLightningExplanation(asset);
    throw new Error('Rede não suportada.');
  },
};
