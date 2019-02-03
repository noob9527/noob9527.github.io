---
title: Common Pitfalls of Declarative Transaction Management in Spring
categories: Backend
tags:
  - Spring
  - JPA
photos: /img/common-pitfalls-of-declarative-transaction-management-in-spring.jpg
date: 2019-02-03 21:04:26
permalink:
---


> Spring supports two types of transaction management, namely, programmatic and declarative transaction management. Despite the fact that programmatic management is more flexible, declarative management is still preferred since it is less invasive to application code. In this post, I'm going to summarize several pitfalls you may encounter while using declarative transaction management. Certainly, if you read the official document thoroughly, you should know how to avoid them on your own, but if you think of it is all about annotating your method with the @Transactional annotation as I did, you may never figure them out until the day your customer reports his balance is incorrect.

### Prerequisites
Our samples are written in Kotlin language. In addition, I assume that you are already familiar with the following frameworks.
- Spring
- JPA(Hibernate implementation)
- Spring Data JPA

Examples in this post are based on the following class:
```kotlin
// entity
@Entity
class DemoEntity(
        val name: String
) : AbstractPersistable<Int>()

// repository
interface DemoRepo : CrudRepository<DemoEntity, Int>
```
Read the manual of Spring Data JPA If you are not able to understand the above code. Finally, The related test code will be available at [common-pitfalls-of-declarative-transaction-management-in-spring](https://github.com/noob9527/post-code/tree/master/1-common-pitfalls-of-declarative-transaction-management-in-spring).

### Pitfall 1: @Transactional annotation may have no effect at all
It's a common circumstance that we put some code in a private method so it can be reused. If the code involves a transaction, we may end up with writing code like this.
```kotlin
@Service
class DemoService(
        private val demoRepo: DemoRepo
) {
    fun persistAndDoSomething(demo: DemoEntity) {
        persist(demo)
        // do something
    }

    fun persistAndDoOtherthings(demo: DemoEntity) {
        persist(demo)
        // do other things
    }

    @Transactional
    private fun persist(demo: DemoEntity) {
        // you may think this action will be rolled back if exception occurs
        demoRepo.save(demo)
        unpredictableMethod()
    }

    // simulate a method which may or may not throw an exception
    fun unpredictableMethod() {
        if (ThreadLocalRandom.current().nextBoolean())
            throw Exception("Oops!")
    }
}
```
In this case, the `persist` method will be invoked as if no @Transactional annotation is present. To understand why, we need to know that the declarative transaction is implemented on top of AOP(Aspect Oriented Programming) proxies. A proxied method invocation procedure looks like this:
![transactional-proxy](/img/content/common-pitfalls-of-declarative-transaction-management-in-spring/transactional-proxy.png)
From the picture, it is not hard to imagine that the `beginTransaction`, `commit` and `rollback` logic is implemented in a so called "advice" component. "Advice" here refers to a core concept of AOP(read the documentation of [Spring AOP](https://docs.spring.io/spring/docs/4.2.x/spring-framework-reference/html/aop.html) to get more information), and there is two different advice mode supported by Spring transaction management, which called "PROXY" and "ASPECTJ". As the document says:
> When using proxies, you should apply the @Transactional annotation only to methods with public visibility. If you do annotate protected, private or package-visible methods with the @Transactional annotation, no error is raised, but the annotated method does not exhibit the configured transactional settings. Consider the use of AspectJ if you need to annotate non-public methods.

Now the reason is pretty clear, to fix the problem, we can either switch the advice mode from "PROXY"(default option) to "ASPECTJ", or remove the private modifier from the `persist` method. Let's say we choose to remove the modifier, you can find that the `persist` is still invoked without any transaction, because we just fall into the next pitfall.

<!-- more -->

### Pitfall 2: @Transactional annotation may not affect a method invocation
Following the previous section, after applying the second solution from the previous section, our `DemoService` now looks like:
```kotlin
@Service
class DemoService(
        private val demoRepo: DemoRepo
) {
    fun persistAndDoSomething(demo: DemoEntity) {
        persist(demo)
        // do something
    }

    fun persistAndDoOtherthings(demo: DemoEntity) {
        persist(demo)
        // do other things
    }

    @Transactional
    fun persist(demo: DemoEntity) {
        // you may think this action will be rolled back if exception occurs
        demoRepo.save(demo)
        unpredictableMethod()
    }

    // simulate a method which may or may not throw an exception
    fun unpredictableMethod() {
        if (ThreadLocalRandom.current().nextBoolean())
            throw Exception("Oops!")
    }
}
```
This time, if you inject the instance of `DemoService` to another class, then directly call `demoService.persist(demo)` from that class, everything works. It can mislead you to think of the `persist` method is already being proxied whereas it is not. Again, the official document has its own explanation for this problem.
> In proxy mode, only external method calls coming in through the proxy are intercepted. This means that self-invocation, in effect, a method within the target object calling another method of the target object, will not lead to an actual transaction at runtime even if the invoked method is marked with `@Transactional`. Also, the proxy must be fully initialized to provide the expected behavior so you should not rely on this feature in your initialization code, i.e. `@PostConstruct`.

There's a tricky solution against this problem, inject itself to an instance field, then invoke methods from the instance. The code looks like
```kotlin
@Service
class DemoService(
        private val demoRepo: DemoRepo
) {

    // Unlike demoRepo, it cannot be a constructor parameter
    // otherwise Spring won't be able to initialize the proxy due to a circular dependency.
    @Autowired
    private lazyinit var self: DemoService

    fun persistAndDoSomething(demo: DemoEntity) {
        self.persist(demo)
        // do something
    }

    fun persistAndDoOtherthings(demo: DemoEntity) {
        self.persist(demo)
        // do other things
    }

    @Transactional
    fun persist(demo: DemoEntity) {
        // you may think this action will be rolled back if exception occurs
        demoRepo.save(demo)
        unpredictableMethod()
    }

    // simulate a method which may or may not throw an exception
    fun unpredictableMethod() {
        if (ThreadLocalRandom.current().nextBoolean())
            throw Exception("Oops!")
    }
}
```
Finally, the `persist` method is now invoked with a transaction, but somehow, the transaction still does not rollback no matter whether the exception is thrown. Guess what, we again fall into the next pitfall.

### Pitfall 3: Transaction may not rollback when an exception occurs
Before further explaining, let's focus on the buggy code segment.
```kotlin
@Transactional
fun persist(demo: DemoEntity) {
    // you may think this action will be rolled back if exception occurs
    demoRepo.save(demo)
    unpredictableMethod()
}

// simulate a method which may or may not throw an exception
fun unpredictableMethod() {
    if (ThreadLocalRandom.current().nextBoolean())
        throw Exception("Oops!")
}
```
Providing only ten lines of code, an experienced Spring developer may realize, "The exception here, is it a runtime exception?". Yes, that's the point. By default, Spring won't mark a transaction for rollback after any exception is thrown. As the document says:
> In its default configuration, the Spring Framework’s transaction infrastructure code only marks a transaction for rollback in the case of runtime, unchecked exceptions; that is, when the thrown exception is an instance or subclass of RuntimeException. ( Errors will also - by default - result in a rollback). Checked exceptions that are thrown from a transactional method do not result in rollback in the default configuration.

Admittedly, the hidden bug would be much more obvious if I wrote the code segment in Java language, because there isn't any difference between checked exception and runtime exception in Kotlin. In Java language, on the contrary, the exception must be handled or throw to the method caller explicitly, that could make this problem easier to identify. Nevertheless, I've made this kind of mistake while I was using Java, That's why I think it's worth to mention.
Now let's turn to the solution. According to the official document, we can just configure the `@Transactional` annotation to rollback for any exception. Or, we can catch the exception at the first place.
```kotlin
@Transactional
fun persist(demo: DemoEntity) {
    demoRepo.save(demo)

    try {
        unpredictableMethod()
    } catch (e: Exception) {
        // handle the exception
    }
}
```
This solution seems a little tedious to an experienced programmer, But by doing so, we get an opportunity to run into next pitfall.

### Pitfall 4: Transaction may not be able to commit after an exception is being caught
After hours of tinkering, we finally get the piece of code work, But requirements are changing, let's say somehow we need to ensure the `unpredictableMethod` run with a transaction. After going through previous lessons, this time we want to do it extremely carefully.
Firstly, we put a `@Transactional` on the method and configure it to rollback for all exceptions, so that we won't fall into pitfall 3.
```kotlin
@Transactional(rollbackFor=[Exception::class])
fun unpredictableMethod() {
    /*
        some business code must be executed with a transaction
        ...
    */
    if (ThreadLocalRandom.current().nextBoolean())
        throw Exception("Oops!")
}
```
Secondly, Owing to pitfall 2, we update the self-invocation in `persist` method to the proxied method call.
```kotlin
@Transactional
fun persist(demo: DemoEntity) {
    demoRepo.save(demo)

    try {
        self.unpredictableMethod()
    } catch (e: Exception) {
        // handle the exception
    }
}
```
After everything is checked, we expect that if `unpredictableMethod` is called directly and an exception is thrown, the transaction will be rolled back. Conversely, if `persist` is called, the transaction will be committed since exceptions should be handled by the `try-catch` block. Unfortunately, it is not happening, we just ran into pitfall 4. An `UnexpectedRollbackException` will be thrown.
When a "transactional" method invokes another "transactional" method, the actual behavior is determined by `propagation` property of the second `@Transaction` annotation. If the property value is `REQUIRED`, which is the default value, the second method will be executed in an existing transaction, and once the rollback condition in the second method is reached, it marks the transaction as rollback-only. That is, no matter if the exception is handled in the first method, the transaction won't be able to commit. If you like, there's an official explanation:
> When the propagation setting is PROPAGATION_REQUIRED, a logical transaction scope is created for each method upon which the setting is applied. Each such logical transaction scope can determine rollback-only status individually, with an outer transaction scope being logically independent from the inner transaction scope. Of course, in case of standard PROPAGATION_REQUIRED behavior, all these scopes will be mapped to the same physical transaction. So a rollback-only marker set in the inner transaction scope does affect the outer transaction’s chance to actually commit (as you would expect it to).
However, in the case where an inner transaction scope sets the rollback-only marker, the outer transaction has not decided on the rollback itself, and so the rollback (silently triggered by the inner transaction scope) is unexpected. A corresponding UnexpectedRollbackException is thrown at that point. This is expected behavior so that the caller of a transaction can never be misled to assume that a commit was performed when it really was not. So if an inner transaction (of which the outer caller is not aware) silently marks a transaction as rollback-only, the outer caller still calls commit. The outer caller needs to receive an UnexpectedRollbackException to indicate clearly that a rollback was performed instead.

The solution depends on what you want, you can change the `propagation` property of the second `@Transactional`, or change the `rollbackFor` and `noRollbackFor` property of the first `@Transactional` to filter a specific exception class. In this case, you can even fix the problem by falling into the pitfall 2 deliberately, although it is not recommended because your colleague may not be able to understand it.

### Conclusion
Spring declarative transaction management does hide the complexity of writing transaction handling code, but handle transaction correctly is far more complex than just put an `@Transactional` annotation on your method. Considering transaction is usually the most critical part in an application, you'd better test every branch of your code.
