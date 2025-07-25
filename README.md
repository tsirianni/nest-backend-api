# NestJs Web API boilerplate

Este projeto tem como objetivo fornecer um boilerplate robusto e flexível para o desenvolvimento de APIs utilizando o NestJS. A proposta central é facilitar a criação de aplicações web, explorando ao máximo os recursos modulares e arquiteturais que o NestJS oferece — como injeção de dependência, decorators, middlewares, interceptors e pipelines.

Ao partir deste boilerplate, desenvolvedores podem acelerar a fase inicial de projetos, padronizar práticas em equipes e garantir uma estrutura escalável desde o início, mantendo espaço para customizações específicas conforme a complexidade da aplicação.

Este projeto pessoal também serve como laboratório para explorar padrões avançados de desenvolvimento backend com TypeScript, bem como para integrar tecnologias comuns ao ecossistema moderno de APIs (autenticação, filas, armazenamento, validação, testes, etc.).

> Importante
>
> Este projeto (bem como sua documentação) continua em desenvolvimento e não se encontra completo. As funcionalidades estão sendo implementadas de forma incremental, conforme a minha disponibilidade de tempo.

## Como utilizar este boilerplate

> Requisitos:
>
> - NodeJs (+18)
> - Docker e Docker compose
>
> Os comandos sugeridos neste documento são voltados aos usuários Linux (talvez funcionem em MacOs?), usuários Windows devem procurar alternativas equivalentes caso os comandos não funcionem no Windows.

Após clonar o projeto, crie um arquivo `.env` e copie e cole o conteúdo de `.env.example` para ter acesso a todas as variáveis de ambiente utilizadas na aplicação.

A princípio não é necessário configurar as sessões: `App generals`, `AWS`, `Bcrypt`, `Database`. Essas configurações podem ser modificadas posteriormente de acordo com suas preferências.

> Lembrete
>
> O arquivo `.env` armazena informações sensíveis da aplicação, jamais utilize as mesmas configurações em diferentes ambientes e jamais utilize informações sensíveis como tokens, senhas e chaves de API diretamente no código.

### Encryption

Na seção `Encryption` devem ser definidas duas variáveis de ambiente, `UUID_CIPHER_ALGORITHM` e `UUID_CIPHER_KEY`. Conforme os nomes sugerem, um algoritmo e chave devem ser definidos.

Neste momento, sugiro utilizar `aes-256-cbc` como algoritmo e gerar uma chave com o seguinte comando:

`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

### SMTP Config

Este boilerplate utiliza `nodemailer` para envios de e-mail e para tanto é necessário configurar algumas variáveis. Visto que o provedor de email pode variar com a preferência dos usuários sugere-se que cada um procure as configurações necessárias para cada provedor.

Abaixo, está um exemplo de configuração com o GMAIL (para desenvolvimento local):

```javascript
SMTP_HOST = smtp.gmail.com;
SMTP_PORT = 587;
SMTP_SECURE = false;
SMTP_USER = { user };
SMTP_PASSWORD = { password };
SMTP_FROM = { email };
```

Sugere-se que cada desenvolvedor busque a maneira recomendada pelo provedor para utlizar as contas de email em APIs, tais como **senhas de app** do gmail.

### JWT Secret

Na seção de configuração do JWT (Json Web Token) deve-se providenciar uma chave pública e uma privada, que serão utilizadas na autenticação dos usuários.

Para gerar a chave privada e pública (linux), utilize a biblioteca `openssl` com os seguintes comandos (execute-os em ordem):

**Chave privada**: `openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2848`

**Chave pública**: `openssl rsa -pubout -in private_key.pem -out public_key.pem`

Dois arquivos foram gerados no repositório, `private_key.pem` e `public_key.pem`. Agora basta converter cada um para base64 e colocamos em suas respectivas variáveis de ambiente.

`base64 -w 0 private_key.pem` -> JWT_PRIVATE_KEY

`base64 -w 0 public_key.pem` -> JWT_PUBLIC_KEY

Após preencher as variáveis de ambiente, os arquivos `.pem` podem ser excluídos.

> Após seguir estes passos a aplicação já pode ser iniciada com `npm start`.

# Funcionalidades disponíveis

Abaixo está uma lista não exaustiva de funcionalidades e caracteristicas deste boilerplate para oferecer um melhor panorama do que está sendo oferecido.

🔐 Autenticação via JWT com suporte a sessões baseadas em cookies

💌 Serviço de e-mail com templates HTML e CSS inline usando Nodemailer

📁 Upload de arquivos utilizando um interceptor personalizado com Busboy

✅ Validação completa da requisição (query, body, params) com interceptor baseado em Zod

🧨 Filtros de exceção personalizados para tratamento de erros consistente

📦 ORM Prisma para interações com o banco de dados com segurança de tipos

🧪 Função auxiliar com Try/Catch tipado para reduzir boilerplate em chamadas ao banco de dados

📄 Documentação da API com Swagger utilizando decorator customizado para manter os controllers limpos

🔐 Criptografia de UUIDs com um CipherService (IV aleatório por criptografia + Pipe para descriptografar com segurança)

🛰️ Wrapper modular para Axios em chamadas a APIs externas

☁️ Serviço de integração com S3 (upload, obtenção de URL e deleção) usando @aws-sdk/lib-storage

🐳 Ambiente de desenvolvimento dockerizado com PostgreSQL e container isolado para a API

🧹 Foco em qualidade de código: ESLint, Prettier e hooks com Husky para commits limpos

# Destaques

Dentre as features disponíveis há diversas implementações interessantes que valem ser destacadas ou que exigem maior contextualização para melhor entender o seu uso.

## ✅ Interceptor de validação de payload

Como já diz aquele famoso provérbio russo:

> **Trust, but verify.**

Não faltam usuários mal intencionados e validar o que está sendo recebido na payload da requisição é fundamental.

Embora o NestJs ofereça uma solução nativa através da biblioteca `class-validator`, neste projeto a escolha por uma solução customizada se deu por um simples motivo: o author deste repositório não é fã de muitos _decorators_.

Embora simples de usar, em payloads grandes e a depender da quantidade de validação que um campo necessite (e.x. obrigatório, string, deve ser compatível com X regex, etc.) a legibilidade do código pode ser afetada e visualmente desagradável.

Sendo assim uma alternativa foi buscada utilizando a biblioteca `zod` (alternativa ao JOI com tipagem) para criar um interceptor que possa validar a requisição como um todo, e assim surgiu o `ValidationInterceptor`.

A proposta é criar um DTO e especificar o schema da requisição como um todo, separado em `body`, `query` e `params` e agregando as validações necessárias com encadeamento de métodos (interface fluente). O exemplo abaixo demonstra o schema da requisição de autenticação:

```ts
export const signInSchema = {
  body: zod.object({
    username: zod.string(),
    password: zod.string(),
  }),
};

export type SignInDTO = zod.infer<typeof signInSchema.body>;
```

Na definição da rota, basta passar o schema criado ao interceptor para que a validação seja realizada:

```ts
@UseInterceptors(new ValidationInterceptor(schemas.signIn)) // SignIn: {body: zod.object(), query: zod.object(), params: zod.object()}
```

Deste modo, as validações necessárias podem ser encadeadas `zod.string().min().max().etc..` deixando o schema limpo, legível e de fácil manutenção. A utilização do interceptor também é simplicada pois ao validar a requisição como um todo é preciso chamá-lo apenas uma única vez.

## 💌 Envio de e-mails com templates em HTML/inline CSS

O envio de e-mail é uma parte trivial de qualquer API, contudo, muitas vezes não recebe uma atenção inicial a estrutura de modo a facilitar a construção dos templates. Por ser enviado pela API é necessário utilizar _inline css_, mas já imaginou precisar construir um template apenas modificando uma string da seguinte forma?

```js
const clientName = 'John Doe';

const welcomeTemplate = `
  <div style="padding: 20; margin-top: 5px, margin-left: 5px">
    <p>Hello ${clientName}</p>, seja bem-vindo à nossa plataforma.
  </div>
`;
```

A depender do design as estilizações podem ficar complexas e difíceis de serem acompanhadas quando não há um auxílio do editor de texto para diferenciar classes, tags, sem sugestões do editor, simplesmente não é uma experiência agradável de desenvolvimento.

Pensando nisso foi montada uma estrutura que permite que os templates de email sejam criados em arquivos `.html` (embora um pouco estranho arquivos HTML na API é aceitável) e lidos como strings para serem enviados pelo nodemailer.

Tendo como exemplo o template que envia o código de verificação via e-mail durante o processo de cadastro, temos o seguinte fluxo:

- Construção do template em `.html`

```html
<div style="padding: 20px">
  <p>Olá, :name</p>
  <p>
    Aqui está o seu código de verificação: :verificationCode. Tenha em mente de que este código expira em 5 minutos, portanto
    finalize eu cadastro o quanto antes.
  </p>
</div>
```

Observe que os parâmetros agora são prefixados com `:`.

- Mapeamento dos argumentos necessários para o templat:

```ts
type SignUpCode = {
  type: 'SIGN_UP_CODE';
  templateArgs: {
    name: string;
    verificationCode: number;
  };
};
```

- Conversão do html para string com substituição dos parâmetros

```ts
import { TypeToTemplateArgsMap } from './enums';
import { getHtmlString } from './utils';

export default (args: TypeToTemplateArgsMap['SIGN_UP_CODE']) => {
  let fullTemplate = getHtmlString('sign-up-code.html');
  Object.entries(args).forEach(([key, value]) => {
    fullTemplate = fullTemplate.replace(`:${key}`, String(value));
  });

  return fullTemplate;
};
```

O retorno `fullTemplate` já pode ser enviado na propriedade `html` do nodemailer e o e-mail será recebido com a formatação implementada e, já que estamos usando Typescript é natural que os parâmetros necessários estejam mapeados na hora de enviar o e-mail, sendo auto-sugeridos pelo editor de texto a depender do template:

{image-placeholder}

## 📄 Documentação da API com Swagger utilizando decorator customizado para manter os controllers limpos

Este é outro exemplo de esforço movido por um único: reduzir a quantidade de _decorators_. A implementação do swagger oferecida no [exemplo oficial do NestJs](https://github.com/nestjs/nest/blob/master/sample/11-swagger/src/cats/cats.controller.ts) importa diversos _decorators_ de `@nestjs/swagger`, dentre eles: `@ApiBearerAuth()`, `@ApiOperation()`, `@ApiResponse()` e outros, e todos devem utilizados no controller. Nesse rítmo as rotas em um controller terão espaçamentos absurdos se a API for bem documentada, o que prejudica a legibilidade e manutenção.

Deste sentimento surgiu o _decorator_ `@RouteDoc()`, que recebe um único argumento. A ideia é ter um arquivo `docs.ts` em cada módulo e documentar as rotas neste arquivo utilizando typescript. Abaixo está um exemplo com a documentação da rota de login e sua utilização no **controller**:

`docs.ts`

```ts
export const login: ApiDocumentationOptions = {
  tag: ['Auth'],
  summary: 'Endpoint to authenticate a user',
  description: 'Endpoint allows a user to authenticate and access protected resources on the application',
  headers: [
    {
      name: 'Content-Type',
      description: 'The content type of the request body',
      required: true,
      schema: {
        type: 'string',
        example: 'application/json',
      },
    },
  ],
  requestBody: {
    schema: {
      type: 'object',
      required: ['true'],
      properties: {
        username: {
          type: 'string',
          example: 'john.doe@user.com',
        },
        password: {
          type: 'string',
          example: '{{super-secret-password}}',
        },
      },
    },
  },
  responses: [
    {
      status: HttpStatus.OK,
      description: 'Login operation was successful and the cookies have been returned',
      headers: {
        'Set-Cookie': {
          description: 'JWT access_token cookie',
          schema: {
            type: 'string',
          },
        },
        'Set-Cookie-Refresh': {
          description: 'JWT refresh_token cookie',
          schema: {
            type: 'string',
          },
        },
      },
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'success',
          },
        },
      },
    },
    { ...errorTemplates[HttpStatus.UNAUTHORIZED] },
    {
      ...errorTemplates[HttpStatus.UNSUPPORTED_MEDIA_TYPE],
    },
  ],
};
```

`controller.ts`

```ts
@RouteDoc(docs.login)
```

Os controllers ficam simples e legíveis, as informações são controladas e a documentação é concentrada em um arquivo dedicado para este propósito!

# Explore o projeto

Há diversas outras implementações interessantes neste boilerplate e outras estão por vir, sinta-se à vontade para clonar, testar, adaptar e usar este projeto como referência ou ponto de partida.
