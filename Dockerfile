# Stage 1: Build the Expo web application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Crucial: Copy the dataconnect-generated directory BEFORE npm ci
# This is because package.json has a file: dependency on it.
# Ensure this path is correct relative to your Docker build context (repo root).
COPY dataconnect-generated ./dataconnect-generated

# Install dependencies
# Using --omit=dev for a leaner build if devDependencies aren't needed for the build script itself.
# However, expo build scripts might need some devDependencies. Let's keep them for now.
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Run the web build script
RUN npm run build:web
# This will create static files in 'web-build' directory by default

# Stage 2: Serve the static files
FROM node:20-alpine

WORKDIR /app

# Install 'serve' to act as a static file server
RUN npm install -g serve

# Copy only the build artifacts from the builder stage
COPY --from=builder /app/web-build ./web-build

# Expose the port Cloud Run expects (or the port 'serve' will run on)
# 'serve' defaults to port 3000. Cloud Run defaults to 8080.
# We'll tell 'serve' to listen on 8080.
EXPOSE 8080

# Start the server
# The '-s' flag is important for single-page applications (SPA) like React apps
# It ensures that all routes are redirected to index.html
# PORT environment variable is automatically picked up by 'serve' if set.
# Cloud Run sets the PORT environment variable to 8080 by default.
CMD ["serve", "-s", "web-build", "-l", "tcp://0.0.0.0:8080"]
