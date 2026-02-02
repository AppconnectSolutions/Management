# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Production stage ----------
FROM nginx:alpine

# Remove default HTML
RUN rm -rf /usr/share/nginx/html/*

# Copy CRA build output
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config template
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Set default port (can be overridden)
ENV PORT=8080

# Replace port in nginx config
RUN envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

EXPOSE $PORT
CMD ["nginx", "-g", "daemon off;"]
