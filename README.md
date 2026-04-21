# ÁgoraSAFE.app

Aplicação web **100% offline** para gerar e recuperar carteiras/chaves de Bitcoin, USDT e DePIX com wizard em 6 etapas.

## Estrutura

```text
agoraSAFE.app/
├── index.html
├── style.css
├── README.md
├── assets/
├── libs/
│   ├── tailwind.browser.min.js
│   ├── bip39.min.js
│   ├── bip32.min.js
│   ├── bitcoinjs-lib.min.js
│   ├── liquidjs-lib.min.js
│   ├── ethers.umd.min.js
│   ├── tronweb.min.js
│   ├── ed25519-hd-key.umd.js
│   ├── solana-web3.iife.min.js
│   └── qrcode.min.js
└── js/
    ├── app.js
    ├── config.js
    ├── derive.js
    ├── state.js
    ├── ui.js
    └── utils.js
```

## Bibliotecas esperadas em `/libs`

> O app roda offline depois de baixar estes arquivos para a pasta `/libs`.

- `tailwind.browser.min.js` (Tailwind standalone browser)
- `bip39.min.js`
- `bip32.min.js` (para compatibilidade/expansão avançada)
- `bitcoinjs-lib.min.js`
- `liquidjs-lib.min.js`
- `ethers.umd.min.js` (v6)
- `tronweb.min.js`
- `ed25519-hd-key.umd.js`
- `solana-web3.iife.min.js`
- `qrcode.min.js`

## Uso offline

1. Baixe/clone o projeto.
2. Coloque todas as bibliotecas minificadas em `/libs` com os nomes acima.
3. Abra `index.html` diretamente no navegador (sem servidor).
4. Siga o wizard:
   - Etapa 1: ativo
   - Etapa 2: rede
   - Etapa 3: gerar/recuperar
   - Etapa 4: seed/passphrase
   - Etapa 5: endereço/chaves/QR/export
   - Etapa 6: avançado

## Segurança aplicada

- Não usa localStorage/sessionStorage por padrão.
- Dados sensíveis ficam somente em memória da aba.
- Chave privada oculta por padrão.
- Botão **Limpar tudo** para zerar estado da memória.
- Export JSON simples ou criptografado (AES-GCM + PBKDF2) com senha.

## Mapeamento ativo/rede/path

- Bitcoin Onchain: `m/84'/0'/0'/0/0`
- Liquid (BTC/USDT/DePIX): `m/84'/1777'/0'/0/0`
- EVM (Ethereum/BSC/Avalanche): `m/44'/60'/0'/0/0`
- TRON: `m/44'/195'/0'/0/0`
- Solana: `m/44'/501'/0'/0'`
- Lightning: mesma base de seed do Bitcoin (sem abrir canais neste app)

## Limitações reais

- Lightning: app não cria nó, não abre canal, não faz roteamento.
- Endereço Liquid depende do build de `liquidjs-lib` disponível no browser.
- Wordlist PT-BR BIP39 não é padronizada/consistente em todos os bundles browser; padrão mantido em inglês para confiabilidade.

## Checklist rápido

- [ ] Funciona sem internet após carregar arquivos locais.
- [ ] Gera seed 12/18/24.
- [ ] Valida seed BIP39.
- [ ] Gera endereço real para Onchain/Liquid/EVM/TRON/Solana.
- [ ] QR code renderiza localmente.
- [ ] Copiar funciona (ou fallback manual).
- [ ] Export JSON simples e criptografado funcionam.
- [ ] Limpar tudo remove dados da tela/memória da aba.
