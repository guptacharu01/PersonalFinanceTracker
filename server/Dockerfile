# Backend on Render: Render has no Java option, so deploy it with Docker instead.
# Build the app with Maven, then run the built jar on a small Java image.
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/finance-tracker-1.0.0.jar app.jar
# Render sets PORT itself; the app reads it from application.properties.
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
