---
title: introduction to protocol buffers
categories:
tags:
photos:
permalink:
---


### Getting started
#### Gradle
```groovy
// Generate IntelliJ IDEA's .idea & .iml project files
// Starting with 0.8.4 of protobuf-gradle-plugin, *.proto and the gen output files are added
// to IntelliJ as sources. It is no longer necessary to add them manually to the idea {} block
// to jump to definitions from Java and Kotlin files.
apply plugin: 'idea'
```
##### Locate external executables
By default the plugin will search for the protoc executable in the system search path. We recommend you to take the advantage of pre-compiled protoc that we have published on Maven Central:
```groovy
protobuf {
  // Configure the protoc executable
  protoc {
    // Download from repositories
    artifact = 'com.google.protobuf:protoc:3.0.0'
    // You may also specify a local path.
    // path = '/usr/local/bin/protoc'
  }
}
```

#### IDEA
Be sure to enable delegate IDE build/run actions to Gradle so that Intellij does not use its internal build mechanism to compile source code. This plugin ensures that code generation happens before Gradle's build step. If the setting is off, Intellij's own build system will be used instead of Gradle.
Enable the setting with:
```
Settings -> Build, Execution, Deployment
  -> Build Tools -> Gradle -> Runner
  -> Delegate IDE build/run actions to gradle.
```

### Hello world

### Additional: Install the compiler via `checkinstall`
To install a standalone compiler, you can follow the instructions from the [official page](https://github.com/protocolbuffers/protobuf). You can also install the compiler via `checkInstall` command. The following steps show how to do it.
1. install essential tools
    ```bash
    sudo apt-get install autoconf automake libtool curl make g++ unzip
    ```
2. download and extract the source code
    ```bash
    curl -OL https://github.com/protocolbuffers/protobuf/releases/download/v{version}/protobuf-all-{version}.tar.gz
    tar -zxvf protobuf-{version}.tar.gz
    mv protobuf-{version} protobuf
    cd ./protobuf
    ```
3. build
    ```bash
    ./configure
    make
    ```
5. install
    ```bash
    sudo checkinstall
    sudo ldconfig # refresh shared library cache.
    ```

Finally, you can run the following command to verify the installation.
```bash
protoc --version
```
You can execute the following command to uninstall it
```bash
sudo dpkg -r protobuf

```

### Reference
[Protocol buffers Language Guide](https://developers.google.com/protocol-buffers/docs/proto3)
