# Manual do Utilizador — Continuo

O Continuo é o CRM da tua equipa: contactos, empresas, negócios, atividades, tarefas,
email e automações, tudo num só lugar. Este manual cobre o uso do dia a dia. Para
gerir a organização em si (membros, papéis), consulta o
[Manual do Administrador](../admin-guide/pt.md).

## Iniciar sessão

Vai ao endereço da aplicação e inicia sessão com o teu email e password. Se ainda não
tens conta, usa "Ainda não tens conta? Regista-te" — vais receber um email de
confirmação para validares o teu endereço antes de conseguires entrar.

**Esqueceste-te da password?** Clica em "Esqueceste-te da password?" no ecrã de
login, indica o teu email e segue o link que recebes. O link expira ao fim de algum
tempo — se deixar de funcionar, pede simplesmente um novo.

**Mudar de idioma:** usa o seletor de idioma no canto superior direito da aplicação.
A escolha fica guardada neste dispositivo/browser; não muda o endereço web.

## Escolher uma organização

Se pertences a mais do que uma organização, ao iniciares sessão vês uma lista —
escolhe "Abrir" na organização em que queres trabalhar. Tudo o que vês e fazes a
partir daí está limitado a essa organização; os dados de outras organizações nunca
são visíveis.

## Painel principal

A primeira coisa que vês dentro de uma organização: contagem de contactos e empresas,
valor e número de negócios abertos, valor total ganho, o teu pipeline por estágio,
tarefas pendentes e atrasadas, número de campanhas, e um feed de atividade recente.

## Contactos

Pessoas. Cada contacto tem nome próprio (obrigatório), apelido, email, telefone,
opcionalmente uma empresa associada, um idioma preferido, e uma cidade/cantão
(cantões suíços — úteis para os filtros geográficos em Segmentos). Criar um contacto
é um pequeno assistente de 2 passos: primeiro os dados básicos, depois os detalhes
opcionais. Clica em **Editar** em qualquer contacto para o alterares mais tarde.

**Importar vários de uma vez:** usa **Importar CSV** por cima da lista de contactos.
A primeira linha tem de ser o cabeçalho; só `firstName` é obrigatório. `company` é
associada por nome exato a uma empresa existente (fica em branco se não houver
correspondência — nunca cria uma empresa por ti). Vês quantas linhas foram
importadas e o motivo de qualquer falha.

Eliminar um contacto não é logo permanente — vê [Lixo](#lixo) mais abaixo.

## Empresas

Organizações com quem fazes negócio. Uma empresa tem um nome e, opcionalmente, um
domínio de website. Associar contactos e negócios a uma empresa permite ver tudo o
que está relacionado com essa empresa num só sítio.

## Negócios

Uma oportunidade de venda: um título, um valor opcional e um estágio. O pipeline tem
seis estágios:

**Lead → Qualificado → Proposta → Negociação → Ganho / Perdido**

Move um negócio entre estágios à medida que avança. A tabela de pipeline do painel
principal e os totais de aberto/ganho atualizam-se automaticamente. Um negócio pode,
opcionalmente, estar associado a um contacto e/ou a uma empresa.

## Atividades

Um registo associado a um contacto, empresa e/ou negócio: uma **Chamada**, **Email**,
**Reunião** ou **Nota**, com conteúdo livre e data/hora. As atividades são o
histórico de tudo o que aconteceu — não disparam automações por si só (as automações
reagem a contactos *criados*, negócios que *mudam de estágio* e tarefas
*concluídas*, não a atividades registadas).

## Tarefas

Uma tarefa com um título, uma data limite opcional, e um estado (**Pendente** /
**Concluída**). Podem estar associadas a um contacto, empresa e/ou negócio, e
atribuídas a um membro específico da organização. Tarefas pendentes atrasadas são
destacadas no painel principal.

## Email

Envia um email pontual a um contacto — opcionalmente associado a um negócio
específico, para aparecer no contexto desse negócio — através da conta de email
configurada para a tua organização. Todos os envios (com sucesso ou falhados) ficam
registados com o assunto, destinatário e data/hora, para teres sempre um registo do
que foi enviado e quando.

> O envio requer que a conta SMTP da própria organização esteja configurada em
> Definições — consulta o [Manual do Administrador](../admin-guide/pt.md) ou
> contacta um administrador da organização se o envio não estiver a funcionar.

## Automações

Regras "quando acontece X, faz Y" que correm automaticamente — sem qualquer passo
manual depois de configuradas.

**Gatilhos:** um contacto é criado · o estágio de um negócio muda · uma tarefa é
concluída.

**Ações** (uma automação pode correr mais do que uma, por ordem): criar uma tarefa ·
registar uma atividade · enviar um email.

Cada automação tem um nome, pode ser ativada ou desativada independentemente, e
mantém um registo de execuções — sempre que dispara podes ver se cada uma das suas
ações teve sucesso ou falhou, e porquê.

## Segmentos

Um filtro guardado e reutilizável sobre os teus contactos — por empresa, se têm
email, intervalo de datas de criação, cantão suíço ou cidade (por exemplo, "contactos
na Acme Corp com email" ou "contactos em Genebra"). Um segmento não é uma lista fixa:
é recalculado sempre que é usado, por isso reflete sempre os teus contactos atuais.
Os segmentos existem principalmente para alimentar Campanhas (ver abaixo), mas a
mesma lógica de filtro é reutilizável em qualquer sítio onde uma lista de contactos
direcionada seja útil.

## Campanhas

Um email em massa enviado a um segmento — ou a "todos com email" se não escolheres
um segmento. Uma campanha tem um assunto e um corpo de mensagem; depois de enviada,
vês quantos destinatários tiveram sucesso e quantos falharam, com o erro específico
de cada falha. As campanhas são de disparo único: depois de enviada, o estado passa
de **Rascunho** a **A enviar** a **Enviada**, e não pode ser reenviada como a mesma
campanha.

## Lixo

Eliminar um contacto, empresa, negócio, atividade, tarefa, segmento, automação ou
campanha não os remove logo — vão para o **Lixo**, onde ficam **30 dias** e podem
ser restaurados por um OWNER ou ADMIN da organização. Depois de 30 dias, desaparecem
definitivamente. Se eliminaste algo por engano, pede a um administrador para
restaurar a partir do **Lixo** no menu — ou faz isso tu mesmo, se tiveres esse papel.

## Dicas

- Todas as listas estão limitadas à tua organização atual; mudar de organização
  (através do link "Abrir" na lista de organizações) muda tudo o que vês.
- Se algo que esperas ver estiver em falta, confirma que estás na organização certa,
  que o teu papel tem acesso a isso (consulta o
  [Manual do Administrador](../admin-guide/pt.md) para saber o que cada papel pode
  fazer), e que não está no Lixo.
