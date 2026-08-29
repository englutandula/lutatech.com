#!/bin/bash
set -e
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "=== 1. Setting up Swap Space (2GB) for AI Model Stability ==="
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "=== 2. Installing Docker and Git ==="
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y docker.io docker-compose-v2 git

systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

echo "=== 3. Cloning Luta Studio ==="
cd /home/ubuntu
if [ ! -d "luta-studio" ]; then
    git clone https://github.com/englutandula/Luta-Studio-web-.git luta-studio
fi
chown -R ubuntu:ubuntu /home/ubuntu/luta-studio

echo "=== 4. Starting Luta Studio via Docker Compose ==="
cd /home/ubuntu/luta-studio
docker compose up -d --build

echo "=== 5. Deployment Complete! Luta Studio running on port 8000 ==="
