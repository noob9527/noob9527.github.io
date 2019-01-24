---
title: Things Need to be aware before using Transaction Annotation
categories: Backend
tags:
  - Spring
  - JPA
photos: /img/things-need-to-be-aware-before-using-transaction-annotation
permalink:
---

> Spring framework has a `@Transaction` annotation, which can save you from writing a lot of template code. However, things may not as simple as you think...

### Before We Start
Our samples are written in Kotlin language. In addition, I assume that you are already familiar with frameworks below.
- Spring
- JPA(hibernate implementation)
- Spring Data JPA

We have a simple demo entity and repository.
```kotlin
// entity
@Entity
class DemoEntity(
        val name: String
) : AbstractPersistable<Int>()

// repository
interface DemoRepo : CrudRepository<DemoEntity, Int>
```
The full source code is available at [things-need-to-be-aware-before-using-transaction-annotation](https://github.com/noob9527/post-code/1-things-need-to-be-aware-before-using-transaction-annotation).

### Example 1
Let's start from a simple sample, we write a function `persist`, which involves a read-write transaction, and expect that the transaction will rollback if an exception is thrown during the invocation.
```kotlin
@Service
class DemoService1(
        private val demoRepo: DemoRepo
) {
    @Transactional
    fun persist(demo: DemoEntity) {
        demoRepo.save(demo) // you may think this action will be rollback
        // some action may or may not throw an exception
        throw Exception("Oops!") // For demonstration sake, we just throw an exception deliberately here
    }
}
```
However, the code won't work as you think, the transaction will be committed even though an exception is thrown. The reason is the @Transaction annotation only rollback for ** RuntimeException ** by default. To fix this problem, we can change the code to this.
```kotlin
@Transactional(rollbackFor = [Exception::class])
fun persist(demo: DemoEntity) {
    demoRepo.save(demo)
    throw Exception("Oops!")
}
```
If you haven't read the manual before coding, and you don't test every branch of your code, you can never be able to figure out this problem until the day the exception in `methodB` is thrown.

<!-- more -->

### Example 2
Let's slightly change our code, this time we do throw a `RuntimeException`, but instead of calling `save` directly, we delegate this action to another function call(assume for reasons like code reuse).
```kotlin
@Service
class DemoService2(
        private val demoRepo: DemoRepo
) {

    fun persist(demo: DemoEntity) {
        anotherMethod(demo)
    }

    @Transactional
    fun anotherMethod(demo: DemoEntity) {
        demoRepo.save(demo) // you may think this action will be rollback
        throw RuntimeException("Oops!")
    }
}
```
We call `demoService2.persist(demo)` somewhere and expect the call won't actually persist the entity since a `RuntimeException` is thrown. Still, it's just another trap, and it's even less obvious.\
To understand this example, you need to know that spring implement the transaction management using method proxy under the hood. In a nutshell, when you call `demoService2.anotherMethod(demo)`, you are invoking a proxied method, whereas `this.anotherMethod(demo)` is not. A possible solution will like this
```kotlin
@Service
class DemoService2(
        private val demoRepo: DemoRepo,
        private val applicationContext: ApplicationContext
) {

    private val self: DemoService2 by lazy {
        applicationContext.getBean(DemoService2::class.java)
    }

    fun persist(demo: DemoEntity) {
        self.anotherMethod(demo)
    }

    @Transactional
    fun anotherMethod(demo: DemoEntity) {
        demoRepo.save(demo)
        throw RuntimeException("Oops!")
    }
}
```

### Example 3
Finally, let's assume we have code structure below.
```kotlin
@Service
class DemoService3(
        private val demoRepo: DemoRepo,
        private val applicationContext: ApplicationContext
) {

    private val self: DemoService3 by lazy {
        applicationContext.getBean(DemoService3::class.java)
    }

    @Transactional
    fun persist(demo: DemoEntity) {
        try {
            self.anotherMethod()
        } catch (e: Exception) {
        }
        demoRepo.save(demo) // you may think this action will be committed
    }

    @Transactional
    fun anotherMethod() {
        throw RuntimeException("Oops!")
    }
}
```
Again you may think the transaction will be committed successfully since the exception is already been caught, and again it doesn't work. An `UnexpectedRollbackException` will be thrown in latest version(2.1.1.RELEASE). The `anotherMethod` marks the transaction as "rollbackOnly", so you can never commit the transaction even though you've caught every possible exception. A possible solution could be setting the `noRollbackFor` property of `@Transaction` annotation to a specific class.

### Conclusion
Spring's directive transaction management is considered as a simple way to handle transactions. But don't think of you can get everything done by just putting an annotation on your method. To avoid potential danger, you'd better test every branch of your code when involving a critical transaction.
