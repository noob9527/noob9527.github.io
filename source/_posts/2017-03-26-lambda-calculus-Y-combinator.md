---
title: 'lambda calculus:Y-combinator'
categories: Functional Programming
tags: Lambda Calculus
photos: /img/lambda-calculus.jpg
date: 2017-03-26 15:49:26
---


> 上篇文章的末尾提到了一个问题，如何使用λ演算实现递归函数？其中最出名的解决方案是由数学家[Haskell B. Curry](https://en.wikipedia.org/wiki/Haskell_Curry)发现的一个被称为Y-combinator的函数。

### 一.推导过程
Y-combinator简单来说就是一个输入函数，返回该函数递归版本的函数。关于它的推导我读了很多文章，以下是我总结的一个*个人认为*比较好理解的版本。（本文代码，可以在[y-combinator-js](https://github.com/noob9527/y-combinator-js/blob/master/demo.js)仓库中下载）
#### Step1
首先回到大家学习递归函数的起点，阶乘函数，以下是js版本：
```javascript
const FACT10 = 3628800;
function factorial(n) {
    return n === 0 ? 1 : n * factorial(n - 1);
}
factorial(10).should.equal(FACT10);
```
现在我们的问题是如何将其转换为合法的λ表达式，换句话说如何将其转换为匿名函数？唯一的可能就是把factorial作为参数传入，下面是修改后的版本：
```javascript
//注意下面的anonymous函数名是不必要的，可以直接写成立即执行函数(IIFE)，之所以我没那样写是为了读起来更清晰
//es5
function anonymous1(factorial) {
    return function (n) {
        return n === 0 ? 1 : n * factorial(n - 1);
    };
}
//es6
const anonymous2 = f => (n => n == 0 ? 1 : n * f(n - 1));
anonymous1(factorial)(10).should.equal(FACT10);
anonymous2(factorial)(10).should.equal(FACT10);
```
现在已经可以使用λ表达式来描述上面的递归函数了，λ演算版本大概长这样(看不懂不要紧，描述的意思跟上面的anonymous函数是一样的)
```
λf.λn.ISZERO n 1 (MULT n (f (PRED n)))
```
不过事情并没有这么简单，仔细想想我们刚才干了啥？我们定义了一个阶乘函数，但是这个阶乘函数却需要一个已经存在的阶乘函数作为参数才可以正常工作，它就像这个手电筒。

<div align="center">
![electric torch](/img/content/electric-torch.png)
</div>

换句话说，如果给上面的anonymous函数传入一个阶乘函数，它就能返回一个阶乘函数，如果传入的不是阶乘函数，返回的也肯定不是阶乘函数（请叫我达文西...）。

<!-- more -->

#### Step2
上面的函数没办法满足我们的需求。我们要的函数，必须输入一个不是阶乘函数的函数，返回一个阶乘函数，就像我们要的手电筒必须输入电能（或别的什么“能”），输出光能。总之不能是“输入光能，输出光能”。因此，把上面的版本改一下，这次我不要求输入阶乘函数了，你就给我一个**自己调用自己就能产生阶乘函数**的函数吧。
```javascript
function anonymous(whatever) {
    return function (n) {
        return n === 0 ? 1 : n * (whatever(whatever))(n - 1);
    };
}
```
经过上面的修改之后，anonymous函数要求的输入是一个自己调用自己能返回阶乘函数的函数，输出是我们要的阶乘函数，可是我们上哪去找自己调用自己能返回阶乘函数的函数呢？这一步需要点脑洞，试想一下，假如我们用anonymous函数自己调用自己会发生什么？你猜的没错，anonymous函数要求的输入就是它自身，调用方式如下：
```javascript
anonymous(anonymous)(10).should.equal(FACT10);
```
始终记得anonymous函数名不是必须的，上面的调用已经完全可以使用匿名函数表达：
```javascript
(function (whatever) {
    return function (n) {
        return n === 0 ? 1 : n * (whatever(whatever))(n - 1);
    };
})(function (whatever) {
    return function (n) {
        return n === 0 ? 1 : n * (whatever(whatever))(n - 1);
    };
})(10).should.equal(FACT10);
```
等价的λ演算语法如下:
```
(λf.λn.ISZERO n 1 (MULT n (f f (PRED n)))(λf.λn.ISZERO n 1 (MULT n (f f (PRED n))))
```
现在我们要的匿名递归函数已经创建完成，不过有代码洁癖的同学应该没法接受上面的代码，接下来需要尝试提取出重复的逻辑。

#### Step3
首先把碍眼的自身调用自身的逻辑封装成一个单独的callSelf函数：
```javascript
function anonymous(whatever) {
    function callSelf(n) {
        return whatever(whatever)(n);
    }
    return function (n) {
        return n === 0 ? 1 : n * callSelf(n - 1);
    }
}
```
之后可以把callSelf函数作为参数传给返回的函数：
```javascript
    function anonymous(whatever) {
        function callSelf(n) {
            return whatever(whatever)(n);
        };
        return (function (whatever) {
            return function (n) {
                return n === 0 ? 1 : n * whatever(n - 1);
            };
        })(callSelf);
    }
```
也许你已经发现了，返回的那一坨跟我们在[Step1](#Step1)中定义的函数有点像！把它拎出来围观一下：
```javascript
function step1_anonymous(factorial) {
    return function (n) {
        return n === 0 ? 1 : n * factorial(n - 1);
    };
}
function anonymous(whatever){
    function callSelf(n) {
        return whatever(whatever)(n);
    };
    return step1_anonymous(callSelf);
}
anonymous(anonymous)(10).should.equal(FACT10);
```
现在代码总算看起来舒服多了，不过还有个问题，总不能每次都像`anonymous(anonymous)(10)`这样调用阶乘函数吧？既然`anonymous(anonymous)`会返回我们要的函数，干脆把它封装成一个factorialFactory(工厂函数)，这个函数还可以接受一个参数，顺便把**step1_anonymous**传进去就好了：
```javascript
function step1_anonymous(factorial) {
    return function (n) {
        return n === 0 ? 1 : n * factorial(n - 1);
    };
}
function factorialFactory(step1_anonymous) {
    //return anonymous(anonymous);
    return (function(whatever) {
        function callSelf(n) {
            return whatever(whatever)(n);
        };
        return step1_anonymous(callSelf);
    })(function(whatever) {
        function callSelf(n) {
            return whatever(whatever)(n);
        };
        return step1_anonymous(callSelf);
    });
}
factorialFactory(step1_anonymous)(10).should.equal(FACT10);
```
最后，将里面用到的函数重写成匿名版本：
```javascript
//全箭头函数版本：const Y = f => (x => f(n => x(x)(n)))(x => f(n => x(x)(n)));
//λ演算版本：λf.(λx.f(λn.x x n))(λx.f(λn.x x n))
const Y = function (f) {
    return (function (x) {
        return f(n => x(x)(n));
    })(function (x) {
        return f(n => x(x)(n));
    });
};
Y(step1_anonymous)(10).should.equal(FACT10);
```
由于计算阶乘的逻辑已经全部提取到step1_anonymous函数中，因此factorialFactory已经不再局限于制造阶乘函数，而是一个输入任意函数，就可以返回输入函数的递归版本的函数。也就是本文的主角Y-combinator，下面使用斐波那契数列计算函数来测试一下。
```javascript
const FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
const fibonacci = Y(fib => (n => (n <= 2 ? 1 : fib(n - 1) + fib(n - 2))));
fibonacci(5).should.equal(FIB[5]);
fibonacci(10).should.equal(FIB[10]);
```
以上就是推导**Y**的全部过程，为了让它容易理解，我只展示了必要的步骤。后面还会谈到一些你应该知道的细节。

### 二.求值策略(evaluation strategy)
函数调用的求值策略分为传值调用(Eager Evaluation及早求值)与传名调用(Lazy Evaluation惰性求值)，二者的区别在于参数计算时机的不同。考虑下面这个js函数调用：
```javascript
function identity(x){
	return x;
}
let a = 0;
identity(0, a++);
console.log(a) //1
```
identity函数在调用之前就执行了a++表达式，而事实上函数体内根本没有用到该参数，这代表js函数是传值调用。传名调用指的是只有在需要用到的时候，才计算参数的值。大部分情况下，传值调用与传名调用会得到相同的结果。不过也有一些例外，比如上面推导过程的callSelf函数：
```javascript
function anonymous(whatever){
    function callSelf(n) {
        return whatever(whatever)(n);
    };
    return step1_anonymous(callSelf);
}
```
乍一看会发现它应该可以写成这样：
```javascript
function anonymous(whatever){
    return step1_anonymous(whatever(whatever));
}
```
这种写法在传名调用的语言中可以正常工作，但是在像js这样的传值调用语言中不行，因为在step1_anonymous调用之前，就会计算whatever(whatever)的值，然后无限递归导致**stackoverflow**异常。而将`whatever(whatever)`改写成`n=>whatever(whatever)(n)`使用的正是在上篇文章中提到的[η变换(Eta-conversion)](/post/2017/03/lambda-calculus-introduction/#3-化简规则)。下面分别列出在两种求值策略中的Y：
- 传值调用：`λf.(λx.f(λn.x x n))(λx.f(λn.x x n))`
- 传名调用：`λf.(λx.f(x x))(λx.f(x x))`

目前我只知道haskell采取传名调用的求值策略，其它主流编程语言(java,c,js...)都采取传值调用，关于二者更详细的分析可以参考[这篇文章](http://www.yinwang.org/blog-cn/2013/04/01/lazy-evaluation)。

### 三.函数的不动点(fix point)
让我们再度回到[Step1](/#Step1)中的阶乘函数，这个函数在计算0的阶乘时，不需要调用传入的函数，因此传入任意一个函数，都会返回一个能够正确计算0!的函数，这里先取名叫fact0：
```javascript
function anonymous(factorial) {
    return function (n) {
        return n === 0 ? 1 : n * factorial(n - 1);
    };
}
function whatever(x) {
    throw new Error('Gotcha!');
}
const fact0 = anonymous(whatever);
fact0(0).should.equal(1);
t.throws(() => fact0(1), 'Gotcha!');
```
上面的代码展示了使用fact0计算0的阶乘，能够得到正确的结果1。但是如果使用它计算1的阶乘我们就露陷了，因为它需要调用传入的函数来计算**n-1(也就是0)**的阶乘。换句话说，如果需要得到能够计算1的阶乘的函数，我们需要传入一个可以正确计算0的阶乘的函数。幸运的是，手头上的fact0就是这个函数，因此把fact0作为参数再次调用anonymous就能得到一个可以计算1的阶乘的函数：
```javascript
const fact1 = anonymous(fact0)	//也就是anonymous(anonymous(whatever));
fact1(1).should.equal(1);
t.throws(() => fact1(2), 'Gotcha!');
```
同理，使用fact1作为参数就可以得到能够计算2的阶乘的函数，我们可以重复这个过程直到我们满意为止。
```javascript
const fact0 = anonymous(whatever);
const fact1 = anonymous(anonymous(whatever));
const fact2 = anonymous(anonymous(anonymous(whatever)));
const fact3 = anonymous(anonymous(anonymous(anonymous(whatever))));
// const factn = anonymous(anonymous(anonymous(n...)))

fact0(0).should.equal(factorial(0));
t.throws(() => fact0(1), 'Gotcha!');
fact1(1).should.equal(factorial(1));
t.throws(() => fact1(2), 'Gotcha!');
fact2(2).should.equal(factorial(2));
t.throws(() => fact2(3), 'Gotcha!');
fact3(3).should.equal(factorial(3));
t.throws(() => fact3(4), 'Gotcha!');
// factn(n).should.equal(factorial(n));
```
现在假设我们要计算n的阶乘，我们有两种选择，一种是将上面的过程重复n次，得到一个能够计算n的阶乘的函数。另一种是找一个函数** fix **，使得** fix = anonymous(fix) **，这样就不再需要重复n次了，因为不管重复多少次，得到的结果都一样。这里的** fix **就称之为函数anonymous的不动点(fix point)。比如说x=0，就是函数f(x)=x^2的不动点，因为0=f(0)=f(f(0))...。
根据上面的分析，我们可以定义一个函数** Y **，** Y **接收一个函数作为参数，返回这个函数的不动点。即有** Y(f) = fix = f(fix) = f(Y(f)) **，根据这条规则，很容易使用js递归函数来定义Y：
```javascript
function Y(f) {
    return f(Y(f));
}
```
现在可以尝试把anonymous函数传进去，看看它是否跟我们想的一样有效。由于js的急性求值策略，你会发现像`Y(anonymous)`这样的调用，会导致**stackoverflow**异常。所幸的是经过之前的学习，我们已经知道可以使用** η变换 **来避免这个问题。下面改写这个函数：
```javascript
//eta conversation Y(f) = λx.Y(f)(x)
function Y(f) {
    return f(x => Y(f)(x));
}
Y(anonymous)(10).should.equal(FACT10);
```
上面的Y函数作用等价于Y-combinator，满足Y函数（即** Y(f) = f(Y(f)) **）定义的[combinator](https://wiki.haskell.org/Combinator)被称为不动点组合子(fixed-point combinator)，而Y-combinator只是其中之一。

### 四.总结
需要注意的是，YC并不能降低算法的复杂度，因此不要尝试在生产环境中使用它，除非你知道自己在做什么。。。

参考链接：
- [How to reinvent the Y combinator](https://yinwang0.wordpress.com/2012/04/09/reinvent-y/)
- [(译) The Y combinator (Slight Return)](http://shellfly.org/blog/2015/01/07/yi-the-y-combinator-slight-return/)
- [Fixed-point combinator](https://en.wikipedia.org/wiki/Fixed-point_combinator)