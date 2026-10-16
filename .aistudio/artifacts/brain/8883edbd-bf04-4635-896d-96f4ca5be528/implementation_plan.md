# Gestão de Estrutura de Unidades com Drag and Drop Hierárquico

Implementação da reorganização visual e interativa das Áreas e Cargos vinculados a um Órgão na modal "Estrutura de Unidades", permitindo reordenar Áreas (carregando todos os seus cargos juntos) e reordenar ou transferir Cargos entre Áreas com drag-and-drop e salvamento automático.

### Decisões Confirmadas & Respostas do Usuário

> [!IMPORTANT]
> Decisões alinhadas com o usuário durante a fase de esclarecimento:
> - **Transferência de Cargos**: Ao arrastar um Cargo, ele poderá tanto ser reordenado dentro da mesma Área quanto transferido entre Áreas diferentes do Órgão.
> - **Visual & Interação**: Lista hierárquica vertical com alças de arraste (`GripVertical`), exibição clara de hierarquia e áreas de soltura (drop zones) bem delimitadas.
> - **Salvamento**: Salvamento automático instantâneo no estado da aplicação com notificação visual rápida (toast/aviso sutil) confirmando a persistência da reorganização.

---

### 1. Visão Geral & Conceito

- **Objetivo**: Proporcionar aos gestores do SGN uma interface ágil e intuitiva para organizar organogramas e unidades administrativas diretamente pela tela de "Gestão de Órgãos", no botão "Gestão de Estrutura".
- **Comportamento Chave**:
  1. Ao abrir "Estrutura de Unidades", são listadas em ordem vertical todas as Áreas pertencentes ao Órgão selecionado.
  2. Dentro de cada Área, são listados todos os seus Cargos vinculados (com distinção visual de cargos gestores e técnicos).
  3. Ao arrastar uma Área pela alça de arraste, todos os seus cargos permanecem vinculados e acompanham a Área para sua nova posição ordinal.
  4. Ao arrastar um Cargo, o usuário pode soltá-lo em uma nova posição na mesma Área ou soltá-lo em outra Área, atualizando seu vínculo imediatamente (`idArea = novaArea.id`).

---

### 2. Experiência do Usuário & Design Visual

- **Layout e Composição**:
  - Modal ampla e centralizada (`max-w-4xl`), com cabeçalho contextual exibindo a sigla e descrição do Órgão.
  - Barra de ações superior na modal com contador de Áreas e Cargos, botão de "Nova Área" e indicador discreto de status de sincronização ("Sincronizado automaticamente").
  - Cada cartão de Área possui:
    - Alça de arraste lateral (`GripVertical`) com cursor `cursor-grab` / `cursor-grabbing`.
    - Identificador visual da Área (Sigla, Nome, contador de cargos vinculados).
    - Botões rápidos de gestão ("Editar Área", "Excluir Área", "+ Adicionar Cargo").
    - Área interna com container droppable para cargos.
  - Cada item de Cargo possui:
    - Alça de arraste exclusiva para movimentação ágil.
    - Indicador de nível/gestor (badge sutil e ponto de distinção).
    - Ações rápidas de edição e exclusão.
- **Feedback Visual de Arraste**:
  - `opacity-40` e borda pontilhada no elemento original durante o arraste.
  - Linha guia ou contorno azul suave (`border-blue-500 bg-blue-50/40`) na área ou cargo de destino indicando onde o item será inserido.
  - Micro-animações suaves de acomodação via Tailwind transitions.
  - Banner/aviso toast flutuante no topo da modal confirmando movimentações: *"Área reposicionada"* ou *"Cargo transferido para [Nome da Área]"*.

---

### 3. Decisões do Produto & Trade-Offs

- **API Nativa de Drag and Drop (HTML5 DataTransfer)**:
  - *Abordagem*: Utilização de eventos nativos HTML5 (`onDragStart`, `onDragOver`, `onDragLeave`, `onDrop`) com tipagem rígida TypeScript e identificação de tipo (`data-type="area"` vs `data-type="cargo"`).
  - *Motivo*: Compatibilidade perfeita com React 19, zero dependências externas adicionais, desempenho ultrarrápido a 60fps sem sobrecarga de bundle e controle total de posicionamento.
- **Vínculo Imutável de Cargos ao Mover Áreas**:
  - Como os cargos estão vinculados por chave relacional (`cargo.idArea === area.id`), a reordenação das Áreas no array `areasList` move instantaneamente toda a estrutura de cargos em bloco, garantindo integridade referencial estrita.
- **Transferência Inter-Áreas de Cargos**:
  - Ao soltar um cargo em uma área diferente, o campo `idArea` do cargo é atualizado para a área de destino, garantindo que o novo relacionamento persista no estado global de cargos (`cargosList`).

---

### 4. Arquitetura Técnica & Estratégia de Dados

#### Diagrama de Componentes e Fluxo de Arraste

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Modal: Estrutura de Unidades                    │
│                                                                        │
│  [ Header: Órgão Selecionado ]              [ + Nova Área ]            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─ Área (Draggable: tipo 'AREA') ──────────────────────────────────┐  │
│  │ [:: Grip]  Área 1: Gestão Hospitalar (GH)   (2 cargos)           │  │
│  │ ┌──────────────────────────────────────────────────────────────┐ │  │
│  │ │ Drop Zone de Cargos (Aceita Cargo)                           │ │  │
│  │ │  • [:: Grip] Cargo: Diretor [DIR] (Gestor)  (Draggable CARGO)│ │  │
│  │ │  • [:: Grip] Cargo: Gerente [GER]           (Draggable CARGO)│ │  │
│  │ └──────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                  ↕                                     │
│  ┌─ Área (Draggable: tipo 'AREA') ──────────────────────────────────┐  │
│  │ [:: Grip]  Área 2: Vigilância Sanitária (VS)   (1 cargo)         │  │
│  │ ┌──────────────────────────────────────────────────────────────┐ │  │
│  │ │ Drop Zone de Cargos (Aceita Cargo)                           │ │  │
│  │ │  • [:: Grip] Cargo: Assessor Técnico [AT]   (Draggable CARGO)│ │  │
│  │ └──────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [ Toast Feedback: "Posições e vínculos atualizados automaticamente" ] │
└────────────────────────────────────────────────────────────────────────┘
```

#### Modelo de Estado e Mutadores

1. **Estado de Arraste**:
   - `draggedItem`: `{ type: 'AREA' | 'CARGO', id: string, sourceAreaId?: string } | null`
   - `dragOverTarget`: `{ type: 'AREA' | 'CARGO', id: string, areaId?: string } | null`
   - `structureNotification`: mensagem temporária com feedback de ação executada.
2. **Manipuladores de Eventos**:
   - `handleAreaDrop(targetAreaId: string)`: Reordena as Áreas do órgão mantendo suas posições relativas.
   - `handleCargoDrop(targetCargoId: string | null, targetAreaId: string)`:
     - Se `targetCargoId` fornecido: insere o cargo na posição ordinal exata e atualiza `idArea = targetAreaId`.
     - Se solto no corpo vazio da Área: anexa o cargo ao final dos cargos daquela área.
3. **Persistência**:
   - Atualiza `setAreasList` e `setCargosList` em lote, sincronizando automaticamente toda a visualização do sistema.
