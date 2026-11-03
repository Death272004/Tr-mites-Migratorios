# Frontend estático servido por nginx (HU-10 / TASK-10.4).
# Build context = ./Frontend; el contenido se copia tal cual a la raíz del sitio.
# La configuración de nginx (proxy /api -> backend) se monta desde docker/nginx.conf.
FROM nginx:1.27-alpine

COPY . /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1/salud | grep -q ok || exit 1
