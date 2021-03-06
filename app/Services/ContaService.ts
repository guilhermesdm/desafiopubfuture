import Conta from "App/Models/Conta"

export default class ContaService {
  public static async criar(tipoContaId: number, instituicao: string) {
    const conta = new Conta()
    conta.saldo = 0;
    conta.tipoContaId = tipoContaId;
    conta.instituicao = instituicao;
    await conta.save()
    return conta
  }

  public static async listar(){
    const contas = await Conta
      .query()
      .preload('tipoConta')
      .preload('despesas')
      .preload('receitas')
    return contas
  }

  public static async total() {
    let valorTotal = 0
    const saldoConta = await Conta.all()
    saldoConta.forEach(conta => {
      valorTotal += conta.saldo
    });
    return valorTotal
  }

  public static async listarUm(
    id: number
  ){
    const contas = await Conta
      .query()
      .where('id', id)
      .preload('tipoConta')
      .preload('despesas')
      .preload('receitas')
    return contas
  }

  public static async remove(id: number) {
    await Conta.query().where('id', id).delete()
  }

  public static async editar(
    id: number,
    tipoContaId: number,
    instituicao: string
  ){
    const conta = await Conta.findOrFail(id)
    conta.tipoContaId = tipoContaId;
    conta.instituicao = instituicao;
    await conta.save()
    return conta
  }

  public static async transferir(
    id: number,
    contaId: number,
    saldo: number
  ){
    const conta = await Conta.findOrFail(id)
    const contaAlvo = await Conta.findOrFail(contaId)
    if (conta.saldo >= saldo) {
      conta.saldo = conta.saldo - saldo
      contaAlvo.saldo = contaAlvo.saldo + saldo
      await conta.save()
      await contaAlvo.save()
    } else {
      throw new Error('Saldo insuficiente')
    }
  }
}
