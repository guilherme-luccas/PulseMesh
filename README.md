# PulseMesh

Aplicativo de resiliência urbana e alertas de emergência, offline-first, para o desafio Global Solution da FIAP (Citizen Tech).

## Arquitetura

- **Clean Architecture + MVVM**, organizada por feature em `src/features/`.
- A tela consome só o hook (`hook/useAlertsScreen.ts`). O hook lê a store Zustand.
- A store chama `alertsService`. O serviço valida e delega ao `alertsRepository`.
- O repositório escolhe a fonte: MMKV local e, na sincronização, a API mockada.
- A fila `outbox` guarda criações feitas sem rede. Sincronizar envia e marca o alerta como sincronizado.

## Como rodar

MMKV é módulo nativo. O Expo Go não carrega essa biblioteca. Use um development build:

```bash
npm install
npx expo run:ios
# ou
npx expo run:android
```

## Verificação

```bash
npm run check
npx tsc --noEmit
```
