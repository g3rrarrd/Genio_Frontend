# Etapa 1: Construcción
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias para aprovechar el caché de Docker
COPY package*.json ./
RUN npm install

# Copiar el resto del código y construir
COPY . .
RUN npm run build

# Etapa 2: Servidor de producción (Nginx)
FROM nginx:stable-alpine

# Copiar los archivos construidos desde la etapa anterior
# Nota: Si usas Vite, la carpeta de salida es 'dist'. Si usas CRA, es 'build'.
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar una configuración personalizada de Nginx para manejar rutas de React (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
