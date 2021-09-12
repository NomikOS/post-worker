module.exports = {
  apps: [
    {
      cwd: '/home/webadmin/www/testing/post-worker/current',
      name: 'post-worker',
      script: 'yarn',
      args: 'startt',
      listen_timeout: 5000,
      wait_ready: true,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '150M',
      watch: false,
      env_testing: {
        NODE_ENV: 'testing'
      }
    }
  ]
}
