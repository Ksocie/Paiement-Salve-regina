# ==============================================================================
# DOCKERFILE POUR RENDER & CLOUD - CHORALE SALVE REGINA FULL-STACK PWA
# ==============================================================================

# Étape 1 : Construction du jar Spring Boot (avec Angular PWA embarqué dans static)
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copie des fichiers de configuration Gradle
COPY gradle/ gradle/
COPY gradlew build.gradle settings.gradle ./
RUN chmod +x gradlew

# Copie du code source et des fichiers statiques (Angular PWA)
COPY src ./src

# Compilation de l'exécutable jar sans lancer les tests unitaires
RUN ./gradlew bootJar --no-daemon -x test

# Étape 2 : Image d'exécution légère JRE 21
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copie du jar généré depuis l'étape précédente
COPY --from=builder /app/build/libs/*.jar app.jar

# Variables d'environnement par défaut
ENV SERVER_PORT=8080
EXPOSE 8080

# Démarrage optimisé de l'application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
