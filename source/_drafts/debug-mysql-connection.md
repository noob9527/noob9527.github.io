### Too many connections error
`show variables like "max_connections";`
```bash
'max_connections', '100'
```
`show status where variable_name like '%Max_used_connections%';`
```bash
'Max_used_connections', '100'
'Max_used_connections_time', '2023-07-05 02:44:25'
```
possibly fix, in `/etc/my.cnf`
```
[mysqld]
max_connections=[desired new maximum number]
```
to check out connections used by each user run `show processlist`.
if you also want to perform group by or order by, use `SELECT * FROM INFORMATION_SCHEMA.PROCESSLIST`

### java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30181ms.
possibly fix, in `application.properties`
```yaml
datasource: 
    url: jdbc:mysql://localhost:3306
    username: root
    password: root
    type: com.zaxxer.hikari.HikariDataSource
    maximum-pool-size: 30   # increase maximum pool size.
```

### latest detected dead lock
`SHOW ENGINE INNODB STATUS`;

### find slow sql statement
```sql
select * from sys.`x$statement_analysis`;
```


### reference:
- https://github.com/brettwooldridge/HikariCP
- https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing