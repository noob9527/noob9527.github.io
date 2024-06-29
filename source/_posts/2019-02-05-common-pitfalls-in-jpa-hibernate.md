---
title: Common Pitfalls in JPA(Hibernate)
categories: Backend
tags:
  - Spring
  - JPA
photos: /img/common-pitfalls-in-jpa-hibernate.jpg
date: 2019-02-05 23:22:47
---


> Nowadays, ORM technique has been playing an important role in object-oriented programming, and JPA is now considered the standard industry approach for ORM in the Java industry. In this post, I summarized several phenomena which violate my intuition and prone to error.

As JPA itself is just a specification, there are various underlying implementation. In this post, we are only focusing on Hibernate implementation. In fact, I've never used or tested any other implementation so far, which means there's a chance that a problem cannot be reproduced in other JPA implementation.

### Prerequisites
As in post [Common Pitfalls of Declarative Transaction Management in Spring](/post/2019/02/common-pitfalls-of-declarative-transaction-management-in-spring/), all the samples are written in Kotlin language. And Spring Data JPA framework is used for the sake of convenience. Full source code can be found at [common-pitfalls-in-jpa-hibernate](https://github.com/noob9527/post-code/tree/master/2-common-pitfalls-in-jpa-hibernate).

### Pitfall 1: Don't be fooled by `equals` and `hashcode` methods
You may already know that there are several contracts we have to obey when implementing `equals` and `hashcode` method. Namely Reflexivity, Symmetry, Transitivity, Consistency and "Non-nullity". When it comes to a JPA entity, things become even more difficult since entity state transitions must be taken into account. In other words, `equals` and `hashcode` methods must behave consistently across all entity state transitions. Thus, we can immediately conclude that ** logical key(usually auto generate after the first time being persisted) should not be taken into consideration. ** `AbstractPersistable` from spring data JPA library is a perfect counterexample which implements `equals` and `hashcode` based on auto-generation id. The following code demonstrates its flaw:
```kotlin
@Entity
class Demo1 : AbstractPersistable<Int>()
```
```kotlin
@Test
fun test() {
    val demo = Demo1()
    val set = hashSetOf(demo)

    set.contains(demo) // true

    entityManager.persist(demo)
    entityManager.flush()

    set.contains(demo) // false
}
```
The `HashSet` failed to recognize the same entity since its hashcode changed after being persisted. Certainly, this is error-prone. For similar reason, ** default `equals` and `hashcode` inherited from `java.lang.Object` is not suitable for JPA entity either. ** Code below shows that a merged entity isn't equal to itself because `entityManager.merge` may return a different object reference.
```kotlin
@Entity
class Demo2 : Persistable<Int> {
    @Id
    @GeneratedValue
    private var id: Int? = null

    override fun getId(): Int? {
        return id
    }

    override fun isNew(): Boolean {
        return id == null
    }

    // inherit equals and hashcode from Object
}
```
```kotlin
@Test
fun test() {
    val demo = Demo2()
    val set = hashSetOf(demo)

    set.contains(demo) // true

    entityManager.persist(demo)
    entityManager.flush()
    entityManager.detach(demo)

    val managed = entityManager.merge(demo)

    set.contains(managed) // false
}
```
Now, the only option left to us is implementing `equals` and `hashcode` methods based on some business key, and never change the key after the entity is created. However, you can not always find such keys in practical. In such cases, the best we can do is no matter which way we choose to implement the methods, be aware of its shortcomings and document them clearly.

Reference:
- [A beginner’s guide to entity state transitions with JPA and Hibernate](https://vladmihalcea.com/a-beginners-guide-to-jpa-hibernate-entity-state-transitions/)
- [How to implement Equals and HashCode for JPA entities](https://vladmihalcea.com/hibernate-facts-equals-and-hashcode/)
- [How to implement equals and hashCode using the JPA entity identifier (Primary Key)](https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/)

<!-- more -->

### Pitfall 2: `LazyCollectionOption.EXTRA` can make your collection behave unpredictably
A collection can be lazy fetch or eager fetch in JPA. Eager fetching is generally considered as an [anti-pattern](https://vladmihalcea.com/eager-fetching-is-a-code-smell/), so we are not going to talk about it. Lazy fetch is preferred since it improves performance by reducing unnecessary queries. In hibernate, we can make a lazy collection even more "lazy" by putting a `@LazyCollection(LazyCollectionOption.EXTRA)` annotation on the collection. After doing so, when `collection.size` is called, hibernate will fire a select count query instead of loading the whole collection. This sounds very practical let alone we can implement it by just adding one line of code. The following code shows how an "extra lazy" collection looks like:
```kotlin
@Entity
class Parent : AbstractPersistable<Int>() {

    @OneToMany(mappedBy = "parent", cascade = [CascadeType.ALL], orphanRemoval = true)
    @LazyCollection(LazyCollectionOption.EXTRA)
    val children: MutableSet<Child> = mutableSetOf()

    // ignore other methods...
}
```
The problem is that not only it optimizes the `collection.size` call, it also affects the behavior of `collection.contains`. If a collection is fully loaded, the `contains` method behave like a usual collection, which means the result depends on `equals` or `hashcode` method of its elements. Otherwise, it will send a SQL query based on the primary key of the given element instead of loading the whole collection. That's why I said the collection could behave unpredictably. To make this concrete, let's say our child entity has a unique business key "name", and we implement the `equals` and `hashcode` base on that key as we recommended.
```kotlin
@Entity
@Table(uniqueConstraints = [UniqueConstraint(columnNames = ["name"])])
class Child(
        @Column(unique = true)
        val name: String,

        @ManyToOne
        @JoinColumn
        val parent: Parent
) : AbstractPersistable<Int>() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Child

        if (name != other.name) return false

        return true
    }

    override fun hashCode(): Int {
        var result = 17
        result = 31 * result + name.hashCode()
        return result
    }
}
```
Then we may encounter the awkward situation below, `children.contains(child)` return inconsistent result depends on if the collection is loaded.
```kotlin
val tmp = Parent()
        .apply {
            addChild(Child("test", this))
        }
entityManager.persist(tmp)
entityManager.flush()
entityManager.clear()

val parent = entityManager.find(Parent::class.java, tmp.id)
val child = Child("test", tmp)

println(parent.children.contains(child))    // false
Hibernate.initialize(parent.children)
println(parent.children.contains(child))    // true
```
If `collection.contains()` method behaves unpredictable, the uniqueness contract of a set element will also be broken. You should be totally aware of these consequence before you decide to make a collection "extra" lazy.

### Pitfall 3: Statement may not be executed in the order in which it is written(during flushing)
Let's say we have the same model from the preceding example. To focus on this problem, we remove the `@LazyCollection` annotation from the children collection and change the child entity to have a composite unique key so that the child name uniqueness is limited in certain parent range.
```kotlin
@Entity
class Parent : AbstractPersistable<Int>() {

    @OneToMany(mappedBy = "parent", cascade = [CascadeType.ALL], orphanRemoval = true)
    // @LazyCollection(LazyCollectionOption.EXTRA)
    val children: MutableSet<Child> = mutableSetOf()

    // ignore other methods...
}

@Entity
@Table(uniqueConstraints = [UniqueConstraint(columnNames = ["name", "parent_id"])]) // note the "parent_id" column
class Child(
        val name: String,

        @ManyToOne
        @JoinColumn
        val parent: Parent
) : AbstractPersistable<Int>()
```
Now, suppose we need to update the children of a persisted parent, we may end up with writing code like this
```kotlin
val child = Child("foo", parent);
parent.children.clear()
parent.addChild(child)
entityManager.persist(parent)
entityManager.flush()
```
This code works fine in most case. However, if the parent already has a child called "foo", we'll encounter an `ConstraintViolationException`. Even though we've already removed all the existed children before adding. The reason is hibernate doesn't execute statements in the order in which the code is written during flushing. Instead, it has its own [defined order](http://docs.jboss.org/hibernate/orm/4.2/javadocs/org/hibernate/event/internal/AbstractFlushingEventListener.html#performExecutions%28org.hibernate.event.spi.EventSource%29), which says inserts always happen before deletes. So the same error can also be reproduced in another way:
```kotlin
val parent1 = Parent("foo")
val parent2 = Parent("foo")

entityManager.persist(parent1)
entityManager.flush()

entityManager.remove(parent1)
// to avoid the issue, we have to call flush here.
// otherwise the ConstraintViolationException will be thrown
// since hibernate will try to insert before deleting.
// entityManager.flush()
entityManager.persist(parent2)

entityManager.flush()  // throw ConstraintViolationException
```
As the code comments, we have to call addition `entity.flush()` after performing the delete action. Certainly it violates our intuition.
Reference:
- [Hibernate JPA: @OneToMany delete old, insert new without flush](https://stackoverflow.com/questions/17410868/hibernate-jpa-onetomany-delete-old-insert-new-without-flush)

### Pitfall 4: `PreUpdate` hook may not be invoked as you think
This time, We set up a `preUpdate` hook function to automatically record how many times an instance has been changed since it was persisted, and we also change the `children` property to be mutable for demonstrating sake.
```kotlin
@Entity
class Parent : AbstractPersistable<Int>() {

    @OneToMany(mappedBy = "parent", cascade = [CascadeType.ALL])
    var children: MutableSet<Child> = mutableSetOf()

    fun addChild(child: Child) {
        children.add(child)
    }

    fun removeChild(child: Child) {
        children.remove(child)
    }

    var updateTimes: Int = 0
        private set

    @PreUpdate
    fun preUpdate() {
        updateTimes++
    }

}
```
Then you'll see that mutate children **collection** won't trigger the hook, whereas mutating children **property** will. Because the dirty check mechanism won't detect the collection mutation.
```kotlin
val parent = Parent()

entityManager.persist(parent)
entityManager.flush()

println(parent.updateTimes) // 0

parent.children = mutableSetOf(Child("test1", parent))
entityManager.merge(parent)
entityManager.flush()

println(parent.updateTimes) // 1

parent.children.add(Child("test2", parent))
entityManager.merge(parent)
entityManager.flush()

println(parent.updateTimes) // 1
```
From the framework's perspective, this makes sense in a way, because detecting elements modification of a collection might be too expensive in such a case. But from a user's perspective, you may want to increase the `updateTimes` value whenever a model is updated.

### Pitfall 5: Delete action may be discarded silently
Again, with the same parent, child model. If you want to remove a child via `entityManager.remove` method, it simply doesn't work. The following code exhibits this phenomenon.
```
val parent = Parent()
val child = Child("test", parent)
parent.addChild(child)

entityManager.persist(parent)
entityManager.flush()

entityManager.remove(child) // will be discarded silently
entityManager.flush()

val res = entityManager.find(Child::class.java, child.id)

println(res == null)    // false
```
The reason is we have a cascade relation between parent and child entity. Either we remove the cascade property from `@OneToMany` annotation, or we have to ensure that the same entity is already removed from the `parent.children` collection. Otherwise, the delete action will be silently discarded as if the `entityManager.remove(child)` has never been called.

### Conclusion
JPA does a great job of saving programmers from writing SQL by hand, but write correct code with high performance in JPA may not as easy as you thought. Hopefully, this post can save you from making the same mistakes as I made.

