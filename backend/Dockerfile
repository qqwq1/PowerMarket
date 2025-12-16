# --- build stage: JDK 23 ---
FROM maven:3.9-eclipse-temurin-23 AS build
WORKDIR /build

COPY pom.xml .
COPY src ./src
COPY files ./files

# Временное!!!
RUN mvn -q clean package -Dmaven.test.skip=true

# --- run stage: JRE 23 ---
FROM eclipse-temurin:23-jre
WORKDIR /app

COPY --from=build /build/target/*.jar /app/app.jar
COPY --from=build /build/files ./files

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java","-jar","/app/app.jar"]
