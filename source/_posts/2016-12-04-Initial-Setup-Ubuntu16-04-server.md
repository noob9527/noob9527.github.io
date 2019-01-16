---
title: Initial Setup Ubuntu16.04 server
categories: System
tags:
  - Linux
photos: /img/ubuntu16_04_server.jpg
date: 2016-12-04 11:44:13
permalink: /initial-setup-Ubuntu-16.04-server
---


> 这篇文章算是[安装ubuntu16.04后要做的9件事](http://blog.staynoob.cn/post/linux/initial-setup-ubuntu-16.04-desktop/)的姊妹篇，区别是上篇文章针对的是ubuntu桌面版，这篇文章针对ubuntu16.04 server版。

### 一.配置用户
1. 连接主机
	在进行所有操作之前，首先确保你知道主机的外网IP，并且拥有root账户，以上信息一般由各主机提供商提供。在知道以上讯息后可以直接在终端通过以下命令登陆服务器
    ```bash
    ssh root@your_server_ip
    ```
2. 新增账户
	linux通用的新增，删除用户命令分别是`useradd`, `userdel`，但是ubuntu有一个更方便的新增用户命令`adduser`，使用`adduser`命令会以交互式询问的方式来设定用户参数，包括新用户的密码，而使用useradd则需要通过命令行参数的方式来设定选项(如是否需要新建用户目录等)，另外如果使用`useradd`，还要额外通过`passwd`命令来设定新用户的密码。这里建议直接使用`adduser`，以新增用户xy为例，输入
    ```bash
    adduser xy
    ```
    除了输入新用户的密码外，该命令还会询问一些额外信息，可以直接按*enter*键跳过。
3. 添加sudo权限
	在ubuntu系统中，将用户添加到sudo用户组会自动获得sudo命令的执行权限，这里可以使用
    ```bash
    usermod -aG sudo xy
    ```
    或者
	```bash
    gpasswd -a xy sudo
    ```
    来将xy添加到sudo用户组。至此用户配置就已经完成了，以下列一些其它与用户相关的命令
    ```bash
    passwd xy #为xy账户设定密码
    userdel xy #删除xy账户
    groupadd test #新增test工作组
    groupdel test #删除test工作组
    gpasswd -d xy sudo #将xy移除sudo用户组
    ```

<!-- more -->
### 二.配置ssh
现在已经可以使用xy身份来登陆主机了，但是每次登陆都需要输入密码有些繁琐，可以在自己的常用机器上配置SSH key来跳过这个步骤。
1. 生成ssh key
	如果你的*本地机器*已经生成了ssh key可以跳过这个步骤(ssh key通常在用户主目录的.ssh文件夹下)，如果还没有，则可以直接通过如下命令生成
    ```bash
    ssh-keygen
    ```
    正常情况下会看到如下输出
    ```bash
    Generating public/private rsa key pair.
    Enter file in which to save the key (/Users/xy/.ssh/id_rsa):
    ```
    这里可以指定生成key所存放的路径，一般直接按回车使用默认路径就好了，之后程序会提示你输入“passphrase”，同样可以直接按回车键跳过这一步。如果这一步选择跳过，则私钥可以直接使用，如果你输入了passphrase，则每次使用私钥的时候还需要提供这里输入的passphrase。
    完成以上步骤后会在用户目录的.ssh文件夹下看到id_rsa(私钥)与id_rsa.pub(公钥)
2. ubuntu服务器授权生成的ssh key
	首先登陆服务端，进入xy的用户主目录，使用如下命令新建.ssh文件夹
    ```bash
    mkdir .ssh && chmod 700 .ssh
    ```
    再新建authorized_keys文件，将之前生成的id_rsa.pub文件的内容拷贝进去就好了。
    ```bash
    vim ~/.ssh/authorized_keys #将公钥copy到该文件
    chmod 600 ~/.ssh/authorized_keys
    ```
    以上过程多少有些麻烦，如果你的本地机器也是ubuntu16.04，则可以直接使用内建的ssh-copy-id脚本来完成上述工作，具体的命令如下
    ```bash
    ssh-copy-id xy@your_server_ip
    ```

至此，每次使用完成该配置的机器登陆ubuntu服务器就不用再提供密码了，顺便提一句，如果本机的用户名与ubuntu服务器上的用户名一致，则用户名也可以省略，登陆命令简化成
```bash
ssh your_server_ip
```

### 三.Tips
ubuntu14.04使用init.d管理服务(daemon)，而ubuntu16.04已经换成了systemd，这里以mysql服务为例简单列一下二者在日常操作上的区别
- init.d
	```bash
    sudo /etc/init.d/mysql start
    sudo /etc/init.d/mysql restart
    sudo /etc/init.d/mysql stop
    sudo /etc/init.d/mysql status
    #或者
    sudo service mysql start   #启动
    sudo service mysql restart #重启
    sudo service mysql stop    #停止
    sudo service mysql status  #查看状态
    ```
- systemd
	```bash
    systemctl start mysql     #启动
    systemctl stop mysql      #停止
    systemctl status mysql    #查看状态
    systemctl enable mysql    #开机启动
    journalctl -u mysql       #查看日志
    ```
