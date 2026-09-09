# Manual do Administrador de Organização — Nexa

Este manual é para quem gere uma **organização no Nexa** — o seu nome e os seus
membros — a partir da página **Definições** dentro da aplicação. Não é sobre
implementar ou operar a plataforma Nexa em si; para isso, consulta
[PLATFORM_ADMIN.md](../PLATFORM_ADMIN.md) (técnico, apenas em inglês).

## Papéis

Cada pessoa numa organização tem exatamente um papel **nessa organização** (alguém em
duas organizações pode ter um papel diferente em cada uma):

| Papel | Pode fazer |
|---|---|
| **Member** | Tudo o que está no [Manual do Utilizador](../user-guide/pt.md): contactos, empresas, negócios, atividades, tarefas, email, automações, segmentos, campanhas. Não pode abrir Definições. |
| **Admin** | Tudo o que um Member pode, mais: renomear a organização, adicionar/remover membros, mudar o papel dos membros. |
| **Owner** | Tudo o que um Admin pode. A única diferença face a Admin hoje é a proteção "pelo menos um Owner" descrita abaixo. |

## Renomear a organização

Definições → o campo do nome no topo → altera → **Guardar**. Tem efeito imediato em
todos os sítios onde o nome da organização é mostrado.

## Adicionar um membro

Definições → **Adicionar membro** → indica o email e escolhe um papel (por defeito
**Member**) → **Adicionar**.

**A pessoa já precisa de ter conta no Nexa.** Atualmente não há convite por email —
se ainda não se registou, pede-lhe para criar conta primeiro (vê a secção "Iniciar
sessão" do Manual do Utilizador), e depois adiciona-a por esse email. Se tentares
adicionar alguém sem conta, vais receber um erro a indicar isso.

## Mudar o papel de um membro

Definições → encontra a linha do membro → usa o menu do papel junto ao nome → escolhe
o novo papel. Tem efeito imediato — sem passo de confirmação, sem botão de guardar.

## Remover um membro

Definições → encontra a linha do membro → **Remover**. Isto remove apenas o acesso a
esta organização; não elimina a conta Nexa da pessoa nem afeta qualquer outra
organização a que pertença. A remoção é imediata e não há desfazer — se removeres
alguém por engano, terás de o adicionar de novo.

## A regra "pelo menos um Owner"

Uma organização nunca pode ficar com zero Owners: não podes despromover o último
Owner para Admin/Member, nem podes remover o último Owner. Se precisares de passar a
posse a outra pessoa, promove primeiro outra pessoa a Owner, e só depois muda o teu
próprio papel ou remove-te.

## O que as Definições *não* cobrem

- **Configuração SMTP / envio de email** — é definida uma vez ao nível da
  plataforma para toda a instância, não por organização, e não está exposta na
  interface. Se o envio de email não estiver a funcionar para a tua organização,
  contacta quem opera a tua instância do Nexa (vê
  [PLATFORM_ADMIN.md](../PLATFORM_ADMIN.md)).
- **Faturação / limites de plano** — ainda não existem; todas as organizações têm
  acesso total e ilimitado a todos os módulos.
- **Eliminar a própria organização** — não disponível na interface por agora.
