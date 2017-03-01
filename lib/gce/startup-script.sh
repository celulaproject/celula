#!/usr/bin/env bash

dissalow_login() {
  sed -ie 's/bin\/bash/usr\/sbin\/nologin/g' /etc/passwd
}

# stop and disable running services: https://github.com/GoogleCloudPlatform/compute-image-packages/blob/master/google_compute_engine_init/systemd/prerm.sh

disable_services() {
  # google related
  #stop
  systemctl stop --no-block google-accounts-daemon
  # Not sure about these two:
  # sudo systemctl stop --no-block google-clock-skew-daemon
  # sudo systemctl stop --no-block google-ip-forwarding-daemon

  #disable
  systemctl --no-reload disable google-accounts-daemon.service
  systemctl --no-reload disable google-instance-setup.service
  systemctl --no-reload disable google-network-setup.service
  systemctl --no-reload disable google-shutdown-scripts.service
  systemctl --no-reload disable google-startup-scripts.service
  # Idem not sure about these two:
  # sudo systemctl --no-reload disable google-clock-skew-daemon.service
  # sudo systemctl --no-reload disable google-ip-forwarding-daemon.service
}

install_celula() {
  #set locale as en_US.UTF-8
  export LC_ALL="en_US.UTF-8"
  locale-gen
  #update
  apt-get update && sudo apt-get upgrade -y
  apt-get install build-essential -y
  #git
  apt-get install git -y
  #node 7x
  curl -sL https://deb.nodesource.com/setup_7.x | bash -
  apt-get install nodejs -y
  #allow node use port 80/443
  setcap cap_net_bind_service=+ep /usr/bin/nodejs
  # create user
  useradd -s /bin/bash -m -d /home/celula celula
  su - celula -c 'chmod -R 700 /home/celula'
  su - celula -c 'git clone https://jaime-ez@bitbucket.org/jaime-ez/celula.git'
  su - celula -c 'cd celula  && npm install'
  env PATH=$PATH:/usr/bin /home/celula/celula/node_modules/pm2/bin/pm2 startup systemd -u celula --hp /home/celula
  su - celula -c 'echo "export CELULA_GEN=_CELULA_NEXT_GENERATION_" >> .profile'
  su - celula -c 'source .profile'
  su - celula -c 'cd celula && npm start'
}

install_script() {
  useradd -s /bin/bash -m -d /home/scriptUser scriptUser
  su - scriptUser -c 'chmod -R 700 /home/scriptUser'
  su - scriptUser -c 'git clone _REPO_URL_ ~/repo'
  su - scriptUser -c 'cd ~/repo && npm install'
  su - scriptUser -c 'cd repo && npm start'
}

main() {
  dissalow_login
  disable_services
  install_celula
  #_install_script_
  echo "Awesome script, great job!"
}

main
