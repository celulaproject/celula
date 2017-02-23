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

execute_install_script() {
  wget -qO - _SCRIPT_URL_ | bash
}

main() {
  dissalow_login
  disable_services
  execute_install_script
}

main
