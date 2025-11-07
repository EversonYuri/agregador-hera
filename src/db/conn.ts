import mariadb from 'mariadb'

export async function openConnection(host: string, name: string = ''): Promise<mariadb.PoolConnection | any> {

    const pool = mariadb.createPool({
        host,
        user: 'root',
        password: '240190',
        port: 3306,
        connectionLimit: 5,
        queryTimeout: 10000,
        connectTimeout: 10000,
        multipleStatements: true,
    })

    //@ts-ignore
    pool.on('error', (err) => { console.error(`Pool emitted error  ${name} ${host}:`, err) });

    const conn = await pool.getConnection()

    const query = async (query: string) => {
        try {
            let result = await conn.query(query)
            return result
        } catch (error) {
            try {
                console.error(`Erro na query no ${name} ${host} refazendo a query`);
                let result2 = await conn.query(query)
                return result2
            } catch (error) {
                console.error(`Erro na query no ${name} ${host}: `, query, error);
                return undefined
            }
        }
    }

    return { query, release: conn.release }
}