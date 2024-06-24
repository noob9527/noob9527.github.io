---
title: Single Variable Calculus
categories: 数学笔记
tags: Mathematic
photos:
# permalink: /single-variable-calculus
---


> 自学数学时的笔记，以前的笔记都是手写的，难以检索，选重要的迁移到网上来


## Lesson 1
### Derivatives
$$\frac{ d }{ dx }f(x) = \lim_{ x \to x_0 } \frac{f(x) - f(x_0)} {x - x_0} $$

$$\iff \frac{ d }{ dx }f(x) = \lim_{ \Delta{x} \to 0 } \frac{f(x + \Delta{x}) - f(x)} {\Delta{x}} $$

### $\frac{ d }{ dx }x^n = nx^{n-1}$
$$\frac{ d }{ dx }x^n = \lim_{ \Delta{x} \to 0 } \frac{(x+\Delta{x})^n - x^n} {\Delta{x}} $$

证明： 依据 Binomial Theorem
$$(x+y)^n=\sum_{i=0}^n x^{n - i}{y^i}=\binom{ n }{ 0 }x^n + \binom{ n }{ 1 }x^{n-1}y +...+ \binom{ n }{ n-1 }xy^{n-1} + \binom{ n }{ n-1 }y^{n}$$
{% raw %}
$$
\begin{aligned} \implies \lim_{ \Delta{x} \to 0 } \frac{(x+\Delta{x})^n - x^n} {\Delta{x}} 
  &= \lim_{ \Delta{x} \to 0 } \frac{\binom{ n }{ 0 }x^n + \binom{ n }{ 1 }x^{n-1}\Delta{x} +...+ \binom{ n }{ n-1 }x\Delta{x}^{n-1} + \binom{ n }{ n-1 }\Delta{x}^{n} - x^n} {\Delta{x}} 
  \\ &= nx^{n-1} \end{aligned}
$$
{% endraw %}

### $\frac{ d }{ dx }x^{-1} = -x^{-2}$
$$\frac{ d }{ dx }x^n = \lim_{ \Delta{x} \to 0 } (\frac{1}{x+\Delta{x}} - \frac{1}{x})\frac{1}{\Delta{x}} = -\frac{1}{x^2}  $$

references:
- MIT OCW 18.01 Lession 1 

## Lesson 2
### Limit
- $\lim_{ x \to +x_0 } f(x)$ Right-hand side limit, $x > x_0$
- $\lim_{ x \to -x_0 } f(x)$ left-hand side limit, $x < x_0$

#### Solve Limit
Easy case: just plug in and get its value.
$$\lim_{ x \to 4 } \frac{x + 3} {x^2 + 1} = 7/17 $$

Derivatives are always header, plug in $\Delta{x} = 0$ will always get 0/0:
$$\lim_{ \Delta{x} \to 0 } \frac{f(x + \Delta{x}) - f(x)} {\Delta{x}} \rightarrow \frac{0}{0} $$

We need some sort of cancellation.

references:
- MIT OCW 18.01 Lession 2 

### Continuous
Continuous, Definition:
If f is continuous at $x_0$, means:
1. $\lim_{x \to x_0} f(x)$ exists, from left and right side, they are the same.
2. $f(x_0)$ is defined
3. $\lim_{x \to x_0} f(x) = f(x_0) \iff \lim_{ x \to +x_0 } f(x) = \lim_{ x \to -x_0 } f(x) = f(x_0)$

Discontinuity:
- Jump discontinuity: limit from left and right exists, but they are not the same
- Removable discontinuity: limit from left and right are equal, but they don't equal to $f(x_0)$  
  {% raw %} e.g. $f(x)=\frac{sin(x)}{x}$, $\lim_{x \to 0}\frac{sin(x)}{x} = 1$, f(0) is undefined. {% endraw %}
- Infinite discontinuity:  
  {% raw %} e.g. $\frac{d}{dx} \frac{1}{x}=\frac{-1}{x^2}$, for the function $f'(x) = \frac{-1}{x^2}$, $\lim_{ x \to +x_0 } f'(x) = \lim_{ x \to -x_0 } f'(x) = -\infty $ {% endraw %}
- Other discontinuity:  
  e.g. $y = sin(\frac{1}{x})$

references:
- MIT OCW 18.01 Lession 2 

### Differentiable
Theorem: Differentiable => Continuous  
If f is differentiable at $x_0$, then f is continous at $x_0$.  
Proof:
1. We want to prove $\lim_{x \to x_0} f(x) = f(x_0)$, which means $\lim_{x \to x_0} f(x) - f(x_0) = 0$
2. Rewrite the equation, multpling and dividing by $x - x_0$, get $\lim_{x \to x_0}\frac{f(x) - f(x_0)}{x - x_0}(x - x_0)$
3. $\lim_{x \to x_0}\frac{f(x) - f(x_0)}{x - x_0} = f'(x_0)$ => $f'(x_0)\lim_{x \to x_0}(x - x_0)$ => $f'(x_0) * 0$

references:
- MIT OCW 18.01 Lession 2 

## Lesson 3
- $\frac{ d }{ dx }sinx = cosx$
- $\frac{ d }{ dx }cosx = - sinx$
- $(u + v)' = u' + v'$
- $(cu)' = cu'$

references:
- MIT OCW 18.01 Lession 3 

## Lesson 4
- $(uv)' = u'v + uv'$
- $(\frac{u}{v})' = \frac{u'v - v'u}{v^2}$
- $\frac{ d }{ dx }x^{-n} = -nx^{-n-1}$

### Chain Rule(链式法则)
$$\frac{d}{dx}u = \frac{du}{dv} * \frac{dv}{dx}$$

### Higher Derivatives
$$\frac{d}{dx}u = u' = D$$
$$u'' = \frac{d^2}{dx^2}u = D^2u$$

references:
- MIT OCW 18.01 Lession 4 

## Lesson 5
### Implicit derivatives
This allow us to find the derivative of any inverse f' provided we know the derivative of the function. e.g.  
$$y = sin^{-1}x$$

$$ \implies siny = x$$

$$\frac{d}{dx}(siny = x) \implies \frac{d}{dx}siny = \frac{d}{dx}x = 1$$

$$ \text{chain rule} \implies \frac{d}{dx}siny = \frac{d}{dy}siny\frac{dy}{dx} = 1$$

$$ \frac{dy}{dx} = \frac{1}{cosy} = \frac{1}{\sqrt{1-sin^2y}} = \frac{1}{\sqrt{1-x^2}}$$

### $\frac{ d }{ dx }x^{\frac{m}{n}} = \frac{m}{n}x^{\frac{m}{n}-1}$
Proof: 
$$y = x^{\frac{m}{n}} \iff x^m = y^n$$

$$\frac{d}{dx}(x^m = y^n) \implies mx^{m-1} = ny^{n-1}y'$$

$$\implies y' = \frac{mx^{m-1}}{ny^{n-1}} = \frac{mx^{m-1}}{nx^{\frac{m}{n}(n-1)}}=\frac{m}{n}x^{(m-1)-\frac{m}{n}(n - 1)}$$

$$\implies y'=\frac{m}{n}x^{\frac{m}{n}-1}$$

references:
- MIT OCW 18.01 Lession 5 

## Lesson 6
1. $\frac{d}{dx}a^x=a^xln a$
2. $\frac{d}{dx}ln x=\frac{1}{x}$  
  $y = ln x \implies e^y = x \implies \frac{d}{dx}e^y = \frac{d}{dx}x = 1 \implies \frac{d}{dy}e^y\frac{dy}{dx} = 1 \implies y'=\frac{1}{e^y}=\frac{1}{x}$

3. $\frac{d}{dx}a^x=a^xln a$
4. $\frac{d}{dx}a^x=a^xln a$

references:
- MIT OCW 18.01 Lession 6 

## Lesson 7(Unit 1 Review)
Ignore

references:
- MIT OCW 18.01 Lession 7 