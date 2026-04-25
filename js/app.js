window.App = {
  init() {
    UI.renderAll();
    Utils.qs('#btnPrev').onclick = () => this.prev();
    Utils.qs('#btnNext').onclick = () => this.next();
    Utils.qs('#btnReset').onclick = () => this.reset();
  },
  validateStep(step) {
    if (step >= 2 && !APP_STATE.asset) throw new Error('Selecione um ativo.');
    if (step >= 3 && !APP_STATE.network) throw new Error('Selecione uma rede.');
    if (step >= 4 && !APP_STATE.mode) throw new Error('Escolha gerar ou recuperar.');
    if (step >= 5) {
      const words = Utils.sanitizeMnemonic(APP_STATE.mnemonic).split(' ').filter(Boolean);
      if (![12, 18, 24].includes(words.length)) throw new Error('Seed deve ter 12, 18 ou 24 palavras.');
      if (!bip39.validateMnemonic(Utils.sanitizeMnemonic(APP_STATE.mnemonic))) throw new Error('Seed inválida no padrão BIP39.');
      APP_STATE.result = Derive.deriveBySelection(APP_STATE);
    }
  },
  next() {
    try {
      if (APP_STATE.step < APP_CONFIG.steps) {
        this.validateStep(APP_STATE.step + 1);
        APP_STATE.step += 1;
        UI.renderAll();
        Utils.setStatus('');
      }
    } catch (e) {
      Utils.setStatus(e.message, true);
    }
  },
  prev() {
    if (APP_STATE.step > 1) {
      APP_STATE.step -= 1;
      UI.renderAll();
    }
  },
  async exportJSON() {
    if (!APP_STATE.result) return;
    const basic = {
      timestamp: new Date().toISOString(),
      asset: APP_STATE.asset,
      network: APP_STATE.network,
      derivationPath: APP_STATE.result.path,
      address: APP_STATE.result.address,
      publicKey: APP_STATE.result.publicKey,
      privateKey: APP_STATE.result.privateKey,
      xpub: APP_STATE.result.xpub,
    };
    const encrypt = confirm('Deseja exportar com criptografia por senha?');
    if (!encrypt) {
      Utils.downloadJSON('agoraSAFE-wallet.json', basic);
      return;
    }
    const password = prompt('Digite uma senha forte para criptografar o JSON:');
    if (!password || password.length < 8) {
      Utils.setStatus('Senha inválida. Mínimo de 8 caracteres.', true);
      return;
    }
    const encrypted = await Utils.encryptWithPassword(basic, password);
    Utils.downloadJSON('agoraSAFE-wallet.encrypted.json', encrypted);
  },
  reset() {
    Object.assign(APP_STATE, {
      step: 1, asset: null, network: null, mode: null, mnemonic: '', passphrase: '',
      wordCount: 12, result: null, showSensitive: false,
    });
    UI.renderAll();
    Utils.setStatus('Tudo limpo da memória desta aba.');
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
