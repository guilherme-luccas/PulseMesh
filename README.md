# PulseMesh

App offline-first de alertas urbanos. O código do servidor fica em outro repositório: [pulsemesh-back](https://github.com/guilherme-luccas/pulsemesh-back).

Suba o backend antes do app. Sem ele, o alerta continua só neste aparelho.

## Estrutura

A tela chama o hook. O hook lê a store Zustand. A store chama o service. O service valida e o repository grava no MMKV ou fala com a API.

```
App.tsx                 abas Alertas e Mapa
src/features/alerts     lista, conversa, fila
src/features/map        mapa
src/features/admin      sessão de operação
src/features/connectivity
src/services/api        HTTP
src/services/database   MMKV
src/services/repositories
src/services/identity   código de 4 letras
src/services/situation  histórico da situação
src/theme               claro e escuro, segue o celular
```

Criar, apagar, mudar a situação e publicar na conversa gravam primeiro no aparelho e entram na fila. A sincronização manda a fila e depois puxa a lista.

## Como rodar

Node 20 ou mais novo. Xcode para o simulador iOS. O backend precisa estar em `http://127.0.0.1:3333`.

Não use o Expo Go. MMKV, mapa e keychain são módulos nativos e o Expo Go não os inclui. Recarregar o Metro também não instala módulo nativo: isso só entra com um build novo.

```bash
npm install
cp .env.example .env
npx expo run:ios
```

Android:

```bash
npx expo run:android
```

O `.env` pode ficar com `EXPO_PUBLIC_API_BASE_URL` vazio. O simulador iOS usa `http://127.0.0.1:3333`. O emulador Android usa `http://10.0.2.2:3333`. No celular físico, coloque o IP do computador, por exemplo `http://192.168.1.10:3333`, e rode o build de novo.

O mapa do Android também pede `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` e um build novo. Sem a chave, o app mostra um aviso no lugar do mapa.

O tema segue o modo do celular. O código de admin não fica neste repositório. Ele é o `ADMIN_CODE` do backend. O padrão local é `PULSE-OPS`.

## Verificação

```bash
npm run check
npx tsc --noEmit
```
