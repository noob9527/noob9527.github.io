---
title: 
categories: 
tags: 
photos:
---

> 


## activation function
### Logistic Sigmoid(standard logistic function)
> A sigmoid function is any mathematical function whose graph has a characteristic S-shaped or sigmoid curve.

![logistic-sigmoid](/img/content/math-in-machine-learning/logistic-sigmoid.svg)

$$\sigma(x) = \frac{1}{1+e^{-x}} = \frac{e^x}{1+e^x} = 1-\sigma(-x)$$
$$\frac{d\sigma(x)}{dx} = \frac{e^x(1+e^x) - e^xe^x}{(1+e^{x})^2} = \frac{e^x}{(1+e^{x})^2} = \frac{e^x}{1+e^{x}}*\frac{1}{1+e^{x}} = \sigma(x)(1 - \sigma(x))$$

In the deep learning field, we might use logistic to perform "logistic regression". e.g. Given a feature vector $\vec{ x }$ that represents a image, we want to output if it is a cat picture, that is, we want to output a number between [0, 1], which represents the probability of the picture to be a cat picture. The function might look like the following, where $\vec{w}$ and b represents the parameters of the neural network, which is learned in the training process.
$$y = \sigma(\vec{w}^T\vec{x} + b)$$

Reference:
- Deep Learning P65, P189
- Logistic Regression by Andrew NG

### Softmax
#### temperature
![softmax-with-temperature](/img/content/math-in-machine-learning/softmax-with-temperature.png)

In practice, we often see softmax with temperature, which is a slight modification of softmax:

$$p_i = \frac{\exp(x_i/\tau)}{\sum_{j=1}^{N}\exp(x_j/\tau)}$$

The parameter $\tau$ is called the temperature parameter1, and it is used to control the softness of the probability distribution. When $\tau$ gets lower, the biggest value in $x$ get more probability, when $\tau$ gets larger, the probability will be split more evenly on different elements. Consider the extreme cases where $\tau$ approaches zero, the probability for the largest element will approach 1, while when $\tau$ approaches infinity, the probability for each element will be the same.

```python
import numpy as np


def softmax(arr, temperature = 1):
    return np.exp(np.divide(arr, temperature)) / sum(
        np.exp(np.divide(arr, temperature)))


array = np.array([1, 2, 3, -1])
print(softmax(array))
print(softmax([1, 2, 3, -1], temperature = 100))
print(np.sum(softmax(array)))
print(np.sum(softmax([1, 2, 3, -1], temperature = 100)))
```