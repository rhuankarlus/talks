# NodeJS - Concorrência e Multithreading

Este aplicativo mostra como responder de maneira síncrona e assíncrona a chamadas *REST* utilizando **NodeJS**, **Workers** e **Addons**.

## Requisitos

- [NodeJS](https://nodejs.org/en/)
- [node-gyp](https://github.com/nodejs/node-gyp)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/)
- Linux / MacOS: o script de inicialização [init] não funciona em ambientes Windows, mas você pode compreendê-lo e criar seu próprio script :wink:

## Como executar

Basta executar o arquivo **init** assim: `./init` e o serviço iniciará na porta **3000**.

Caso ocorra algum erro, verifique se o arquivo está com permissão de execução e caso não esteja, execute o comando `chmod 755 init`

## URLs:

A seguir a lista completa de URLs para teste:

- http://localhost:3000/
    > Essa URL retorna um JSON com uma mensagem que diz se o serviço está no ar e o processId da instância NodeJS
- http://localhost:3000/users
    > Neste endpoint procura-se todos os usuários cadastrados no banco e faz-se algumas operações em *runtime* com os dados obtidos. Realizando várias chamadas em paralelo podemos ver que a performance é amplamente afetada.
- http://localhost:3000/js_sync
    > Neste endpoint calcula-se um valor matemático com uma função On2 chamando uma função síncrona bloqueando a thread principal
- http://localhost:3000/js_async
    > Neste endpoint calcula-se um valor matemático com uma função On2 chamando uma função anotada com `async` bloqueando a thread principal
- http://localhost:3000/workers
    > Neste endpoint criamos duas threads (workers) e uma delas realiza o cálculo de um valor matemático com uma função On2 enquanto a outra printa mensagens no console, tudo sem bloquear a thread principal
- http://localhost:3000/cpp_sync
    > Neste endpoint calcula-se um valor matemático com uma função On2 chamando uma função síncrona escrita em C++ (Addon) bloqueando a thread principal
- http://localhost:3000/cpp_async
    > Neste endpoint calcula-se um valor matemático com uma função On2 chamando uma função assíncrona escrita em C++ (Addon) que utiliza as threads LibUV e enfileira a resposta quando o cálculo é finalizado. Tudo sem bloquear a thread principal.
