FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY src ./src

RUN npm run build

FROM build AS test

CMD ["npm", "test"]

FROM nginx:1.27-alpine AS runtime

ENV BACKEND_URL=http://backend:5000

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
