---
title: '永远记不住的编程姿势:零宽断言(lookaround)'
categories: 永远记不住的编程姿势
tags: 编程技巧
photos: img/regular-expression-lookaround.jpg
date: 2017-01-03 23:16:58
permalink:
---


> 零宽断言(lookaround/zero-width assersion)是正则表达式中非常常用的特性，但是因为其一些带误导性的中文翻译和易于混淆的写法，让我一度每次使用都要先查文档。

### 一.写在前面
这篇文章讲的东西非常基础，之所以要写一遍完全是因为我智商经常离线，老把它们写混。如果你对下面五种模式及其用途了然于心，请不要浪费时间读这篇文章。
- `(?:pattern)`非捕获匹配(matches pattern but does not capture the match)
- `(?=pattern)`零宽正向先行断言(lookahead)
- `(?!pattern)`零宽负向先行断言(negative lookahead)
- `(?<=pattern)`零宽正回顾后发断言(lookbehind)
- `(?<!pattern)`零宽负回顾后发断言(negative lookbehind)

之所以我要在每种模式后打出它的英文表达方式，不是为了装B，而是想让大家感受一下这个翻译(msdn,javascript权威指南等多本书籍或文档采用这样，或者类似这样的翻译)。我反正是第一次体会到英文看的明明白白，中文看得一头雾水的感觉。

<!-- more -->

### 二.功能介绍
相比理解这些模式的中文名，理解它们的用法要简单得多。（更多详情可以参见文章最后的测试用例）
- `(?:a)(b)\\1`匹配abb，如果是`(a)(b)\\1`则匹配aba，`(?:pattern)`表示匹配但不捕获，可以将其理解成不创建分组的`(pattern)`。
- `a(?=b)`断言a后面有b，匹配ab但不匹配aa，最终捕获a。（个人认为应该翻译成*正向肯定查找*）
- `a(?!b)`断言a后面没有b，匹配aa但不匹配ab，最终捕获a。（个人认为应该翻译成*正向否定查找*）
- `(?<=a)b`断言b前面有a，匹配ab但不匹配bb，最终捕获b。（个人认为应该翻译成*反向肯定查找*）
- `(?<!a)b`断言b前面没有a，匹配bb但不匹配ab，最终捕获b。（个人认为应该翻译成*反向否定查找*）

### 三.Polyfill
lookbehind目前还处在es7的[提案](https://github.com/goyakin/es-regexp-lookbehind)阶段，因此无法在js中直接使用（也正因为如此，VSC的查找与替换不支持lookbehind），新版的V8引擎已经实现了该功能。不过需要在浏览器设置中打开“#enable-javascript-harmony”开关（在chrome地址栏输入*about:flags*设置）
在js实现该功能之前，可以使用捕获与引用来达成类似的效果，举例来说如果你需要将所有前面带有static修饰符的int，替换成long，在支持lookbehind的编辑器中可以直接查找`(?<=static\s)int`，并将其替换成`long`。而在不支持lookbehind的环境下（vscode别瞅了，说的就是你！），可以查找`(static\s)int`，将其替换成`$1long`。

### 四.Code Demo
Polyfill Demo(js)
```javascript
//测试依赖mocha,shouldjs
describe('polyfill', function () {
    it('使用捕获与引用来替代lookbehind', function () {
        'static int'.replace(/(static\s)int/, '$1long')
            .should.equal('static long');
    });
});
```

Feature Demo(java)
```java
//测试依赖junit4,assertj
@Test
public void matchButNotCapture() throws Exception {
    String exp = "(?:a)(b)\\1";
    //由于(?:)不创建引用，因此\1引用了(b)捕获的字符串
    Assertions.assertThat(Pattern.matches(exp, "aba")).isFalse();
    Assertions.assertThat(Pattern.matches(exp, "abb")).isTrue();
    //只有一个分组
    Assertions.assertThat(Pattern.compile(exp).matcher("abb").groupCount()).isEqualTo(1);
}

@Test
public void lookahead() throws Exception {
    //匹配后面有b的a
    String exp = "a(?=b)";
    Assertions.assertThat(Pattern.compile(exp).matcher("aa").find()).isFalse();
    //zero-width
    Matcher matcher = Pattern.compile(exp).matcher("ab");
    Assertions.assertThat(matcher.find()).isTrue();
    Assertions.assertThat(matcher.group()).isEqualTo("a");
}

@Test
public void negativeLookahead() throws Exception {
    //匹配后面没有b的a
    String exp = "a(?!b)";
    Assertions.assertThat(Pattern.compile(exp).matcher("ab").find()).isFalse();
    //zero-width
    Matcher matcher = Pattern.compile(exp).matcher("aa");
    Assertions.assertThat(matcher.find()).isTrue();
    Assertions.assertThat(matcher.group()).isEqualTo("a");
}

@Test
public void lookbehind() throws Exception {
    //匹配前面有a的b
    String exp = "(?<=a)b";
    Assertions.assertThat(Pattern.compile(exp).matcher("bb").find()).isFalse();
    //zero-width
    Matcher matcher = Pattern.compile(exp).matcher("ab");
    Assertions.assertThat(matcher.find()).isTrue();
    Assertions.assertThat(matcher.group()).isEqualTo("b");
}

@Test
public void negativeLookbehind() throws Exception {
    //匹配前面没有a的b
    String exp = "(?<!a)b";
    Assertions.assertThat(Pattern.compile(exp).matcher("ab").find()).isFalse();
    //zero-width
    Matcher matcher = Pattern.compile(exp).matcher("bb");
    Assertions.assertThat(matcher.find()).isTrue();
    Assertions.assertThat(matcher.group()).isEqualTo("b");
}
```

