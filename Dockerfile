# Stage 1: Build the Expo web application
FROM node:20-alpine AS builder

WORKDIR /app

# Define ARGs for build-time environment variables (passed by 'docker build --build-arg')
# These should correspond to the EXPO_PUBLIC_ variables fetched from Secret Manager by Cloud Build
ARG EXPO_PUBLIC_FIREBASE_API_KEY
ARG EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG EXPO_PUBLIC_FIREBASE_PROJECT_ID
ARG EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG EXPO_PUBLIC_FIREBASE_APP_ID
ARG EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
ARG EXPO_PUBLIC_FIREBASE_DATABASE_URL
ARG EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
ARG EXPO_PUBLIC_DEFAULT_ALERT_RADIUS_KM
# Add any other EXPO_PUBLIC_ variables needed

# Set them as environment variables for the build process
ENV EXPO_PUBLIC_FIREBASE_API_KEY=${EXPO_PUBLIC_FIREBASE_API_KEY}
ENV EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=${EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN}
ENV EXPO_PUBLIC_FIREBASE_PROJECT_ID=${EXPO_PUBLIC_FIREBASE_PROJECT_ID}
ENV EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=${EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET}
ENV EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
ENV EXPO_PUBLIC_FIREBASE_APP_ID=${EXPO_PUBLIC_FIREBASE_APP_ID}
ENV EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=${EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID}
ENV EXPO_PUBLIC_FIREBASE_DATABASE_URL=${EXPO_PUBLIC_FIREBASE_DATABASE_URL}
ENV EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=${EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}
ENV EXPO_PUBLIC_DEFAULT_ALERT_RADIUS_KM=${EXPO_PUBLIC_DEFAULT_ALERT_RADIUS_KM}

# Copy package files
COPY package.json package-lock.json ./

# Crucial: Copy the dataconnect-generated directory BEFORE npm ci
COPY dataconnect-generated ./dataconnect-generated

# Install dependencies including devDependencies (Expo build might need them)
RUN npm ci

# Copy the rest of the application source code
# .dockerignore should prevent unnecessary files from being copied
COPY . .

# Create .env file from build arguments so Expo can read them during build
RUN echo "EXPO_PUBLIC_FIREBASE_API_KEY=${EXPO_PUBLIC_FIREBASE_API_KEY}" > .env && \
    echo "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=${EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN}" >> .env && \
    echo "EXPO_PUBLIC_FIREBASE_PROJECT_ID=${EXPO_PUBLIC_FIREBASE_PROJECT_ID}" >> .env && \
    echo "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=${EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET}" >> .env && \
    echo "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}" >> .env && \
    echo "EXPO_PUBLIC_FIREBASE_APP_ID=${EXPO_PUBLIC_FIREBASE_APP_ID}" >> .env && \
    echo "EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=${EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID}" >> .env && \
    echo "EXPO_PUBLIC_FIREBASE_DATABASE_URL=${EXPO_PUBLIC_FIREBASE_DATABASE_URL}" >> .env && \
    echo "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=${EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}" >> .env && \
    echo "EXPO_PUBLIC_DEFAULT_ALERT_RADIUS_KM=${EXPO_PUBLIC_DEFAULT_ALERT_RADIUS_KM}" >> .env && \
    echo "Created .env file with environment variables:" && cat .env

# Clear any existing build cache, build CSS, and run the web build script
RUN rm -rf dist .expo && \
    npm run build:css-prod && \
    npm run build:web
# This will create static files in 'dist' directory

# Stage 2: Serve the static files
FROM node:20-alpine

WORKDIR /app

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built static assets from the builder stage
COPY --from=builder /app/dist ./dist

# Install 'serve' globally - pin version for consistency
RUN npm install -g serve@^14.2.3

# Switch to the non-root user
USER appuser

# Expose the port Cloud Run expects (or the port 'serve' will run on)
EXPOSE 8080

# Start the server. PORT env var is used by Cloud Run and 'serve' picks it up.
# The '-s' flag is for single-page applications.
# '-l tcp://0.0.0.0:8080' makes serve listen on all interfaces on the specified port.
# Cloud Run sets the PORT environment variable (default 8080), which serve will use.
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:8080"]
