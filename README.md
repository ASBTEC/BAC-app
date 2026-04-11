# BAC-app

App for the BAC Barcelona 2026, built with Expo/React Native.

## Setup

Requirements: Node.js v20 (via nvm)

```bash
nvm install 20
nvm use 20
npm install
```

## Run locally (web)

```bash
npm run web
```

Opens at `http://localhost:8081`. Anyone on the same network can access it at `http://<your-ip>:8081`.

## Build APK for Android

No Android SDK needed — builds in Expo's cloud.

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

When done, EAS gives you a download link for the `.apk` file. To install it on a phone: enable "Install from unknown sources" in Android settings, download the APK, and tap to install.

## Development

```bash
npm start        # Expo dev server (scan QR with Expo Go)
npm run android  # Run on connected Android device/emulator (requires Android SDK)
npm run lint     # Lint
```

### Android SDK setup (only needed for `npm run android`)

Add to `~/.bashrc`:
```bash
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="$PATH:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin"
```



# Design
Nois, no havia entés que volíeu fer una app d'events de FEBIOTEC i no una app específicament pel 
BAC de Barcelona. El primer seria més complex (tot i tenir més valor) i no estic segur si podríem 
connectar la pàgina web de FEBIOTEC amb l'app, que és a on estan les dades dels usuaris i dels 
events que han comprat. No es pot fer servir els comptes de FEBIOTEC de Google ja que només els 
membres de junta de FEBIOTEC o els seus col·laboradors tenen aquest tipus de comptes. Llavors, el 
que he decidit es simplificar el que heu pensat i tirar més per a una app especifia pel BAC, que no 
tindria login.

Serviria per a mostrar diferents informacions del congrés en diferents pestanyes:
* *Perfil* amb les seves dades --> No hi ha login per tant això desapareix
* *Agenda* amb un format calendari on pots canviar el dia amb fletxes amunt i et surt el horari de  
  que es fa en intervals de 15mins  --> Seria un widget o alguna cosa de l'estil de Google Calendar, 
  pel que e
* *Up-to-date* informació genèrica sobre ASBTEC, FEBiotec, BAC, sponsors i notícies importants pel 
  BAC 2026
* *Asistents* on pots veure tots els sponsors i partners i el nom de la gent que vindrà de cada 
  companyia/institució
* *Activitats* un espai on es poden fer questionaris o qualsevol contingut de cada activitat 
  (es pot desbloquejar el accés amb codis o QR).  --> Això tampoc es farà ja que no cal una app 
  custom per a fer això. Amb escanejar un QR 

Disseny final:


