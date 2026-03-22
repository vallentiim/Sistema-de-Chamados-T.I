// Define quantas horas cada prioridade possui até o vencimento do SLA.
const HOURS_BY_PRIORITY = {
  Alta: 4,
  Média: 8,
  Baixa: 24,
};

// Calcula a data limite do chamado a partir da prioridade escolhida.
function calcularSLA(prioridade) {
  const horas = HOURS_BY_PRIORITY[prioridade] ?? HOURS_BY_PRIORITY.Baixa;
  const data = new Date();
  data.setHours(data.getHours() + horas);
  return data;
}

module.exports = {
  calcularSLA,
};
