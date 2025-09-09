import mariadb from 'mariadb'

export async function openConnection(host: string): Promise<mariadb.PoolConnection> {
    return await mariadb.createPool({
        host,
        user: 'root',
        password: '240190',
        port: 3306,
        connectionLimit: 5
    })
        .getConnection()
}