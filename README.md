# Sistema de Gestão Veterinária (SGV)

Projeto acadêmico para apoiar a organização de uma clínica veterinária, centralizando tutores, animais, consultas e registros clínicos. Desenvolvido conforme as quatro etapas do trabalho Projeto Web.

## 1. Problema, público e solução
Clínicas veterinárias podem manter dados de tutores, pacientes e atendimentos em planilhas ou registros separados. Isso dificulta localizar históricos e organizar a agenda. O SGV centraliza essas informações em uma aplicação web com autenticação e permissões por perfil.

**Público-alvo:** administradores, recepcionistas e médicos veterinários de clínicas veterinárias.

**Objetivo:** facilitar o cadastro dos tutores e animais, o agendamento de consultas e o registro dos atendimentos.

## 2. Perfis e permissões
- **Administrador:** gerencia usuários, tutores, animais, consultas e registros clínicos.
- **Recepcionista:** gerencia tutores, animais e agenda de consultas.
- **Veterinário:** consulta animais e suas próprias consultas; registra e consulta informações clínicas das consultas sob sua responsabilidade.
- **Tutor:** não é um perfil habilitado nesta versão. Os tutores são cadastrados como registros próprios da clínica, sem conta de acesso.

As permissões são verificadas no back-end por middlewares e regras nas rotas. Ocultar elementos da interface não substitui a validação da API.

## 3. Fluxo básico
1. O administrador cria a primeira conta do sistema.
2. O administrador entra com e-mail e senha.
3. O administrador cadastra recepcionistas e veterinários.
4. A recepção cadastra tutores e animais.
5. A recepção agenda consultas vinculando animal e veterinário.
6. O veterinário visualiza suas consultas e registra descrição, diagnóstico e prescrição.
7. Os usuários consultam os dados permitidos conforme seu perfil.

## 4. Funcionalidades
- Cadastro inicial do administrador e login.
- Cadastro administrativo de usuários recepcionistas e veterinários.
- Senhas protegidas com bcryptjs.
- Autenticação JWT e autorização por perfil.
- CRUD de tutores e animais.
- Agendamento, atualização e cancelamento de consultas.
- Registro clínico por consulta, com edição do registro existente.
- Interface em HTML, CSS e JavaScript usando DOM e Fetch API.
- API REST com validações e respostas de erro.

## 5. Tecnologias
HTML5, CSS3, JavaScript, Node.js, Express, MySQL, mysql2, JWT, bcryptjs, Git e GitHub.

## 6. Estrutura do projeto
```text
sistema-gestao-veterinaria/
├── backend/
│   ├── controllers/
│   ├── database/
│   ├── middlewares/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── css/
│   ├── js/
│   └── páginas HTML
├── sql/
│   ├── sistema_veterinario.sql
│   └── migracao_veterinario_sem_crmv.sql
├── .gitignore
└── README.md
```

## 7. Banco de dados
O script `sql/sistema_veterinario.sql` cria o banco `sistema_veterinario` e as tabelas `usuarios`, `tutores`, `veterinarios`, `animais`, `consultas` e `registros_clinicos`, com chaves primárias, estrangeiras e índices.

**Instalação:** abra `sql/sistema_veterinario.sql` no MySQL Workbench e execute o script. Para uma base criada com versões anteriores do projeto, avalie executar a migração `sql/migracao_veterinario_sem_crmv.sql` uma única vez. Não execute a migração repetidamente sem verificar o estado do banco.

## 8. Instalação e execução
### Pré-requisitos
- Node.js LTS e npm.
- MySQL Server e MySQL Workbench (ou cliente MySQL equivalente).
- Visual Studio Code e extensão Live Server (recomendado).

### Configurar o back-end
No terminal, dentro da pasta do projeto:
```bash
cd backend
npm install
```
Copie `backend/.env.example` para `backend/.env` e preencha as credenciais locais do MySQL. Gere um valor secreto próprio e longo para `JWT_SECRET`. **Não compartilhe nem envie o arquivo `.env` ao GitHub.**

Exemplo de configuração local:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=sistema_veterinario
JWT_SECRET=gere_uma_chave_secreta_longa_e_aleatoria
JWT_EXPIRES_IN=2h
```
Inicie a API: `npm run dev`. A API ficará em `http://localhost:3000`. Teste `http://localhost:3000/api/health`; o retorno deve indicar `database: connected`.

### Abrir o front-end
Abra a pasta `frontend` com Live Server e acesse `login.html`. Mantenha a API em execução no terminal. O endereço padrão da API está em `frontend/js/common.js` e nos scripts de login/cadastro (`http://localhost:3000/api`). Se alterar a porta, atualize essa configuração.

### Primeiro acesso e criação de usuários
1. Com o banco vazio e a API conectada, acesse `cadastro.html` e crie a primeira conta (administrador). O endpoint inicial bloqueia novos cadastros depois que já existe uma conta.
2. Faça login.
3. O administrador pode cadastrar recepcionistas e veterinários pela opção **Usuários** no painel. Veterinários recebem automaticamente seu registro na tabela `veterinarios`.

## 9. Rotas principais da API
Todas as rotas abaixo, exceto `/api/health`, `/api/auth/register` e `/api/auth/login`, exigem `Authorization: Bearer <token>`.

| Método | Rota | Permissão |
|---|---|---|
| GET | `/api/health` | Pública |
| POST | `/api/auth/register` | Primeiro administrador, somente banco vazio |
| POST | `/api/auth/login` | Pública |
| GET | `/api/auth/me` | Usuário autenticado |
| POST | `/api/auth/users` | Administrador |
| GET, POST | `/api/tutores` | Administrador, recepcionista |
| GET, PUT, DELETE | `/api/tutores/:id` | Administrador, recepcionista |
| GET | `/api/animais` e `/api/animais/:id` | Administrador, recepcionista, veterinário |
| POST, PUT | `/api/animais` e `/api/animais/:id` | Administrador, recepcionista |
| DELETE | `/api/animais/:id` | Administrador |
| GET | `/api/veterinarios` | Usuário autenticado com perfil permitido |
| GET | `/api/consultas` | Administrador/recepcionista; veterinário vê somente as próprias |
| POST, PUT, DELETE | `/api/consultas` e `/api/consultas/:id` | Administrador, recepcionista |
| GET, POST | `/api/consultas/:id/registro-clinico` | Administrador; veterinário responsável pela consulta |

## 10. Testes antes da apresentação
- [ ] O MySQL está iniciado e `/api/health` indica banco conectado.
- [ ] Criar o primeiro administrador e realizar login.
- [ ] Tentar cadastrar outro administrador pelo cadastro público e confirmar que é bloqueado.
- [ ] Criar uma recepcionista e um veterinário pela rota administrativa.
- [ ] Cadastrar tutor e animal.
- [ ] Testar inclusão, listagem, edição e exclusão de tutor/animal.
- [ ] Agendar, editar e cancelar consulta.
- [ ] Registrar e consultar informações clínicas com o veterinário responsável.
- [ ] Confirmar que um veterinário não vê consultas de outro veterinário.
- [ ] Confirmar que uma requisição sem token recebe 401 e uma ação sem permissão recebe 403.
- [ ] Conferir erros de validação e tentar excluir registros que possuem histórico.

## 11. Organização no GitHub
Use um único repositório para as quatro entregas e registre a evolução com commits reais e pequenos. Exemplo de mensagens: `docs: apresenta problema e proposta`; `feat: cria banco e autenticação`; `feat: implementa CRUD e integração`; `docs: finaliza documentação e roteiro`. Não envie `node_modules`, `.env`, senhas ou tokens.

## 12. Relação com as quatro entregas
- **Entrega 1:** problema, público, solução, funcionalidades, perfis, fluxo e estrutura inicial documentados.
- **Entrega 2:** banco relacional, script SQL, cadastro/login, bcrypt, JWT e middlewares.
- **Entrega 3:** CRUD, interface, manipulação do DOM, Fetch, API REST e permissões verificadas no servidor.
- **Entrega 4:** integração do sistema, consultas, registros clínicos, validações, tratamento de erros, documentação e demonstração.

## 13. Limites e observações
Este é um projeto acadêmico. A execução integral depende de configurar o MySQL, instalar as dependências e testar os fluxos no computador de apresentação. A verificação automatizada de sintaxe não substitui os testes funcionais com o banco real. Não utilize dados pessoais ou clínicos reais sem revisão de segurança, privacidade, backups e adequação à LGPD.
