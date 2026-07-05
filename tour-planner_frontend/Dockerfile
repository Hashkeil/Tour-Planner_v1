# Stage 1 — build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 — serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist/tour-planner/browser/ /usr/share/nginx/html/
# Angular 19 static mode outputs index.csr.html; use it as index.html if needed
RUN if [ ! -s /usr/share/nginx/html/index.html ] || grep -q "Welcome to nginx" /usr/share/nginx/html/index.html; then \
      cp /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html; \
    fi
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
