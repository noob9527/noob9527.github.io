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

#### systemd-resolve
dns lookup
```bash
systemd-resolve hostname
```
set domain
```bash
sudo systemd-resolve -i tun0 --set-domain=~.
```
revert setting(reset to default)
```bash
sudo systemd-resolve -i tun0 --revert
```
> An even different approach could be to 'natively' support the DHCP option DOMAIN-ROUTE as is done by the often recommended openvpn-systemd-resolved script.

Note: 目前无法直接使用 networkmanager-openvpn-gnome
- [github issue](https://github.com/systemd/systemd/issues/6076)
- [update-systemd-resolved](https://github.com/jonathanio/update-systemd-resolved)

#### .local 与 mdns
第二个问题是.local 域，需要在nsswitch.conf 中关掉 mdns4

#### nslookup 与 dig
##### systemd-resolve
```bash
systemd-resolve hostname
```
##### nslookup
```bash
nslookup hostname
nslookup hostname dns-server
```
##### dig
```bash
dig A hostname
dig A hostname @dns-server
```

#### reference
- [Cannot Ping, nor Curl, but Nslookup works](https://unix.stackexchange.com/questions/289930/cannot-ping-nor-curl-but-nslookup-works)
- [DNS leak when using systemd-resolved](https://gitlab.gnome.org/GNOME/NetworkManager-openvpn/issues/10)
- [systemd-resolved.service](https://www.freedesktop.org/software/systemd/man/systemd-resolved.service.html)

#### conclusion
1. 由于需要执行`up /etc/openvpn/update-systemd-resolved`, 无法直接使用 networkmanager-openvpn-gnome。
2. ubuntu18.04 应该安装 `sudo apt install openvpn-systemd-resolved` (for systemd-resolve)
3. 需要在配置中加上`dhcp-option DOMAIN-ROUTE .`来解决 dns leak 问题。
4. 解决以上问题后，还是无法直接使用类似于 `servicename.default.svc.cluster.local/` 来访问 k8s 中的服务，但 nslookup 已经能够正确找到 service 的 ip. 需要从 `/etc/nsswitch.conf` 中移除 `mdns4_minimal [NOTFOUND=return]`

### Update disabled Fcitx input?
[Update disabled Fcitx input? - Ubuntu2019.3](https://intellij-support.jetbrains.com/hc/en-us/community/posts/360006740379-2019-3-Update-disabled-Fcitx-input-Ubuntu?flash_digest=6508f446c1ae20d00853e86b54dff384450d6c21)

### Weird mysql
```sql
select '0a' = 0;    -- true
select 'a' = 0;     -- true
select '0a' = 'a';  -- false

select '1a' + '2b'; -- 3

select 'false' = 0; -- true
select 'true' = 0;  -- true
select '1ab' = 1;   -- true
```
- [mysql: why comparing a 'string' to 0 gives true?](https://stackoverflow.com/questions/22080382/mysql-why-comparing-a-string-to-0-gives-true)

