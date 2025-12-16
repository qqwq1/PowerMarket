# --- build stage: JDK 23 ---
FROM maven:3.9-eclipse-temurin-23 AS build
WORKDIR /build

# Обновляем сертификаты (на случай проблем с TLS/handshake при скачивании зависимостей)
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && update-ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Сначала копируем только pom.xml и прогреваем зависимости (лучше кешируется)
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

# Потом копируем исходники и дополнительные файлы
COPY src ./src
COPY files ./files

# Собираем jar
RUN mvn -q clean package -DskipTests

# --- run stage: JRE 23 ---
FROM eclipse-temurin:23-jre
WORKDIR /app

COPY --from=build /build/target/*.jar /app/app.jar
COPY --from=build /build/files ./files

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java","-jar","/app/app.jar"]
