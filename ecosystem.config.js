export default {
    apps: [{
      name: 'agro-server',
      script: 'bun',
      args: 'run index.ts',
      cwd: 'C:\\CODE\\agro-server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      env: {
        NODE_ENV: 'production'
      }
    }]
}