# Gradle Dependencies in a Nutshell

## debug dependencies
e.g. 
```bash
gradle dependencyInsignt  --configuration=runtimeClasspath --dependency=mysql:mysql-connector-java
```
## import bom dependencies
### reference
- https://docs.spring.io/spring-boot/docs/2.4.13/gradle-plugin/reference/htmlsingle/#managing-dependencies
- https://docs.gradle.org/current/userguide/platforms.html#sub:bom_import
- https://docs.gradle.org/current/userguide/dependency_version_alignment.html

- https://nexocode.com/blog/posts/spring-dependencies-in-gradle/
- https://docs.spring.io/dependency-management-plugin/docs/current/reference/html/
- https://spring.io/guides/gs/multi-module/

## provided dependencies
## optional dependencies
### reference
- https://blog.gradle.org/optional-dependencies
- https://blog.gradle.org/introducing-compile-only-dependencies

- https://docs.gradle.org/current/userguide/java_library_plugin.html#sec:java_library_configurations_graph
