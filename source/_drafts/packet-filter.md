```
cd /etc/pf.anchors
```

/etc/pf.anchors/block_honeypot
```
block return log (all) from any to 192.168.5.29
```

```
pfctl -nf /etc/pf.conf
```
-n: "no action" - 不执行模式

只检查配置文件的语法，不实际应用规则
类似于"干跑"（dry run），用于验证配置是否正确
如果有语法错误会显示错误信息，如果正确则静默通过

-f: "file" - 指定配置文件

告诉 pfctl 从哪个文件读取规则配置
通常是 /etc/pf.conf（默认配置文件）

组合效果: 检查 /etc/pf.conf 文件的语法是否正确，但不实际加载规则

```
sudo pfctl -e
```
-e: "enable" - 启用 packet filter

激活整个 pf 防火墙系统
如果 pf 已经启用，这个命令不会有副作用
类似于"开启防火墙开关"

作用: 启用 macOS 的 packet filter 防火墙功能

```
sudo pfctl -f /etc/pf.conf
```
-f: "file" - 从文件加载规则

读取指定配置文件并将其中的规则加载到内核中
会替换当前活跃的规则集
这时规则真正生效

作用: 将 /etc/pf.conf 中的规则实际应用到系统中

```bash
# 查看当前规则
sudo pfctl -sr

# 查看状态信息
sudo pfctl -si

# 禁用 pf
sudo pfctl -d

# 清空所有规则
sudo pfctl -F all

# 重新加载规则（相当于 -f）
sudo pfctl -f /etc/pf.conf

# 显示被阻止的包统计
sudo pfctl -vsr
```

# Enable the PF logging daemon pflogd
```bash
sudo ifconfig pflog0 create
```
```bash
# sudo tcpdump -i pflog0
sudo tcpdump -n -e -ttt -i pflog0
```


## reference
https://apple.stackexchange.com/questions/110865/packet-filter-pf-firewall-logging