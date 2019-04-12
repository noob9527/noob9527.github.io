---
title: paxos
categories:
tags:
photos:
permalink:
---

> 

<!-- more -->
- safety
    Assume a collection of processes that can propose values. A consensus al-
    gorithm ensures that a single one among the proposed values is chosen. If
    no value is proposed, then no value should be chosen. If a value has been
    chosen, then processes should be able to learn the chosen value. The safety
    requirements for consensus are:
    • Only a value that has been proposed may be chosen,
    • Only a single value is chosen, and
    • A process never learns that a value has been chosen unless it actually
    has been.

- liveness
    - Some proposed value is eventually chosen
    - If a value is chosen, servers eventually learn about it
    We won’t try to specify precise liveness requirements. However, the goal is
    to ensure that some proposed value is eventually chosen and, if a value has
    been chosen, then a process can eventually learn the value.

### Real life model
Publisher(proposer), Agent(acceptor), Assassin(learner), God Model

safety 属性：一旦某个值被大多数人选定，则该值就是最终值

1. 如果只有一个提案被提出，系统能够最终选定该提案，因此 Acceptor 必须批准它见到的第一个提案。
2. 由于每个 Acceptor 都必须批准它见到的第一个提案，但在存在多个提案的情况下，没办法保证它批准的第一个提案就是系统最终选定的提案，因此 Acceptor 必须能够批准多个提案。
3. 由于 acceptor 之间没有互相交流，因此它不可能知道自己的值是否就是最终值，因此当它批准过一个提案，并且接到一个新的提案后，它不知道自己是不是应该批准新的提案，如果自己当前批准的是最终值，则批准新提案会破坏 safety 属性，但如果新提案是最终值，不批准会破坏 liveness 属性。因此 acceptor 需要额外的信息，比如说每个提案都加一个 id，如果 id 大于目前批准的提案 id 就批准，不然就拒绝。

(这里需要使用一个全局唯一的 id 来区分不同的提案)

4. 对于 proposer 来说，新提案的提出必须保证两点
    1. 该提案有可能被批准，即大多数 acceptors 还没有批准过 id 更高的提案，举例来说，如果系统中大多数 acceptors 批准过 id 大于 10 的提案，这是提出一个 id 为 9 的提案是不可能生效的。
        为了实现这一点，proposal 在提案生成前需要询问 acceptors 某个 id 是否可能被批准，如果多数 acceptors 认为可以，才使用该 id，否则使用一个更大的 id 重复该过程。

    2. 该提案不会破坏 safety 属性，即如果大多数人已经同意了提案10，该提案不会改变该值。
    <!-- 因此每次提出提案前需要查询当前 acceptors 的状态，对于 acceptors 集合而言，一共有四种状态，即初始状态，已经选中状态，共识状态。 -->
        为了实现这点，在提案生成前需要询问 acceptors 最近接收过的提案，并使用其中提案 id 最大的那个提案值，作为新提案的值
        假设处于状态：[2 Joffrey], [4 Joffrey], [x Cersei], 根据 1,2,3 和 safety 属性判断， x 的值一定小于2。

    引入即将选中状态，
    3. 该提案不会破坏 safety 属性，即如果大多数人即将同意提案10，该提案不会改变该值。
    假设查询返回状态：[2 Tywin], [3 Joffrey], [4 Cersei], 按照目前已有的约束，生成提案 [5 Cersei] 是安全的。但是如果 acceptor1 在返回 [2 Tywin] 后立刻收到了 [3 Joffrey]，则 Joffrey 将被选中，这时 [5 Cersei] 提案依然会破坏系统的 safety 属性。
    为了防止这种现象发生，我们要求一旦询问结束后，acceptor 就不能再批准比该次询问 id 小的提案。

    4. 现在，假设查询返回了状态，[agree 5, 2 Tywin], [agree 5, 3 Joffrey], [agree 5, 4 Cersei]， acceptor1 在返回 [agree 5, 2 Tywin] 后立刻收到了 [3 Joffrey]，它将不再批准 Joffrey 值，但这并不会阻止另一个 proposer 生成 [6 Joffrey] 提案，如果这个过程一直重复，
    则永远不能达成共识，这时一个比较直观的解决办法是，每个 proposer 在发出 prepare 请求前先 delay 一段随机的时间，让另一个提案有机会提交成功。


### Paxos made simple

### Paxos made live
1. 先在任务发布者中推举一个发言人，只有该发言人能够发布任务
    1. 选举过程类似于发布任务的过程，它向所有 acceptors 发送消息，如果大多数 acceptor 没有见过更高的 prolocutor_id，则它可以作为 prolocutor。
2. prepare 阶段，acceptor 返回最近接受的提案值和该值对应的 prolocutor_id， prolocutor 在这里的作用类似用之前的 proposal_id

> For example, in a system with n replicas, assign each replica r a unique id i between 0 and n − 1. Replica r picks the
r smallest sequence number s larger than any it has seen such that s mod n = i r .

#### Multi-Paxos
The Paxos algorithm as described thus far requires
all message senders to log their state before sending messages – thus the algorithm requires a sequence of
five writes (for each of the propose, promise, accept, acknowledgment, and commit messages) to disk on its
critical path. Note that all writes have to be flushed to disk immediately before the system can proceed any
further. In a system where replicas are in close network proximity, disk flush time can dominate the overall
latency of the implementation.
There is a well-known optimization to reduce the number of messages involved by chaining together
multiple Paxos instances [9]. Propose messages may be omitted if the coordinator identity does not change
between instances. This does not interfere with the properties of Paxos because any replica at any time
can still try to become coordinator by broadcasting a propose message with a higher sequence number. In
order to avail itself of this optimization, a Multi-Paxos algorithm may be designed to pick a coordinator for
long periods of time, trying not to let the coordinator change. We refer to this coordinator as the master.
With this optimization, the Paxos algorithm only requires a single write to disk per Paxos instance on each
replica, executed in parallel with each other. The master writes to disk immediately after sending its accept
message and other replicas write to disk prior to sending their acknowledge message.



### Reference
- Paxos made simple
- Paxos made live
- [Why is multi-paxos called multi-paxos?](https://stackoverflow.com/questions/26589137/why-is-multi-paxos-called-multi-paxos)