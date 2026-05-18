FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /build

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /build/target/backend-*.jar app.jar

RUN mkdir -p /storage/drafts /storage/publications

ENTRYPOINT ["java", "-jar", "app.jar"]

