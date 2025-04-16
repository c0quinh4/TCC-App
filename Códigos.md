Códigos para eu não esquecer:

**Após clonar o repositório:**
    npm install *1ª PASSO OBRIGATÓRIO*
    npx expo start *2º PASSO OBRIGATÓRIO
    expo doctor --fix-dependencies *não é necessário*
    npm install -g eas-cli *não é necessário*
    npx expo prebuild *não é necessário*
    eas build --platform android *somente caso o de baixo não funcione*
    npx expo run:android

**Conectar Celular**
    adb devices
    adb tcpip 5555
    ip WI-FI Luiza: 192.168.0.27
    ip WI-FI Casa: 192.168.7.11
    adb connect <IP_do_celular>:5555

**GIT HUB**
    ASSIM QUE ABRIR O CÓDIGO
        git pull

    COMMIT:
        git add .
        git commit -m "mensagem"
        git push -u origin main ou só git push
