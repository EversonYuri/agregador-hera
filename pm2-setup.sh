#!/bin/bash

# PM2 Setup Script for Agregador Hera
# This script helps set up PM2 to manage the bun serve process

echo "Setting up PM2 for Agregador Hera..."

# Check if Node.js is installed (required for PM2)
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js is already installed ($(node --version))."
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing PM2..."
    npm install -g pm2
else
    echo "PM2 is already installed."
fi

# Ensure logs directory exists
mkdir -p logs

# Stop existing processes if running
echo "Stopping existing PM2 processes..."
pm2 stop ecosystem.json 2>/dev/null || true
pm2 delete ecosystem.json 2>/dev/null || true

# Start the processes
echo "Starting PM2 processes from ecosystem.json..."
# Uncomment one of the following lines:
pm2 start ecosystem.json --only agregador_serve  # Start only the serve process
# pm2 start ecosystem.json  # Start all processes

# Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on system boot
echo "Setting up PM2 to start on system boot..."
pm2 startup

echo ""
echo "PM2 setup complete!"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check process status"
echo "  pm2 logs agregador_serve - View serve logs"
echo "  pm2 logs agregador_hera  - View main process logs"
echo "  pm2 restart agregador_serve - Restart serve process"
echo "  pm2 stop agregador_serve    - Stop serve process"
echo "  pm2 monit                - Monitor processes"

