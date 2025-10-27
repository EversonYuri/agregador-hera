# UImagem Bun
FROM oven/bun:latest

# Diretorio
WORKDIR /app

# Copia package.json and install dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy the rest of your app code
COPY . .

# Expose the port (e.g., for a web server)
EXPOSE 3000

# Run the app
CMD ["bun", "run", "serve.ts"]