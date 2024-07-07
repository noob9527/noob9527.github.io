---
title: Notes on Deep Learning
categories:
tags:
photos:
permalink:
---


### Machine learning
$$f(x) = y$$
In the normal programming workflow, we usually are given an input x, our task is precisely express the function in our programming language, so that it output the expected y.  
In the machine learning workflow, we usually are give a set of training examples, let's say $[(x_1, y_1), (x_2, y_2), ..., (x_m, y_m)]$, our task is to use some techniques to guess the function. i.e. the output is the approximate of the function f(x).

Linear regression can be the simplest case of machine learning. 

### Logistic Regression
e.g. Given a feature vector $\vec{ x }$ that represents a image, we want to output if it is a cat picture, that is, we want to output a number between [0, 1], which represents the probability of the picture to be a cat picture. The final function might look like the following:
$$y = \sigma(\vec{w}^T\vec{x} + b)$$

Given m training examples ${(x_1, y_1), (x_2, y_2), ..., (x_m, y_m)}$. Our task is to figure out what's the proper parameters $\vec{w}$ and b.
