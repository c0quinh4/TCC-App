**COMANDOS IMPORTANTES PRA EU NÃO ESQUECER:**

**GIT HUB**
    *ASSIM QUE ABRIR O CÓDIGO:*
        git pull
    *COMMIT:*
        git add .
        git commit -m "mensagem"
        git push -u origin main ou só git push

**Depois de usar *git pull / clonar o repositório:**
    npm install ***1ª PASSO OBRIGATÓRIO*** (Cria pasta node_modules)
    npx expo start ***2º PASSO OBRIGATÓRIO*** (Cria pasta .expo)
    npx expo run:android ***3º PASSO OBRIGATÓRIO*** (Roda para testar se a build do app funciona. Obs: Talvez não seja necessário de primeira, só quando for rodar o app)
    npm install -g eas-cli _caso não esteja rodando o expo start_
    expo doctor --fix-dependencies _caso alguma dependência quebre_
    eas build --platform _android somente caso o run android não funcione_
    npx expo prebuild _caso a build plataform do android não rode_
    npx expo start

**Conectar Celular**
    *conecta o cabo*
    adb devices
    adb tcpip 5555
    *desconecta o cabo*
    ip WI-FI Luiza: 192.168.0.27
    ip WI-FI Casa: 192.168.7.11
    adb connect <IP_do_celular>:5555