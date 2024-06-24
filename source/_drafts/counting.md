---
title: Counting
categories: 数学笔记
tags: 
  - Descrete Mathematic
  - Mathematic
photos:
# permalink: /single-variable-calculus
---


> 自学数学时的笔记，以前的笔记都是手写的，难以检索，选重要的迁移到网上来


### Permutations
todo

where $P(n, k) = \frac{ n! }{ ( n - k )! }$

### Combinations

${}_n \mathrm{ C }_k - C(n, k) = \dbinom{ n }{ k }$

where $C(n, k) = \frac{ n! }{ k! ( n - k )! } = P(n, k) / k!$

**注意，貌似国内比较喜欢用 $C^k_n$ 来表示，其 n, k 位置正好相反**

### The Binomial Theorem
$$(x+y)^n=\sum_{i=0}^n x^{n - i}{y^i}=\binom{ n }{ 0 }x^n + \binom{ n }{ 1 }x^{n-1}y +...+ \binom{ n }{ n-1 }xy^{n-1} + \binom{ n }{ n-1 }y^{n}$$