import { openConnection } from "./db/conn";
import { checkPort } from "./net";

export async function gatherBasicMachineInfo(machine: Record<string, any>) {
    try {
        if (Array.isArray(machine.groups)) {
            let group = machine.groups.filter((group: any) => group.name !== 'All' && group.name !== 'cliente')[0];
            machine.group = group ? group.name : 'ALL';
        }

        machine.isServer = await checkPort(machine.ip as string, 8080);
        machine.isDatabase = await checkPort(machine.ip as string, 3306);

        if (machine.isDatabase) {
            const { query, release } = await openConnection(machine.ip)

            if (machine.isServer && await query("SHOW DATABASES LIKE 'database'").then((rows: any) => rows.length > 0)) {
                machine.serverInfo = await query("select e.CNPJ, e.RAZAO_SOCIAL, c.varsaoSistema as versaoSistema from `database`.empresabean e join `database`.configuracaobean c")
            }

            machine.isPDV = await query("SHOW DATABASES LIKE 'pdv'")
                .then((rows: any) => rows.length > 0);

            if (machine.isPDV) {
                machine.notasRejeitadas = await query("SELECT * from pdv.ecf_venda_cabecalho where `STATUS_NFCE` = 2");
                machine.pdvInfo = await query("select ec2.TIPO_APLICATIVO, ec.NOME, ec2.versao, case when ec2.SERVIDOR_NFCE = 2 then 'NS A1' when ec2.SERVIDOR_NFCE = 3 then 'NS A3' when ec2.SERVIDOR_NFCE = 4 then 'EMISSOR HERA' end as SERVIDOR_NFCE from pdv.ecf_configuracao ec2 join pdv.ecf_caixa ec;")
                machine.NCMIncorretos = await query("SELECT DISTINCT d.GTIN, d.DESCRICAO FROM pdv.ecf_venda_detalhe d JOIN pdv.ecf_venda_cabecalho c ON d.ID_ECF_VENDA_CABECALHO = c.ID WHERE INSTR(CONVERT(c.RETORNO_NFCE USING latin1), 'Rejeição: Informado NCM inexistente [nItem:') > 0 AND d.ITEM = SUBSTRING(CONVERT(c.RETORNO_NFCE USING latin1), INSTR(CONVERT(c.RETORNO_NFCE USING latin1), '[nItem:') + 7, INSTR(CONVERT(c.RETORNO_NFCE USING latin1), ']') - INSTR(CONVERT(c.RETORNO_NFCE USING latin1), '[nItem:') - 7)")
                machine.notasDuplicidade = await query("SELECT * FROM pdv.ecf_venda_cabecalho WHERE INSTR(CONVERT(RETORNO_NFCE USING cp850), 'Duplicidade de NF-e') > 0")
            }

            release()
        } else machine.isPDV = false;
        
    } catch (error) { console.error(`Erro ao conectar na base de dados do IP ${machine.ip}:`, error) }
    return machine
}