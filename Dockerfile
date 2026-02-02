# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build   # CRA build goes to /app/build

# ---------- Production stage ----------
FROM nginx:alpine

# Remove default HTML
RUN rm -rf /usr/share/nginx/html/*

# Copy CRA build output
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8081
CMD ["nginx", "-g", "daemon off;"]
