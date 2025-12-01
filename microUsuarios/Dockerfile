# Build stage with JDK 21
FROM eclipse-temurin:21-jdk-jammy AS builder

# Install Maven and build tools
RUN apt-get update && \
    apt-get install -y maven curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# Build the application
RUN chmod +x mvnw && \
    ./mvnw clean package -DskipTests \
    -Dmaven.compiler.source=21 \
    -Dmaven.compiler.target=21

# Runtime stage with JRE 21
FROM eclipse-temurin:21-jre-jammy

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Expose application port
EXPOSE 8085

# PostgreSQL configuration
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-login:5432/login_db
ENV SPRING_DATASOURCE_USERNAME=postgres
ENV SPRING_DATASOURCE_PASSWORD=123
ENV SPRING_JPA_HIBERNATE_DDL_AUTO=update

# RabbitMQ configuration
ENV SPRING_RABBITMQ_HOST=rabbitmq
ENV SPRING_RABBITMQ_PORT=5672
ENV SPRING_RABBITMQ_USERNAME=guest
ENV SPRING_RABBITMQ_PASSWORD=guest

# Keycloak/JWT configuration
ENV SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI=http://keycloak:8080/realms/MicroserviceSPM
ENV SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI=http://keycloak:8080/realms/MicroserviceSPM/protocol/openid-connect/certs

# Additional Keycloak admin client configuration
ENV KEYCLOAK_AUTH_SERVER_URL=http://keycloak:8080
ENV KEYCLOAK_REALM=MicroserviceSPM
ENV KEYCLOAK_RESOURCE=system-desktop
ENV KEYCLOAK_CREDENTIALS_SECRET=system-secret

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8085/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]