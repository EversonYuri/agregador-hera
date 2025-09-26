import mariadb from 'mariadb'

export async function openConnection(host: string): Promise<mariadb.PoolConnection | any> {

    const pool = mariadb.createPool({
        host,
        user: 'root',
        password: '240190',
        port: 3306,
        connectionLimit: 5,
        queryTimeout: 6000,
        connectTimeout: 6000
    })

    //@ts-ignore
    pool.on('error', (err) => {
        console.error('Pool emitted error:', err);
    });

    const conn = await pool.getConnection()

    const query = async (query: string) => {
        try {
            let result = await conn.execute(query)
            result = Array.isArray(result) ? [...result] : [];

            return result
        } catch (error) { console.error("Erro na query:", error); return undefined }
    }

    return { query, release: conn.release }

}