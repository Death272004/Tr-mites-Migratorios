# Compilación
FROM eclipse-temurin:17-jdk-alpine AS compilacion
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline
COPY src src
RUN ./mvnw -B -q package -DskipTests

# Ejecución
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# El almacén de documentos pertenece al usuario sin privilegios que ejecuta la aplicación.
RUN addgroup -S app && adduser -S app -G app && mkdir /app/almacenamiento && chown app:app /app/almacenamiento
COPY --from=compilacion /app/target/backend-*.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
