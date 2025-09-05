import mariadb from 'mariadb'

const conn = await mariadb.createPool({
    host: '26.56.195.196',
    user: 'root',
    password: '240190',
    port: 3306,
    connectionLimit: 5
}).getConnection().catch((error) => {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
});

const notas = await conn.execute('select numero_nfce from `pdv`.ecf_venda_cabecalho evc where evc.DATA_HORA_VENDA between "2025-08-01 00:00:00.000" and "2025-08-30 00:00:00.000" and evc.NUMERO_NFCE <> 0 and retorno_nfce = "Autorizado o uso da NF-e" order by numero_nfce')

let missingNumbers = []
let previousNumber = notas[0].numero_nfce;

for (let i = 0; previousNumber <= notas[notas.length - 2].numero_nfce; i++) {
    let nextNumber = notas.filter((nota: any) => nota.numero_nfce ===  previousNumber + 1);

    if (nextNumber.length < 1) missingNumbers.push(previousNumber + 1);
    previousNumber = previousNumber + 1;
}

console.log("Missing numbers:", missingNumbers);