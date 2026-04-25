window.UI = {
  renderAll() {
    this.renderProgress();
    this.renderStep1();
    this.renderStep2();
    this.renderStep3();
    this.renderStep4();
    this.renderStep5();
    this.renderStep6();
    this.showCurrentStep();
    this.updateNavButtons();
  },
  renderProgress() {
    const pct = Math.round((APP_STATE.step / APP_CONFIG.steps) * 100);
    Utils.qs('#progressLabel').textContent = `Etapa ${APP_STATE.step} de ${APP_CONFIG.steps}`;
    Utils.qs('#progressPct').textContent = `${pct}%`;
    Utils.qs('#progressBar').style.width = `${pct}%`;
  },
  showCurrentStep() {
    Utils.qsa('.step').forEach((el) => el.classList.add('hidden'));
    Utils.qs(`.step[data-step="${APP_STATE.step}"]`).classList.remove('hidden');
  },
  updateNavButtons() {
    Utils.qs('#btnPrev').disabled = APP_STATE.step === 1;
    Utils.qs('#btnNext').textContent = APP_STATE.step === 6 ? 'Concluir' : 'Próximo →';
  },
  renderStep1() {
    const el = Utils.qs('.step[data-step="1"]');
    el.innerHTML = `
      <h2 class="text-xl font-bold mb-4">1) Escolha o ativo</h2>
      <div class="grid md:grid-cols-3 gap-3">
        ${Object.entries(APP_CONFIG.assets).map(([k, v]) => `
          <button class="card-choice ${v.colorClass} ${APP_STATE.asset === k ? 'active' : ''}" data-asset="${k}">
            <div class="text-lg font-bold">${v.label}</div>
            <div class="small-muted mt-1">Clique para selecionar</div>
          </button>
        `).join('')}
      </div>
    `;
    Utils.qsa('[data-asset]', el).forEach((b) => b.onclick = () => {
      APP_STATE.asset = b.dataset.asset;
      APP_STATE.network = null;
      Utils.setStatus(`Ativo selecionado: ${APP_CONFIG.assets[APP_STATE.asset].label}`);
      this.renderAll();
    });
  },
  renderStep2() {
    const el = Utils.qs('.step[data-step="2"]');
    if (!APP_STATE.asset) {
      el.innerHTML = '<p>Selecione o ativo na etapa anterior.</p>';
      return;
    }
    const nets = APP_CONFIG.networksByAsset[APP_STATE.asset];
    el.innerHTML = `
      <h2 class="text-xl font-bold mb-4">2) Escolha a rede</h2>
      <div class="grid md:grid-cols-2 gap-3">
        ${nets.map((n) => `
          <button class="card-choice ${APP_STATE.network === n ? 'active' : ''}" data-network="${n}">
            <div class="font-bold">${APP_CONFIG.networkLabels[n]}</div>
          </button>
        `).join('')}
      </div>
    `;
    Utils.qsa('[data-network]', el).forEach((b) => b.onclick = () => {
      APP_STATE.network = b.dataset.network;
      Utils.setStatus(`Rede selecionada: ${APP_CONFIG.networkLabels[APP_STATE.network]}`);
      this.renderAll();
    });
  },
  renderStep3() {
    const el = Utils.qs('.step[data-step="3"]');
    el.innerHTML = `
      <h2 class="text-xl font-bold mb-4">3) Nova carteira ou recuperar</h2>
      <div class="grid md:grid-cols-2 gap-3">
        <button class="btn-primary" id="modeNew">Gerar nova carteira</button>
        <button class="btn-secondary" id="modeRecover">Recuperar carteira existente</button>
      </div>
      <p class="small-muted mt-3">Modo atual: ${APP_STATE.mode || '-'}</p>
    `;
    Utils.qs('#modeNew', el).onclick = () => { APP_STATE.mode = 'new'; this.renderAll(); };
    Utils.qs('#modeRecover', el).onclick = () => { APP_STATE.mode = 'recover'; this.renderAll(); };
  },
  renderStep4() {
    const el = Utils.qs('.step[data-step="4"]');
    el.innerHTML = `
      <h2 class="text-xl font-bold mb-4">4) Mnemonic / Seed</h2>
      <div class="grid md:grid-cols-3 gap-3 mb-3">
        <div>
          <label class="label">Quantidade de palavras</label>
          <select id="wordCount" class="input">${APP_CONFIG.wordSizes.map((n) => `<option value="${n}" ${APP_STATE.wordCount === n ? 'selected' : ''}>${n}</option>`)}</select>
        </div>
        <div class="md:col-span-2 flex items-end">
          <button id="btnGenerateSeed" class="btn-primary w-full">Gerar seed aleatória</button>
        </div>
      </div>
      <label class="label">Seed phrase (wordlist inglesa BIP39 para consistência)</label>
      <textarea id="mnemonic" class="textarea" placeholder="Digite ou cole sua seed...">${APP_STATE.mnemonic || ''}</textarea>
      <div class="mt-3">
        <label class="label">Passphrase opcional</label>
        <input id="passphrase" class="input" type="password" value="${APP_STATE.passphrase || ''}" placeholder="Opcional" />
      </div>
      <p class="small-muted mt-3">Aviso: PT-BR não é suportado de forma consistente por todas as libs browser; usamos lista oficial BIP39 em inglês.</p>
    `;
    Utils.qs('#wordCount', el).onchange = (e) => APP_STATE.wordCount = Number(e.target.value);
    Utils.qs('#btnGenerateSeed', el).onclick = () => {
      const strength = APP_STATE.wordCount === 12 ? 128 : APP_STATE.wordCount === 18 ? 192 : 256;
      APP_STATE.mnemonic = bip39.generateMnemonic(strength);
      this.renderAll();
    };
    Utils.qs('#mnemonic', el).oninput = (e) => APP_STATE.mnemonic = e.target.value;
    Utils.qs('#passphrase', el).oninput = (e) => APP_STATE.passphrase = e.target.value;
  },
  renderStep5() {
    const el = Utils.qs('.step[data-step="5"]');
    const r = APP_STATE.result;
    el.innerHTML = `
      <h2 class="text-xl font-bold mb-4">5) Chaves e endereço</h2>
      <div class="grid md:grid-cols-2 gap-3">
        <div>
          <p class="label">Endereço</p>
          <div class="data-box" id="outAddress">${r?.address || '-'}</div>
        </div>
        <div>
          <p class="label">Chave pública</p>
          <div class="data-box" id="outPub">${r?.publicKey || '-'}</div>
        </div>
        <div class="md:col-span-2">
          <div class="flex justify-between items-center mb-2">
            <p class="label m-0">Chave privada</p>
            <button id="toggleSensitive" class="btn-secondary text-xs">${APP_STATE.showSensitive ? 'Ocultar' : 'Mostrar'}</button>
          </div>
          <div class="data-box" id="outPriv">${r ? (APP_STATE.showSensitive ? r.privateKey : Utils.mask(r.privateKey)) : '-'}</div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 mt-3">
        <button class="btn-secondary" data-copy="address">Copiar endereço</button>
        <button class="btn-secondary" data-copy="publicKey">Copiar chave pública</button>
        <button class="btn-secondary" data-copy="privateKey">Copiar chave privada</button>
        <button id="btnExportJson" class="btn-primary">Exportar JSON</button>
      </div>
      <div class="mt-4">
        <p class="label">QR Code (endereço)</p>
        <div id="qrBox" class="bg-white rounded p-2 inline-block"></div>
      </div>
      ${APP_STATE.network === 'lightning' ? '<p class="small-muted mt-3">Lightning: derivação base exibida, sem abertura/gestão de canais.</p>' : ''}
    `;
    if (r?.address && r.address !== 'N/A' && window.QRCode) {
      new QRCode(Utils.qs('#qrBox', el), { text: r.address, width: 164, height: 164 });
    }
    const t = Utils.qs('#toggleSensitive', el);
    if (t) t.onclick = () => { APP_STATE.showSensitive = !APP_STATE.showSensitive; this.renderStep5(); };
    Utils.qsa('[data-copy]', el).forEach((b) => b.onclick = async () => {
      const key = b.dataset.copy;
      if (!r?.[key] || r[key] === 'N/A') return Utils.setStatus('Nada para copiar.', true);
      try { await Utils.copyText(r[key]); Utils.setStatus('Copiado.'); }
      catch { Utils.setStatus('Falha ao copiar; copie manualmente.', true); }
    });
    const exportBtn = Utils.qs('#btnExportJson', el);
    if (exportBtn) exportBtn.onclick = () => App.exportJSON();
  },
  renderStep6() {
    const el = Utils.qs('.step[data-step="6"]');
    const r = APP_STATE.result;
    el.innerHTML = `
      <h2 class="text-xl font-bold mb-4">6) Opções avançadas</h2>
      <button id="btnToggleAdvanced" class="btn-secondary mb-3">Sou avançado →</button>
      <div id="advancedWrap" class="hidden space-y-2">
        <div class="data-box"><strong>Derivation path:</strong> ${r?.path || '-'}</div>
        <div class="data-box"><strong>xpub:</strong> ${r?.xpub || 'N/A para esta rede'}</div>
        <div class="data-box"><strong>Conta/Change/Index:</strong> ${r ? `${r.extra?.account ?? 0} / ${r.extra?.change ?? 0} / ${r.extra?.addressIndex ?? 0}` : '-'}</div>
        ${r?.extra?.note ? `<div class="data-box"><strong>Nota:</strong> ${r.extra.note}</div>` : ''}
      </div>
    `;
    Utils.qs('#btnToggleAdvanced', el).onclick = () => Utils.qs('#advancedWrap', el).classList.toggle('hidden');
  },
};
