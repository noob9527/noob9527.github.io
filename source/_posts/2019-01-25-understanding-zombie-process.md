---
title: Understanding Zombie Process
categories: System
tags:
  - UNIX
photos: /img/understanding-zombie-process.jpg
date: 2019-01-25 06:54:28
---


> As a programmer, I usually feel uncomfortable when `top` command reports there're zombie processes running on my computer. After some study, I found that the zombie process is not as scary as my thought. This article briefly introduces the zombie process in UNIX-like systems.

### What is a "zombie process"?
> "In UNIX System terminology, a process that has terminated, but whose parent has not yet waited for it, is called a zombie."

After we create a process via `fork` function, we get a parent process and a child process. The parent process sometimes needs to know how the child is terminated. In normal cases, we call `wait` or `waitpid` to fetch the termination status. However, a child process could terminate before its parent waits for it. In such a case, If the system cleared the child's information completely, its parent wouldn't be able to know its status. As a result, the kernel has to keep a small amount of information after a process terminates. A process like this that has been terminated, but not completely disappear, is called a zombie process.
> Note that zombie processes should not be confused with orphan processes: an orphan process is a process that is still executing, but whose parent has died. These do not remain as zombie processes; instead, (like all orphaned processes) they are adopted by `init`, which waits on its children. The result is that a process that is both a zombie and an orphan will be reaped automatically.

<!-- more -->

### How to produce a "zombie process"?
Before we create a zombie process, we need to know how to identify a zombie process. The `ps` command prints the state of a zombie process as Z. We can also fetch the state of a process with the command below
```bash
cat /proc/{pid}/status | grep state
```
In our example, we run above command programmatically to print the state of a process, the function will look like:
```c
int print_process_state(pid_t pid) {
    char cmdstring[80];
    char *end = cmdstring;
    end += sprintf(end, "%s", "cat /proc/");
    end += sprintf(end, "%ld", (long) pid);
    sprintf(end, "%s", "/status | grep State");

    puts(cmdstring);
    system(cmdstring);
}
```
The example is pretty straightforward, we `fork` a process, then let parent process sleep one second so that the child process will terminate first.
```c
int main(void) {
    pid_t pid;

    if ((pid = fork()) > 0) {
        sleep(1); // let child terminates first
        // print the state of child process
        print_process_state(pid); // => Zombie
    } else if (pid == 0) {
        // this process will become a zombie process after return statement
        printf("child proceess pid = %ld\n", (long) getpid());
    }

    return 0;
}
```

### How to avoid producing "zombie process"?
Although the kernel will only keep a small amount of information for a zombie process, We should still avoid producing them, there're several ways to accomplish this.

#### `wait` and `waitpid` functions
The most trivial way to avoid zombie process is to call wait function after a child process terminates. However, the wait function will block the caller until a child process terminates. If you don't want your program to be blocked, you can call wait function in a `SIGCHLD` signal handler. The wait function will return immediately if there's a child process is waiting for its status to be fetched.
```c
static void sig_chld_handler(int signo) {
    if (signo == SIGCHLD) {
        pid_t pid = wait(NULL);
        if (pid > 0) printf("received SIGCHLD from child process pid = %d\n", pid);
    }
}

/**
 * avoid producing zombie processing by calling one of the wait functions
 */
int main(void) {
    pid_t pid;

    signal(SIGCHLD, sig_chld_handler);

    if ((pid = fork()) > 0) {
        sleep(2); // let child terminates first
        print_process_state(pid);   // prints error since the child process is completely cleared
    } else if (pid == 0) {
        // this process won't become a zombie process
        printf("child process pid = %ld\n", (long) getpid());
    }

    return 0;
}
```

#### Explicitly ignore `SIGCHLD` signal
Although the `SIGCHLD` signal is ignored by default, you have to ignore it explicitly to tell the kernel you really don't care how your children processes are terminated, so there's no need to keep any information of a terminated child process, which means there's no need to keep a zombie process.
```c
int main(void) {
    signal(SIGCHLD, SIG_IGN);
    // fork code
}
```

#### Call `fork` twice
Knowing that a child process will be inherited by `init` process if its parent is terminated, and the `init` process is written so that whenever its children terminate, it calls one of the wait function to fetch the termination status. We can avoid zombie process by only creating "orphan process", the trick is call fork twice and have the first child terminated directly.
```c
/**
 * avoid producing zombie processing by calling fork twice
 */
int main(void) {
    pid_t pid;

    if ((pid = fork()) == 0) {
        /* first child */
        if (fork() > 0) {
            /* parent from second fork == first child */
            exit(0);
        }

        /*
         * We're the second child; our parent becomes init as soon
         * as our real parent calls exit() in the statement above.
         * Here's where we'd continue executing, knowing that when
         * we're done, init will reap our status.
         */
        sleep(2);
        printf("second child, parent pid = %ld\n", (long) getppid());
        exit(0);
    }

    waitpid(pid, NULL, 0);    /* wait for first child */

    /*
     * We're the parent (the original process); we continue executing,
     * knowing that we're not the parent of the second child.
     */
    return 0;
}
```

### Reference
- Advanced Programming in the UNIX Environment(AKA APUE)
- [Zombie process](https://en.wikipedia.org/wiki/Zombie\_process)
