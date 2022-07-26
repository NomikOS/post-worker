module.exports = {
  apps: [
    {
      cwd: '/home/webadmin/www/production/post-worker/current',
      name: 'post-worker',
      script: 'yarn',
      args: 'startp',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '100M',
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
