# Manual do Administrador de Organização — Continuo

Este manual é para quem gere uma **organização no Continuo** — o seu nome e os seus
membros — a partir da página **Definições** dentro da aplicação. Não é sobre
implementar ou operar a plataforma Continuo em si; para isso, consulta
[PLATFORM_ADMIN.md](../PLATFORM_ADMIN.md) (técnico, apenas em inglês).

## Papéis

Cada pessoa numa organização tem exatamente um papel **nessa organização** (alguém em
duas organizações pode ter um papel diferente em cada uma):

| Papel | Pode fazer |
|---|---|
| **Member** | Tudo o que está no [Manual do Utilizador](../user-guide/pt.md): contactos, empresas, negócios, atividades, tarefas, email, automações, segmentos, campanhas. Pode ver o Lixo mas não restaurar a partir dele. Não pode abrir Definições. |
| **Admin** | Tudo o que um Member pode, mais: renomear a organização, configurar o SMTP, adicionar/remover membros, mudar o papel dos membros, restaurar itens do Lixo. |
| **Owner** | Tudo o que um Admin pode, mais: eliminar a própria organização. A única outra diferença face a Admin é a proteção "pelo menos um Owner" descrita abaixo. |

## Renomear a organização

Definições → o campo do nome no topo → altera → **Guardar**. Tem efeito imediato em
todos os sítios onde o nome da organização é mostrado.

## Email de saída (SMTP)

Definições → **Email de saída (SMTP)**. Cada organização configura a sua própria
conta SMTP — não há caixa de correio partilhada da plataforma, por isso **o Email e
as Campanhas não enviam enquanto isto não estiver configurado**: servidor, porta,
utilizador, password e endereço de envio ("from"), mais se deve usar TLS. Quem gere
a caixa de correio da tua organização (TI, painel do teu fornecedor de email) pode
dar-te estes dados — os mesmos que usarias em qualquer cliente de email.

Deixa o campo da password em branco ao guardar outras alterações para manter a
password atual; só escreve uma nova quando realmente a queres mudar.

## Adicionar um membro

Definições → **Adicionar membro** → indica o email e escolhe um papel (por defeito
**Member**) → **Adicionar**.

**A pessoa já precisa de ter conta no Continuo.** Atualmente não há convite por email —
se ainda não se registou, pede-lhe para criar conta primeiro (vê a secção "Iniciar
sessão" do Manual do Utilizador), e depois adiciona-a por esse email. Se tentares
adicionar alguém sem conta, vais receber um erro a indicar isso.

## Mudar o papel de um membro

Definições → encontra a linha do membro → usa o menu do papel junto ao nome → escolhe
o novo papel. Tem efeito imediato — sem passo de confirmação, sem botão de guardar.

## Remover um membro

Definições → encontra a linha do membro → **Remover**. Isto remove apenas o acesso a
esta organização; não elimina a conta Continuo da pessoa nem afeta qualquer outra
organização a que pertença. Não é logo definitivo — vê
[Lixo](#lixo-recuperar-coisas-eliminadas) abaixo — e voltar a adicionar a pessoa pelo
mesmo email (Definições → Adicionar membro) restaura exatamente o papel que tinha
antes, em vez de começar do zero.

## A regra "pelo menos um Owner"

Uma organização nunca pode ficar com zero Owners: não podes despromover o último
Owner para Admin/Member, nem podes remover o último Owner. Se precisares de passar a
posse a outra pessoa, promove primeiro outra pessoa a Owner, e só depois muda o teu
próprio papel ou remove-te.

## Lixo (recuperar coisas eliminadas)

Toda a eliminação no Continuo — um contacto, empresa, negócio, atividade, tarefa,
segmento, automação, campanha ou membro — vai primeiro para o **Lixo** (no menu), e
não diretamente para eliminação definitiva. Fica lá **30 dias**; um OWNER ou ADMIN
pode restaurar a partir dessa página com um clique. Um Member consegue ver o que
está no Lixo mas não pode restaurar nada. Depois de 30 dias, um item que ainda lá
esteja é eliminado definitivamente da próxima vez que alguém abrir a página do Lixo
dessa organização (não há limpeza agendada — só uma verificação sempre que a página
é vista).

## Eliminar a organização

Definições → **Zona de perigo** → **Eliminar organização** (só OWNER, com um
pedido de confirmação). Isto move toda a organização para um estado tipo-lixo:
desaparece da lista de organizações de todos imediatamente, mas **tu** (o Owner que a
eliminou) podes restaurá-la a partir da lista de organizações em `/app` dentro de 30
dias. Depois disso, desaparece definitivamente com tudo o que contém.

## O que as Definições *não* cobrem

- **Faturação / limites de plano** — ainda não existem; todas as organizações têm
  acesso total e ilimitado a todos os módulos.
