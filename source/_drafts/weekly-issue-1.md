---
title: weekly-issue-1
categories: weekly issue
tags: quick notes
photos:
permalink:
---

> 随着时间越来越碎片化，我发现自己已经很难有精力去写一些有深度的文章（这里的深度只是对自己而言的）。不仅如此，由于记忆力的衰退，所以，

### Ubuntu 18.04
首次安装 18.04 桌面版后，最让我不习惯的就是它移掉了传统的开始菜单，而是改用了一个占全屏的菜单（就像 windows8 的菜单一样让人难受），好在通过一些 gnome extension 又找回了熟悉的感觉。下面是我目前安装的扩展:
- [dash-to-panel](https://github.com/home-sweet-gnome/dash-to-panel)
- [arc-menu](https://extensions.gnome.org/extension/1228/arc-menu/)
- [system-monitor](https://github.com/paradoxxxzero/gnome-shell-system-monitor-applet)
- [topicons](https://extensions.gnome.org/extension/1031/topicons/)
- [open-weather](https://extensions.gnome.org/extension/750/openweather/)

其它基本还是熟悉的味道，目前体验还不错。

### VPN 与 DNS
事情的起因大致是，我需要通过 OpenVPN 连到 k8s 的内部网络，并且我希望可以通过 k8s 的 dns 服务来通过 service name 访问各个容器组。

#### .local 与 mdns
#### systemd-resolve
networkmanager-openvpn-gnome
- [github issue](https://github.com/systemd/systemd/issues/6076)
- [update-systemd-resolved](https://github.com/jonathanio/update-systemd-resolved)
#### nslookup 与 dig
