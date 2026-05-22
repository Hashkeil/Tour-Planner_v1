# Stage 1 — build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN find /app/dist -type f -name "*.html" | head -20

# Stage 2 — serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist/tour-planner/browser/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
