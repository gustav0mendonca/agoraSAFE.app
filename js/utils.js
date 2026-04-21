window.Utils = {
  qs(sel, root = document) { return root.querySelector(sel); },
  qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; },
  setStatus(msg, isError = false) {
    const el = this.qs('#status');
    el.textContent = msg || '';
    el.className = `text-sm mt-4 ${isError ? 'text-red-400' : 'text-neutral-400'}`;
  },
  async copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return !!ok;
  },
  mask(str) {
    if (!str) return '-';
    return `${str.slice(0, 6)}••••••${str.slice(-6)}`;
  },
  sanitizeMnemonic(txt) {
    return (txt || '').toLowerCase().trim().replace(/\s+/g, ' ');
  },
  downloadJSON(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
  async encryptWithPassword(payloadObj, password) {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    const aesKey = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 200000 },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    const plaintext = enc.encode(JSON.stringify(payloadObj));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, plaintext);
    return {
      mode: 'aes-256-gcm',
      kdf: 'pbkdf2-sha256',
      iterations: 200000,
      salt: Array.from(salt),
      iv: Array.from(iv),
      ciphertext: Array.from(new Uint8Array(ciphertext)),
    };
  },
};
