FROM node:22-alpine

WORKDIR /app

# Copiamos package.json primero para aprovechar cache de Docker
COPY package.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto
EXPOSE 3002

# Comando de inicio
CMD ["npm", "start"]