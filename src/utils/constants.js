// Valores fixos reutilizados em várias partes do sistema.
const PERFIS_TECNICOS = ['TI', 'SUPERVISOR'];
const STATUS_CHAMADO = ['Aberto', 'Em Andamento', 'Fechado'];
const PRIORIDADES = ['Baixa', 'Média', 'Alta'];
const ILHAS = Array.from({ length: 10 }, (_, index) => `Ilha ${index + 1}`);

module.exports = {
  PERFIS_TECNICOS,
  STATUS_CHAMADO,
  PRIORIDADES,
  ILHAS,
};
