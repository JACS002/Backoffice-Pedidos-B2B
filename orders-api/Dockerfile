FROM node:22-alpine

WORKDIR /app

# Copiamos package.json (aún vacío o básico, no importa por ahora)
COPY package.json ./

# Instalamos dependencias (si hubiera)
# RUN npm install

# Copiamos el resto del código
COPY . .

# Comando por defecto (temporalmente un "hola mundo" para que no se caiga)
CMD ["echo", "Servicio iniciado... esperando codigo"]