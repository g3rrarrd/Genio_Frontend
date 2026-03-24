# Etapa 1: Construcción (Build)
FROM node:20-alpine AS build

WORKDIR /app

# Declarar los argumentos de construcción (Build Args)
# Esto permite que GitHub Actions pase la URL de la API durante el build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente y compilar
COPY . .
RUN npm run build

# Etapa 2: Servidor de producción (Nginx)
FROM nginx:stable-alpine

# Copiar los archivos estáticos generados por Vite (carpeta dist)
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx para manejar rutas de React (SPA)
# Asegúrate de tener el archivo nginx.conf en tu repo
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
