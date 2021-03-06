import Conta from "App/Models/Conta"
import Despesa from "App/Models/Despesa"

export default class DespesaService {
  public static async criar(
    valorDespesa: number,
    dataPagamento: Date,
    dataPagamentoEsperado: Date,
    contaId: number,
    tipoDespesaId: number
  ){
    const despesa = new Despesa()
    despesa.valorDespesa = valorDespesa
    despesa.dataPagamento = dataPagamento
    despesa.dataPagamentoEsperado = dataPagamentoEsperado
    despesa.contaId = contaId
    despesa.tipoDespesaId = tipoDespesaId
    await despesa.save()

    const conta = await Conta.findOrFail(despesa.contaId)
    conta.saldo -= despesa.valorDespesa
    await conta.save()

    return despesa
  }

  public static async total() {
    let valorTotal = 0
    const despesas = await Despesa.all()
    despesas.forEach(despesa => {
      valorTotal += despesa.valorDespesa
    });
    return valorTotal
  }

  public static async listar(
    dataInicial: Date,
    dataFinal: Date,
    tipoDespesa: number
  ){
    const despesas = await Despesa
      .query()
      .preload('tipoDespesa')
      .where((query) => {
        if( dataInicial && dataFinal ) {
          query
            .where('dataPagamento', '>=', dataInicial)
            .andWhere('dataPagamento', '<=', dataFinal)
        }
        if ( tipoDespesa ) {
          query
            .where('tipoDespesaId', tipoDespesa)
        }
      })
    return despesas
  }

  public static async remove(
    id: number,
  ){
    const despesa = await Despesa.findOrFail(id)
    const conta = await Conta.findOrFail(despesa.contaId)
    conta.saldo = conta.saldo + despesa.valorDespesa
    await conta.save()

    await Despesa.query().where('id', id).delete()
  }

  public static async editar(
    id: number,
    valorDespesa: number,
    dataPagamento: Date,
    dataPagamentoEsperado: Date,
    contaId: number,
    tipoDespesaId: number
  ){
    const despesa = await Despesa.findOrFail(id)
    const valorDespesaAntigo = despesa.valorDespesa

    despesa.valorDespesa = valorDespesa
    despesa.dataPagamento = dataPagamento
    despesa.dataPagamentoEsperado = dataPagamentoEsperado
    despesa.contaId = contaId
    despesa.tipoDespesaId = tipoDespesaId
    await despesa.save()

    const conta = await Conta.findOrFail(despesa.contaId)
    conta.saldo = conta.saldo - (despesa.valorDespesa - valorDespesaAntigo)
    await conta.save()

    return despesa
  }
}
