# BAC-app 👋

App for the BAC Barcelona 2026.

This is an [Expo](https://expo.dev) project created with
[`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Requisites
### Android SDK
Add this into your `~/.bashrc`:
```shell
# Android SDK
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="$PATH:$ANDROID_SDK_ROOT/platform-tools"
export PATH="$PATH:$ANDROID_SDK_ROOT/emulator"
export PATH="$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin"
```

Also download Android Studio, Android platform tools and cmdline tools in the corresponding folder.


## Get started
Requisites:
* nvm (in your computer)
* Expo Go (in your phone)
* Android SDK installed and configured (in your computer)

Then, use the following to install and use `npm` in version 20:
```shell
nvm install 20
nvm use 20
```

### Development in Expo Go
Install `eas-cli` and login:
```shell
npm install -g eas-cli 
eas login
```

Configure the build:
```shell
eas build:configure  # Select All
```

And run the app in the Expo Cloud:
```shell
eas build --platform android --profile development
```

Press 's' to switch to "Expo Go" and scan the QR code with your phone. You will see the app in your 
phone.

### Development in Android Device
[Follow this guide](https://reactnative.dev/docs/running-on-device)
expo-dev-client
npx expo run:android

### Generate standalone APK
After using

```shell
eas build --platform android --profile development
```

Use 
```shell
./gradlew assembleRelease
```

To generate an app into `android/outputs/apk/release/app-release.apk` that you can move to your
phone to install it. 


### Running
Install dependencies

   ```bash
   npm install
   ```

Start the app

   ```bash
   npx expo start
   ```



In the output, you'll find options to open the app in a
- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo
- [Getting started](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build)

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.



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


