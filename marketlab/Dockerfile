FROM node:22-alpine
WORKDIR /app
COPY marketlab/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY marketlab ./marketlab
COPY .agents/skills ./.agents/skills
WORKDIR /app/marketlab
ENV NODE_ENV=production
ENV PORT=8787
EXPOSE 8787
CMD ["node","mcp/server.mjs"]
