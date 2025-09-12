# Start from a node base image
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all other project files
COPY . .

# Set build arguments to accept variables from docker-compose.yml
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_AUTH_SERVICE_URL
ARG REACT_APP_PATIENT_SERVICE_URL
ARG REACT_APP_CLINICAL_SERVICE_URL
ARG REACT_APP_GROUP_SERVICE_URL

# Set environment variables for the build process
# This is what makes them available to React
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_AUTH_SERVICE_URL=$REACT_APP_AUTH_SERVICE_URL
ENV REACT_APP_PATIENT_SERVICE_URL=$REACT_APP_PATIENT_SERVICE_URL
ENV REACT_APP_CLINICAL_SERVICE_URL=$REACT_APP_CLINICAL_SERVICE_URL
ENV REACT_APP_GROUP_SERVICE_URL=$REACT_APP_GROUP_SERVICE_URL

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Debug: List contents of nginx html folder
RUN ls -la /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
