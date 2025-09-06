# Use Node.js
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock file first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all project files
COPY . .

# Build the React app
RUN npm run build

# Expose port 5173 (default for vite preview)
EXPOSE 5173

# Start using Vite preview (serves dist/)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
