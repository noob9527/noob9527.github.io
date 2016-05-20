---
title: 为什么bootstrap采用border-box盒模型
categories: css
tags:
  - bootstrap
  - fontend
  - 前端工具
photos: /img/box-sizing.jpg
date: 2016-05-18 16:48:58
permalink:
---


> 作为前端萌新，想要制作自己的博客样式，自然首先想到bootstrap框架。在开发过程中我发现，bootstrap将全局范围的box-sizing属性重置成了border-box，而不是w3c默认的content-box。google中文结果没有查到bootstrap这么做的原因，甚至有人说这是bootstrap的一个坑(囧)，于是这里我把我查到的一些资料记录下来。

CSS盒模型指的是由content,padding,border,margin组成的框结构，相关内容每一本CSS书籍都有详细介绍，这里就不多说了，这篇文章主要讲的是当我们为元素指定width,height属性时，将如何影响到元素的显示效果。文章主要参考的是[box-sizing](https://css-tricks.com/box-sizing/)这篇文章，建议有英语基础的同学直接阅读该篇文章。

### 一.CSS盒模型历史
在CSS起源时期，w3c规范CSS盒模型默认按如下方式计算：
- width + padding + border = 元素实际可见的宽度
- height + padding + border = 元素实际可见的高度

这样的设计其实有点反人类，因为当你经过周密计算，将元素的宽度，高度设定好，并将其定位后。假设领导不满意，打算让你将border或padding加粗一个像素，有可能你就需要重新调整布局。IE浏览器很早就看到了这个隐患，并勇敢的站出来挑战规范！在IE5中实现了一个不一样的盒模型，它按如下方式来计算：
- width = 元素实际可见的宽度
- height = 元素实际可见的高度

这里面的width不再是content的宽度，而是包含了content,padding,border的总和，当你为元素添加的边框与内补越多，给内容留下的空间也就越少，这其实非常合理，并且更有利于开发人员的布局。然而它却不符合规范。于是微软在IE6版本就及时向规范妥协了，在此后的版本(IE6 - IE8)中，仅仅在“混杂模式(quirks mode)”下继续使用这个模型。顺便解释一下混杂模式，浏览器开发通常既要考虑到最新的web规范，又要考虑向后兼容，因此IE的开发者创建了两种呈现模式，即标准模式与混杂模式，前者主要用于兼容最新规范，后者主要用于兼容老的IE版本，在HTML代码中不使用或使用错误的DOCTYPE将进入混杂模式。

尽管规范中的盒模型有这样的缺陷，但是当人们理解并习惯了之后，发现用该模型进行开发也不算太难，只要在给元素设定尺寸的时候事先计算一下大概要给padding与border预留多少空间就可以了。然而当web开发进入响应式设计(Responsive Web Design)的时代后，相同的方式就不灵了，因为预留的固定像素无法自适应屏幕大小。

<!-- more -->
### 二.CSS3的box-sizing属性
为了适应移动互联网的浪潮，CSS3在提升响应式开发体验上下了很多功夫，比如说添加了media query媒介查询模块(CSS2.1中的@media属性只能用来区分媒体的类型，无法查询具体屏幕尺寸)，另一项重要的改进就是引入box-sizing属性来决定盒模型的渲染方式，它有三个可选值，分别是：content-box(默认值),padding-box,border-box。其中padding-box几乎没人用，content-box依然按照规范工作，而border-box则采取与老版本IE混杂模式中对盒模型相同的解释方式，这也是最流行的选项。看到这里，你也许仍然不明白border-box到底好在哪里，下面是一个Demo:

{% raw %}
<div style="border:5px solid #a57958;padding:10px">
	<p>按下按钮查看box-sizing属性对布局的影响</p>
    <button class="demo-btn btn btn-info">content-box</button>
    <button class="demo-btn btn btn-info">border-box</button>
    <div id="demo-container" class="clearfix" style="margin-top:10px">
    	<div style="margin:0 auto 5px;padding:10%;width:90%;border:5px solid #a57958">width=90%
        padding=10%
        border=5px</div>
    	<div style="float:left;width:50%;border:5px solid #a57958;height:100px;">width=50%
        border=5px</div>
    	<div style="float:left;width:50%;border:5px solid #a57958;height:100px;">width=50%
        border=5px</div>
    </div>
</div>
<script>
	$(".demo-btn").on("click",function(){
    	$("*").css("box-sizing",$(this).text());
    });
</script>
{% endraw %}

### 三.重置方法最佳实践
现在，我们已经知道了使用border-box盒模型进行布局更加简单，而除非你的代码是面向IE5用户开发的，否则都需要使用重置代码来修改默认的盒模型，最早人们使用通配符选择器(universal type selector)来重置所有元素的box-sizing属性。代码如下：
```css
* {
  box-sizing:border-box;
}
```
大部分情况下上述代码就够了，但它还遗漏了伪元素，改进后的代码如下：
```css
*,*:before,*:after{
  box-sizing:border-box;
}
```
以上也是bootstrap(v3.3.5)中使用的重置代码，它已经完全够用了，不过假如你的需求非常变态，想要在网页中混合使用content-box,padding-box,border-box,可以采用如下的重置代码：
```css
html{
  box-sizing:border-box;
}
*,*:before,*:after{
  box-sizing:inherit;
}
```
上面的代码可以让你的选择更加有弹性，可以为不同的布局容器指定各自的盒模型，而不用担心每个容器的子元素被全局样式重置。

### 四.浏览器支持
所有现代浏览器已经全部支持无前缀的box-sizing属性，如果你想要支持一些老到几乎没人用的浏览器版本(safari < 5.1,chrome < 10,firefox < 29)，可以像bootstrap一样为该属性加上浏览器前缀：
```css
*,*:before,*:after{
  -webkit-box-sizing:border-box;
  -moz-box-sizing:border-box;
  box-sizing:border-box;
}
```
不过padding-box因为没什么人用，所以一些浏览器可能会不支持。IE7及其以下版本不支持box-sizing属性。

















