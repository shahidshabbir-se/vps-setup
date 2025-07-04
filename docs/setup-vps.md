# VPS Setup

If you want to set up a production ready VPS, there are a few steps you should take.

This document goes through the list of steps that I personally take.


## 1. Create a New User with Sudo Permissions
```
# Log in as root
ssh root@your-server-ip

# Create a new user
adduser newuser

# Add the user to the sudo group
usermod -aG sudo newuser

# Test the new user
su - newuser
sudo apt update
```


## 2. Set Up SSH Key Authentication
```
# On your local machine, generate an SSH key pair if you don’t already have one
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy the SSH key to the new user on the server
ssh-copy-id -i ~/.ssh/id_ed25519.pub newuser@your-server-ip

# Test key-based login
ssh newuser@your-server-ip
```


## 3. Harden SSH
```
# Open SSH configuration file
sudo vi /etc/ssh/sshd_config

# Ensure the following settings are set (uncomment if necessary):
PermitRootLogin no  # Disable root login
PasswordAuthentication no  # Disable password-based authentication
UsePAM no # Disable PAM authentication

# Restart SSH service
sudo systemctl restart ssh

# Test SSH with new settings before logging out
ssh newuser@your-server-ip
```


## 4. Install Extras
```
sudo apt install zoxide eza fzf

sudo add-apt-repository ppa:neovim-ppa/unstable
sudo apt update
sudo apt install -y neovim

```


## 5. Install Docker
```
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io
```


## 6. Post Install Docker
```
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
sudo systemctl enable --now docker
```


## 7. Set Up a Firewall (UFW)
```
# Install UFW if not already installed
sudo apt install ufw

# Allow necessary ports
sudo ufw allow OpenSSH    # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS

# Enable UFW
sudo ufw enable

# Check UFW status
sudo ufw status
```

## 5. (Optional) Install and Configure Fail2Ban

```
# Install Fail2Ban
sudo apt install fail2ban

# Create a local configuration file
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit Fail2Ban configuration for SSH
sudo vi /etc/fail2ban/jail.local
# Ensure the following lines are set:
# [sshd]
# enabled = true
# port = 22 # Change this if you've modified your SSH port.
# maxretry = 5
# bantime = 3600

# Restart Fail2Ban service
sudo systemctl restart fail2ban

# Check Fail2Ban status
sudo fail2ban-client status
sudo fail2ban-client status sshd
```
