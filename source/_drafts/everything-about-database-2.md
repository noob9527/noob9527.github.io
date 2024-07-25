---
title: Everything about Database(2)
categories: Backend
tags: 
  - Database
  - SQL
photos:
---

> 分享一些我对数据库的理解 TL;DR

## SQL vs NoSQL
NoSQL 在 2015 年左右是特别火的概念，当时最流行的数据库是 MongoDB, MongoDB 可以直接用 JavaScript 做查询语言，加上刚出的 NodeJS，前端，后端，数据库都用 JS 开发，可以提供一致的开发体验。

当时我因为什么都不会，所以没有技术偏好，如果站在现在的角度来看，我总会优先选择关系型数据库(SQL or New SQL)来处理 OLTP 工作流，在解释原因之前，先大致介绍一下 NoSQL 数据库的特点：
- 轻量事务或无事务(lightweight/no transaction)
- 反范式化(denormalization)
- 面向查询(query first design)
- 舍弃传统的 SQL 查询语言
- 舍弃模式和约束(no schema, no constraints)
- 舍弃连表(no joins)

我理解所有特点本质都是为了速度，但我依然认为还有对开发者而言更优的选择。

### Declarative Query vs Imperative Query
NoSQL 数据库最鲜明的特点是不再使用 SQL 作为查询语言，

### Transactional vs Non-Transactional
如果我没记错，是推特，微博等社交媒体类应用带火了 NoSQL。这类应用的特点是，正确性没那么重要，一切以快为基础。

### Data-first vs Query-first

## OLTP vs OLAP
