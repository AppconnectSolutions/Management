# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build   # Vite will output to /app/dist by default

# ---------- Production stage ----------
FROM nginx:alpine

# Remove default HTML
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite build output (dist folder, not build)
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose custom port (change nginx.conf to match this port)
EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]
