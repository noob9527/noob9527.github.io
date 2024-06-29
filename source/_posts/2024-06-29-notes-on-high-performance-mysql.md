---
title: Notes on High Performance MySQL
categories: Backend
tags:
  - Database
  - SQL
date: 2024-06-29 18:15:31
photos:
---


> Notes on [High Performance MySQL](https://www.amazon.com/High-Performance-MySQL-Optimization-Replication/dp/1449314287/ref=sr_1_5?keywords=mysql&qid=1560589416&s=books&sr=1-5), for future reference.

### Chapter 4: Optimizing Schema and Data Types
#### Choosing Identifiers
> Integers are usually the best choice of identifiers. Avoid string types for identifiers if possible, because they take up a lot of space and are generally slower than integer types. You should also be very careful with completely “random” strings, such as those produced by MD5() , SHA1() , or UUID().

<!-- more -->

#### Datetime vs Timestamp
| type      | size   | date range | display depends on timezone? |
| -         | -      | -          | -                            |
| datetime  | 8 byte | 1001-9999  | no                           |
| timestamp | 4 byte | 1970-2038  | yes                          |

> Special behavior aside, in general if you can use TIMESTAMP you should, because it is
more space-efficient than DATETIME . Sometimes people store Unix timestamps as integer
values, but this usually doesn’t gain you anything. The integer format is often less
convenient to deal with, so we do not recommend doing this.

#### Avoid NULL if possible
> We suggest considering alternatives when possible. Even when you do need to store a "no value" fact in a table, you might not need to use NULL. Perhaps you can use zero, a special value, or an empty string instead. However, don’t be too afraid of using NULL when you need to represent an unknown value. In some cases, it’s better to use NULL than a magical constant. Selecting one value from the domain of a constrained type, such as using −1 to represent an unknown integer, can complicate your code a lot, introduce bugs, and just generally make a total mess out of things. Handling NULL isn't always easy, but it’s often better than the alternative.

However, in my point of view, if you need to store a "no value" fact, NULL is always the best choice, every programmer understand its meaning, the little performance improvements(by avoid null value) should not be taken into consideration until it really bothers you, besides, the fact that your default value take less space and has better performance is highly depends on implementation detail of the store engine. It's hard to conclude that it will be always true in future releases, let alone other store engines and other database products.

### Chapter5: Indexing for high performance
#### Types of queries that can use a B-Tree index.
> Suppose we have the following table:
```sql
CREATE TABLE People (
    last_name varchar(50) not null,
    first_name varchar(50) not null,
    dob date not null,
    gender enum('m', 'f')not null,
    key(last_name, first_name, dob)
);
```
> The index will be useful for the following kinds of queries:
- Match the full value
    A match on the full key value specifies values for all columns in the index. For example, this index can help you find a person named Cuba Allen who was born on 1960-01-01.
- ** Match a leftmost prefix **
    This index can help you find all people with the last name Allen. This uses only the first column in the index.
- ** Match a column prefix **
    You can match on the first part of a column's value. This index can help you find all people whose last names begin with J. This uses only the first column in the index.
- Match a range of values
    This index can help you find people whose last names are between Allen and Barrymore. This also uses only the first column.
- Match one part exactly and match a range on another part
    This index can help you find everyone whose last name is Allen and whose first name starts with the letter K (Kim, Karl, etc.). This is an exact match on `last_name` and a range query on `first_name` .
- Index-only queries
    B-Tree indexes can normally support index-only queries, which are queries that access only the index, not the row storage. We discuss this optimization in "Covering Indexes" on page 177.

> Here are some limitations of B-Tree indexes:
- They are not useful if the lookup does not start from the leftmost side of the indexed columns. For example, this index won't help you find all people named Bill or all people born on a certain date, because those columns are not leftmost in the index.  Likewise, you can't use the index to find people whose last name ends with a particular letter.
- You can't skip columns in the index. That is, you won't be able to find all people whose last name is Smith and who were born on a particular date. If you don't specify a value for the `first_name` column, MySQL can use only the first column of the index.
