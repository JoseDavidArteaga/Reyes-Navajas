#!/usr/bin/env bash
# Aprovisiona la VM OCI (Ubuntu 22.04 ARM, región sa-bogota-1) para Reyes-Navajas (Opción A).
# Uso (desde la raíz del repo ya clonado en la VM):
#   sudo BACKEND_HOST=80-90-100-110.nip.io EMAIL=tu@correo.com bash deploy/vm-setup.sh
# Hace: Docker + plugin compose, Nginx (api/auth -> 8089/8080), UFW (22/80/443),
# certificado Let's Encrypt para api.* y auth.*. NO levanta el compose (paso manual posterior).
set -euo pipefail

: "${BACKEND_HOST:?Exporta BACKEND_HOST, p. ej. BACKEND_HOST=80-90-100-110.nip.io}"
: "${EMAIL:?Exporta EMAIL para el certificado TLS, p. ej. EMAIL=tu@correo.com}"

if [[ "$(id -u)" -ne 0 ]]; then echo "Ejecutar como root (sudo)"; exit 1; fi
if [[ ! -f deploy/nginx-reyes-navajas.conf.template ]]; then
  echo "Ejecutar desde la raíz del repo (falta deploy/nginx-reyes-navajas.conf.template)"; exit 1
fi

echo "==> [1/6] Paquetes base"
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release ufw dnsutils

echo "==> [2/6] Docker (repo oficial, con plugin compose)"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
docker compose version

echo "==> [3/6] Nginx + certbot"
apt-get install -y nginx certbot python3-certbot-nginx
systemctl enable --now nginx

echo "==> [4/6] UFW: solo 22/80/443"
ufw --force reset >/dev/null
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status numbered | head -12

echo "==> [5/6] Site Nginx api/auth"
sed "s/BACKEND_HOST/${BACKEND_HOST}/g" deploy/nginx-reyes-navajas.conf.template > /etc/nginx/sites-available/reyes-navajas
ln -sf /etc/nginx/sites-available/reyes-navajas /etc/nginx/sites-enabled/reyes-navajas
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "==> [6/6] DNS + certificado (espera propagación nip.io hasta 5 min)"
for i in $(seq 1 30); do
  if getent hosts "api.${BACKEND_HOST}" >/dev/null && getent hosts "auth.${BACKEND_HOST}" >/dev/null; then
    echo "DNS OK"; break
  fi
  echo "Intento $i/30: api/auth.${BACKEND_HOST} aún no resuelven, esperando 10s..."
  sleep 10
  if [[ "$i" == 30 ]]; then echo "ERROR: el DNS no resolvió. Revisa la IP y reintenta certbot a mano."; exit 1; fi
done
certbot --nginx -d "api.${BACKEND_HOST}" -d "auth.${BACKEND_HOST}" \
  --non-interactive --agree-tos -m "${EMAIL}" --redirect
systemctl status certbot.timer --no-pager | head -5 || true

echo
echo "VM LISTA. Siguiente (manual):"
echo "  1. cp .env.prod.example .env.prod && nano .env.prod   # BACKEND_HOST=${BACKEND_HOST}"
echo "  2. Reemplazar TU-IP-CON-GUIONES en frontend/src/environments/environment.prod.ts por ${BACKEND_HOST}"
echo "  3. docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d --build"
echo "  4. curl -sf https://api.${BACKEND_HOST}/actuator/health"
